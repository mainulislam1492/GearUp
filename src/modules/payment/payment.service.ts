import crypto from "crypto";
import SSLCommerzPayment from "sslcommerz-lts";
import Stripe from "stripe";
import { PaymentProvider, PaymentStatus, RentalStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { CreatePaymentPayload, PaymentCustomer } from "./payment.interface";

// Stripe currency (the order amount is used as it is in this currency).
// For a real BDT -> USD conversion, apply your own rate before creating the session.
const STRIPE_CURRENCY = "usd";
const SSLCOMMERZ_CURRENCY = "BDT";

const getSslcommerz = () =>
    new SSLCommerzPayment(
        config.sslcommerz_store_id,
        config.sslcommerz_store_password,
        config.sslcommerz_is_live === "true"
    );

// ---------- shared helpers ----------
const completePayment = async (transactionId: string, method: string, gatewayResponse: any) => {
    const payment = await prisma.payment.findUniqueOrThrow({
        where: { transactionId }
    });

    // already processed (gateways can call more than once)
    if (payment.status === PaymentStatus.COMPLETED) {
        return payment;
    }

    return prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
            where: { id: payment.id },
            data: {
                status: PaymentStatus.COMPLETED,
                paidAt: new Date(),
                method,
                gatewayResponse
            }
        });

        // CONFIRMED -> PAID
        await tx.rentalOrder.updateMany({
            where: { id: payment.rentalOrderId, status: RentalStatus.CONFIRMED },
            data: { status: RentalStatus.PAID }
        });

        return updatedPayment;
    });
};

const failPayment = async (transactionId: string, gatewayResponse?: any) => {
    // only a pending payment can fail, order stays CONFIRMED so the customer can retry
    await prisma.payment.updateMany({
        where: { transactionId, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.FAILED, gatewayResponse }
    });
};

// ---------- create payment ----------
const createPaymentIntoDB = async (customer: PaymentCustomer, payload: CreatePaymentPayload) => {
    const { rentalOrderId, provider } = payload;

    if (!rentalOrderId || !provider) {
        throw new Error("rentalOrderId and provider are required");
    }

    if (provider !== PaymentProvider.STRIPE && provider !== PaymentProvider.SSLCOMMERZ) {
        throw new Error("Invalid payment provider. Use STRIPE or SSLCOMMERZ");
    }

    const order = await prisma.rentalOrder.findFirst({
        where: { id: rentalOrderId, customerId: customer.id },
        include: {
            items: { include: { gearItem: { select: { name: true } } } }
        }
    });

    if (!order) {
        throw new Error("Rental order not found");
    }

    if (order.status !== RentalStatus.CONFIRMED) {
        throw new Error(`Payment is allowed only for CONFIRMED orders. Current status: ${order.status}`);
    }

    const amount = Number(order.totalAmount);
    const transactionId = `GEARUP-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const payment = await prisma.payment.create({
        data: {
            transactionId,
            rentalOrderId: order.id,
            customerId: customer.id,
            amount,
            currency: provider === PaymentProvider.STRIPE ? STRIPE_CURRENCY.toUpperCase() : SSLCOMMERZ_CURRENCY,
            provider,
            status: PaymentStatus.PENDING
        }
    });

    try {
        // ----- Stripe Checkout -----
        if (provider === PaymentProvider.STRIPE) {
            const session = await stripe.checkout.sessions.create({
                mode: "payment",
                customer_email: customer.email,
                line_items: [
                    {
                        quantity: 1,
                        price_data: {
                            currency: STRIPE_CURRENCY,
                            unit_amount: Math.round(amount * 100),
                            product_data: {
                                name: `GearUp rental order #${order.id}`,
                                description: order.items.map((item) => item.gearItem.name).join(", ")
                            }
                        }
                    }
                ],
                metadata: { transactionId, rentalOrderId: order.id },
                success_url: `${config.app_url}/payment/success?transactionId=${transactionId}`,
                cancel_url: `${config.app_url}/payment/cancel?transactionId=${transactionId}`
            });

            await prisma.payment.update({
                where: { id: payment.id },
                data: { gatewayResponse: { sessionId: session.id } }
            });

            return { paymentUrl: session.url, transactionId, provider };
        }

        // ----- SSLCommerz -----
        const profile = await prisma.profile.findUnique({
            where: { userId: customer.id }
        });

        const sslcz = getSslcommerz();

        const apiResponse = await sslcz.init({
            total_amount: amount,
            currency: SSLCOMMERZ_CURRENCY,
            tran_id: transactionId,
            success_url: `${config.server_url}/api/payments/sslcommerz/success`,
            fail_url: `${config.server_url}/api/payments/sslcommerz/fail`,
            cancel_url: `${config.server_url}/api/payments/sslcommerz/cancel`,
            shipping_method: "NO",
            product_name: `GearUp rental order #${order.id}`,
            product_category: "Rental",
            product_profile: "general",
            cus_name: customer.name,
            cus_email: customer.email,
            cus_add1: profile?.address ?? "N/A",
            cus_city: "Chattogram",
            cus_postcode: "4000",
            cus_country: "Bangladesh",
            cus_phone: profile?.phone ?? "01700000000"
        });

        if (!apiResponse?.GatewayPageURL) {
            throw new Error("Failed to start SSLCommerz payment session");
        }

        return { paymentUrl: apiResponse.GatewayPageURL as string, transactionId, provider };
    } catch (error) {
        await failPayment(transactionId, { error: (error as Error).message });
        throw error;
    }
};

