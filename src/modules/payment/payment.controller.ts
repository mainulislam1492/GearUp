import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config";
import { stripe } from "../../lib/stripe";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customer = {
        id: req.user?.id as string,
        name: req.user?.name as string,
        email: req.user?.email as string
    };

    const result = await paymentService.createPaymentIntoDB(customer, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Payment session created successfully",
        data: result
    });
});

const confirmStripePayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;

    const result = await paymentService.confirmStripePaymentInDB(customerId, req.body.transactionId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment confirmed successfully",
        data: result
    });
});

// Stripe calls this endpoint (raw body is required for signature verification)
const stripeWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["stripe-signature"] as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            config.stripe_webhook_secret as string
        );
    } catch (error: any) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: `Webhook signature verification failed: ${error.message}`
        });
    }

    await paymentService.handleStripeEvent(event);

    res.status(httpStatus.OK).json({ received: true });
});

// SSLCommerz redirects the customer's browser here, then we redirect to the frontend
const sslcommerzSuccess = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await paymentService.handleSslcommerzSuccess(req.body);

    res.redirect(
        `${config.app_url}/payment/${result.success ? "success" : "failed"}?transactionId=${result.transactionId}`
    );
});

const sslcommerzFail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await paymentService.handleSslcommerzFailure(req.body);

    res.redirect(`${config.app_url}/payment/failed?transactionId=${result.transactionId}`);
});

const sslcommerzCancel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await paymentService.handleSslcommerzFailure(req.body);

    res.redirect(`${config.app_url}/payment/cancel?transactionId=${result.transactionId}`);
});

const getMyPayments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;

    const payments = await paymentService.getMyPaymentsFromDB(customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment history fetched successfully",
        data: { payments }
    });
});

const getPaymentById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const paymentId = req.params.id as string;

    const payment = await paymentService.getPaymentByIdFromDB(customerId, paymentId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment details fetched successfully",
        data: { payment }
    });
});

export const paymentController = {
    createPayment,
    confirmStripePayment,
    stripeWebhook,
    sslcommerzSuccess,
    sslcommerzFail,
    sslcommerzCancel,
    getMyPayments,
    getPaymentById
};