import { RentalStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { CreateGearPayload, UpdateGearPayload } from "./provider.interface";

// ---------- helpers ----------
const validateGearNumbers = (payload: UpdateGearPayload) => {
    const { pricePerDay, securityDeposit, stockQuantity } = payload;

    if (pricePerDay !== undefined && (typeof pricePerDay !== "number" || pricePerDay <= 0)) {
        throw new Error("pricePerDay must be a number greater than 0");
    }

    if (securityDeposit !== undefined && (typeof securityDeposit !== "number" || securityDeposit < 0)) {
        throw new Error("securityDeposit must be a number of 0 or more");
    }

    if (stockQuantity !== undefined && (!Number.isInteger(stockQuantity) || stockQuantity < 0)) {
        throw new Error("stockQuantity must be a whole number of 0 or more");
    }
};

const checkCategoryExist = async (categoryId: string) => {
    const category = await prisma.category.findUnique({
        where: { id: categoryId }
    });

    if (!category) {
        throw new Error("Category not found");
    }
};

// returns the gear only if it belongs to this provider
const getOwnGearOrThrow = async (providerId: string, gearId: string) => {
    const gear = await prisma.gearItem.findUniqueOrThrow({
        where: { id: gearId }
    });

    if (gear.providerId !== providerId) {
        throw new Error("Forbidden. You can manage only your own gear");
    }

    return gear;
};

// ---------- services ----------
const addGearIntoDB = async (providerId: string, payload: CreateGearPayload) => {
    const {
        name,
        brand,
        description,
        categoryId,
        specifications,
        images,
        pricePerDay,
        securityDeposit,
        stockQuantity,
        isAvailable
    } = payload;

    if (!name || !brand || !description || !categoryId || pricePerDay === undefined) {
        throw new Error("name, brand, description, categoryId and pricePerDay are required");
    }

    validateGearNumbers(payload);
    await checkCategoryExist(categoryId);

    const gear = await prisma.gearItem.create({
        data: {
            providerId,
            categoryId,
            name,
            brand,
            description,
            specifications,
            images: images ?? [],
            pricePerDay,
            securityDeposit,
            stockQuantity,
            isAvailable
        },
        include: {
            category: true
        }
    });

    return gear;
};

const updateGearInDB = async (providerId: string, gearId: string, payload: UpdateGearPayload) => {
    await getOwnGearOrThrow(providerId, gearId);

    const {
        name,
        brand,
        description,
        categoryId,
        specifications,
        images,
        pricePerDay,
        securityDeposit,
        stockQuantity,
        isAvailable
    } = payload;

    validateGearNumbers(payload);

    if (categoryId) {
        await checkCategoryExist(categoryId);
    }

    // status is not updatable here: moderation (HIDDEN) is controlled by admin
    const updatedGear = await prisma.gearItem.update({
        where: { id: gearId },
        data: {
            name,
            brand,
            description,
            categoryId,
            specifications,
            images,
            pricePerDay,
            securityDeposit,
            stockQuantity,
            isAvailable
        },
        include: {
            category: true
        }
    });

    return updatedGear;
};

const deleteGearFromDB = async (providerId: string, gearId: string) => {
    await getOwnGearOrThrow(providerId, gearId);

    const rentalCount = await prisma.rentalItem.count({
        where: { gearItemId: gearId }
    });

    // gear that already has rental history must be kept for order records,
    // so it is hidden instead of being deleted
    if (rentalCount > 0) {
        await prisma.gearItem.update({
            where: { id: gearId },
            data: {
                isAvailable: false,
                status: "HIDDEN"
            }
        });

        return { id: gearId, mode: "hidden" as const };
    }

    await prisma.gearItem.delete({
        where: { id: gearId }
    });

    return { id: gearId, mode: "deleted" as const };
};

// ---------- orders ----------
// current status -> the only next status a provider may set
const PROVIDER_STATUS_FLOW: Partial<Record<RentalStatus, RentalStatus>> = {
    [RentalStatus.PLACED]: RentalStatus.CONFIRMED,
    [RentalStatus.PAID]: RentalStatus.PICKED_UP,
    [RentalStatus.PICKED_UP]: RentalStatus.RETURNED
};

const getProviderOrdersFromDB = async (providerId: string, query: { status?: string }) => {
    const { status } = query;

    if (status && !Object.values(RentalStatus).includes(status as RentalStatus)) {
        throw new Error("Invalid status filter");
    }

    const orders = await prisma.rentalOrder.findMany({
        where: {
            providerId,
            status: status as RentalStatus | undefined
        },
        orderBy: { createdAt: "desc" },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    profile: { select: { phone: true, address: true } }
                }
            },
            items: {
                include: { gearItem: { select: { id: true, name: true, images: true } } }
            },
            payments: {
                select: { id: true, status: true, amount: true, provider: true, paidAt: true }
            }
        }
    });

    return orders;
};

const updateOrderStatusInDB = async (providerId: string, orderId: string, status: RentalStatus) => {
    const allowedStatuses: RentalStatus[] = [
        RentalStatus.CONFIRMED,
        RentalStatus.PICKED_UP,
        RentalStatus.RETURNED
    ];

    if (!status || !allowedStatuses.includes(status)) {
        throw new Error("Status must be one of CONFIRMED, PICKED_UP or RETURNED");
    }

    const order = await prisma.rentalOrder.findUniqueOrThrow({
        where: { id: orderId }
    });

    if (order.providerId !== providerId) {
        throw new Error("Forbidden. You can manage only your own orders");
    }

    if (PROVIDER_STATUS_FLOW[order.status] !== status) {
        throw new Error(`Invalid status change: ${order.status} -> ${status}`);
    }

    const updatedOrder = await prisma.rentalOrder.update({
        where: { id: orderId },
        data: { status },
        include: {
            items: { include: { gearItem: { select: { id: true, name: true } } } }
        }
    });

    return updatedOrder;
};

export const providerService = {
    addGearIntoDB,
    updateGearInDB,
    deleteGearFromDB,
    getProviderOrdersFromDB,
    updateOrderStatusInDB
};