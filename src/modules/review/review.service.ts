import { RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { CreateReviewPayload } from "./review.interface";

const createReviewIntoDB = async (customerId: string, payload: CreateReviewPayload) => {
    const { rentalOrderId, gearItemId, rating, comment } = payload;

    if (!rentalOrderId || !gearItemId || rating === undefined) {
        throw new Error("rentalOrderId, gearItemId and rating are required");
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Rating must be a whole number from 1 to 5");
    }

    const order = await prisma.rentalOrder.findFirst({
        where: { id: rentalOrderId, customerId },
        include: { items: { select: { gearItemId: true } } }
    });

    if (!order) {
        throw new Error("Rental order not found");
    }

    if (order.status !== RentalStatus.RETURNED) {
        throw new Error("You can review only after the gear has been returned");
    }

    if (!order.items.some((item) => item.gearItemId === gearItemId)) {
        throw new Error("This gear is not part of the selected order");
    }

    const existingReview = await prisma.review.findUnique({
        where: {
            customerId_gearItemId_rentalOrderId: { customerId, gearItemId, rentalOrderId }
        }
    });

    if (existingReview) {
        throw new Error("You have already reviewed this gear for this order");
    }

    const review = await prisma.review.create({
        data: { customerId, gearItemId, rentalOrderId, rating, comment },
        include: {
            gearItem: { select: { id: true, name: true } },
            customer: { select: { id: true, name: true } }
        }
    });

    return review;
};

export const reviewService = {
    createReviewIntoDB
};