// ---------- Stripe webhook ----------
const handleStripeEvent = async (event: Stripe.Event) => {
    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const transactionId = session.metadata?.transactionId;

            if (!transactionId || session.payment_status !== "paid") {
                return;
            }

            const payment = await prisma.payment.findUnique({ where: { transactionId } });

            if (!payment) {
                return;
            }

            // amount from the gateway must match the amount we stored
            if (session.amount_total !== Math.round(Number(payment.amount) * 100)) {
                await failPayment(transactionId, { reason: "Amount mismatch", sessionId: session.id });
                return;
            }

            await completePayment(transactionId, session.payment_method_types?.[0] ?? "card", {
                sessionId: session.id,
                paymentIntent: session.payment_intent
            });
            break;
        }

        case "checkout.session.expired":
        case "checkout.session.async_payment_failed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const transactionId = session.metadata?.transactionId;

            if (transactionId) {
                await failPayment(transactionId, { sessionId: session.id, event: event.type });
            }
            break;
        }

        default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
    }
};

// ---------- SSLCommerz callbacks ----------
const handleSslcommerzSuccess = async (body: any) => {
    const { tran_id, val_id } = body;

    if (!tran_id || !val_id) {
        throw new Error("tran_id and val_id are required");
    }

    const payment = await prisma.payment.findUniqueOrThrow({
        where: { transactionId: tran_id }
    });

    if (payment.status === PaymentStatus.COMPLETED) {
        return { transactionId: tran_id, success: true };
    }

    // verify with SSLCommerz, never trust the callback body alone
    const sslcz = getSslcommerz();
    const validation = await sslcz.validate({ val_id });

    const isValid =
        (validation?.status === "VALID" || validation?.status === "VALIDATED") &&
        validation?.tran_id === tran_id &&
        Number(validation?.amount) === Number(payment.amount);

    if (!isValid) {
        await failPayment(tran_id, validation);
        return { transactionId: tran_id, success: false };
    }

    await completePayment(tran_id, validation.card_type ?? "sslcommerz", validation);

    return { transactionId: tran_id, success: true };
};

const handleSslcommerzFailure = async (body: any) => {
    const { tran_id } = body;

    if (tran_id) {
        await failPayment(tran_id, body);
    }

    return { transactionId: tran_id };
};

// ---------- confirm after redirect (works without the webhook) ----------
const confirmStripePaymentInDB = async (customerId: string, transactionId: string) => {
    if (!transactionId) {
        throw new Error("transactionId is required");
    }

    const payment = await prisma.payment.findFirst({
        where: { transactionId, customerId }
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    if (payment.provider !== PaymentProvider.STRIPE) {
        throw new Error("This payment was not made with Stripe");
    }

    if (payment.status === PaymentStatus.COMPLETED) {
        return { transactionId, status: payment.status };
    }

    const sessionId = (payment.gatewayResponse as { sessionId?: string } | null)?.sessionId;

    if (!sessionId) {
        throw new Error("Stripe session not found for this payment");
    }

    // ask Stripe directly, never trust the browser
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
        throw new Error("Payment has not been completed on Stripe yet");
    }

    if (session.amount_total !== Math.round(Number(payment.amount) * 100)) {
        await failPayment(transactionId, { reason: "Amount mismatch", sessionId });
        throw new Error("Payment amount mismatch");
    }

    const completedPayment = await completePayment(
        transactionId,
        session.payment_method_types?.[0] ?? "card",
        { sessionId, paymentIntent: session.payment_intent }
    );

    return { transactionId, status: completedPayment.status };
};

// ---------- history ----------
const getMyPaymentsFromDB = async (customerId: string) => {
    const payments = await prisma.payment.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
        omit: { gatewayResponse: true },
        include: {
            rentalOrder: {
                select: { id: true, status: true, totalAmount: true, startDate: true, endDate: true }
            }
        }
    });

    return payments;
};

const getPaymentByIdFromDB = async (customerId: string, paymentId: string) => {
    const payment = await prisma.payment.findFirst({
        where: { id: paymentId, customerId },
        omit: { gatewayResponse: true },
        include: {
            rentalOrder: {
                include: {
                    items: { include: { gearItem: { select: { id: true, name: true, images: true } } } }
                }
            }
        }
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    return payment;
};

export const paymentService = {
    createPaymentIntoDB,
    confirmStripePaymentInDB,
    handleStripeEvent,
    handleSslcommerzSuccess,
    handleSslcommerzFailure,
    getMyPaymentsFromDB,
    getPaymentByIdFromDB
};