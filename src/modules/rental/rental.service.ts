import { Prisma } from "../../../generated/prisma/client";
import { GearStatus, RentalStatus, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { CreateRentalPayload, RentalQuery } from "./rental.interface";

// orders in these statuses are holding stock
const STOCK_HOLDING_STATUSES = [
    RentalStatus.PLACED,
    RentalStatus.CONFIRMED,
    RentalStatus.PAID,
    RentalStatus.PICKED_UP
];

const DAY_MS = 24 * 60 * 60 * 1000;

const toDateOnly = (value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid date. Use the format YYYY-MM-DD");
    }

    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};

const round2 = (value: number) => Math.round(value * 100) / 100;

const orderInclude = {
    items: {
        include: {
            gearItem: {
                select: { id: true, name: true, brand: true, images: true }
            }
        }
    },
    provider: {
        select: {
            id: true,
            name: true,
            profile: { select: { shopName: true, shopAddress: true, phone: true } }
        }
    }
} satisfies Prisma.RentalOrderInclude;

const createRentalOrderIntoDB = async (customerId: string, payload: CreateRentalPayload) => {
    const { items, startDate, endDate, notes } = payload;

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("At least one item is required");
    }

    if (!startDate || !endDate) {
        throw new Error("startDate and endDate are required");
    }

    for (const item of items) {
        if (!item.gearItemId || !Number.isInteger(item.quantity) || item.quantity < 1) {
            throw new Error("Each item needs a gearItemId and a quantity of 1 or more");
        }
    }

    const gearIds = items.map((item) => item.gearItemId);

    if (new Set(gearIds).size !== gearIds.length) {
        throw new Error("The same gear can't be added twice. Increase the quantity instead");
    }

    const start = toDateOnly(startDate);
    const end = toDateOnly(endDate);
    const today = toDateOnly(new Date().toISOString());

    if (start < today) {
        throw new Error("Start date can't be in the past");
    }

    if (end < start) {
        throw new Error("End date can't be before start date");
    }

    // both start and end day are counted (Jan 1 to Jan 3 = 3 days)
    const totalDays = Math.round((end.getTime() - start.getTime()) / DAY_MS) + 1;

    const order = await prisma.$transaction(async (tx) => {
        const gears = await tx.gearItem.findMany({
            where: { id: { in: gearIds } },
            include: { provider: { select: { status: true } } }
        });

        if (gears.length !== gearIds.length) {
            throw new Error("One or more gear items were not found");
        }

        const providerId = gears[0]!.providerId;
        let totalAmount = 0;

        const orderItems: {
            gearItemId: string;
            quantity: number;
            pricePerDay: number;
            subtotal: number;
        }[] = [];

        for (const item of items) {
            const gear = gears.find((g) => g.id === item.gearItemId)!;

            if (
                gear.status !== GearStatus.ACTIVE ||
                !gear.isAvailable ||
                gear.provider.status !== UserStatus.ACTIVE
            ) {
                throw new Error(`"${gear.name}" is not available for rent`);
            }

            if (gear.providerId !== providerId) {
                throw new Error("All items in one order must be from the same provider");
            }

            // quantity already booked by overlapping orders
            const booked = await tx.rentalItem.aggregate({
                _sum: { quantity: true },
                where: {
                    gearItemId: gear.id,
                    rentalOrder: {
                        status: { in: STOCK_HOLDING_STATUSES },
                        startDate: { lte: end },
                        endDate: { gte: start }
                    }
                }
            });

            const available = gear.stockQuantity - (booked._sum.quantity ?? 0);

            if (item.quantity > available) {
                throw new Error(
                    `Only ${Math.max(available, 0)} unit(s) of "${gear.name}" available for the selected dates`
                );
            }

            // price always comes from the database, never from the client
            const pricePerDay = Number(gear.pricePerDay);
            const subtotal = round2(pricePerDay * item.quantity * totalDays);

            totalAmount += subtotal;

            orderItems.push({
                gearItemId: gear.id,
                quantity: item.quantity,
                pricePerDay,
                subtotal
            });
        }

        return tx.rentalOrder.create({
            data: {
                customerId,
                providerId,
                startDate: start,
                endDate: end,
                totalDays,
                totalAmount: round2(totalAmount),
                notes,
                items: { create: orderItems }
            },
            include: orderInclude
        });
    });

    return order;
};

const getMyRentalOrdersFromDB = async (customerId: string, query: RentalQuery) => {
    const { status } = query;

    if (status && !Object.values(RentalStatus).includes(status as RentalStatus)) {
        throw new Error("Invalid status filter");
    }

    const orders = await prisma.rentalOrder.findMany({
        where: {
            customerId,
            status: status as RentalStatus | undefined
        },
        orderBy: { createdAt: "desc" },
        include: orderInclude
    });

    return orders;
};

const getRentalOrderByIdFromDB = async (customerId: string, orderId: string) => {
    const order = await prisma.rentalOrder.findFirst({
        where: { id: orderId, customerId },
        include: {
            ...orderInclude,
            payments: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    transactionId: true,
                    amount: true,
                    provider: true,
                    status: true,
                    paidAt: true,
                    createdAt: true
                }
            },
            reviews: {
                select: { id: true, gearItemId: true, rating: true, comment: true }
            }
        }
    });

    if (!order) {
        throw new Error("Rental order not found");
    }

    return order;
};

const cancelRentalOrderInDB = async (customerId: string, orderId: string) => {
    const order = await prisma.rentalOrder.findFirst({
        where: { id: orderId, customerId }
    });

    if (!order) {
        throw new Error("Rental order not found");
    }

    if (order.status !== RentalStatus.PLACED) {
        throw new Error(`Only PLACED orders can be cancelled. Current status: ${order.status}`);
    }

    const cancelledOrder = await prisma.rentalOrder.update({
        where: { id: orderId },
        data: { status: RentalStatus.CANCELLED },
        include: orderInclude
    });

    return cancelledOrder;
};

export const rentalService = {
    createRentalOrderIntoDB,
    getMyRentalOrdersFromDB,
    getRentalOrderByIdFromDB,
    cancelRentalOrderInDB
};