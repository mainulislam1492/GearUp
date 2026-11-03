import { Prisma } from "../../../generated/prisma/client";
import { GearStatus, RentalStatus, Role, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AdminGearQuery, AdminRentalQuery, AdminUserQuery } from "./admin.interface";

// ---------- helpers ----------
const getPagination = (pageValue?: string, limitValue?: string) => {
    const page = Math.max(Number(pageValue) || 1, 1);
    const limit = Math.min(Math.max(Number(limitValue) || 10, 1), 50);

    return { page, limit, skip: (page - 1) * limit };
};

const buildMeta = (page: number, limit: number, total: number) => ({
    page,
    limit,
    total,
    totalPage: Math.ceil(total / limit)
});

// ---------- users ----------
const getAllUsersFromDB = async (query: AdminUserQuery) => {
    const { searchTerm, role, status } = query;

    if (role && role !== Role.CUSTOMER && role !== Role.PROVIDER) {
        throw new Error("role must be CUSTOMER or PROVIDER");
    }

    if (status && !Object.values(UserStatus).includes(status as UserStatus)) {
        throw new Error("Invalid status filter");
    }

    const { page, limit, skip } = getPagination(query.page, query.limit);

    // customers and providers only, admin accounts are not listed
    const andConditions: Prisma.UserWhereInput[] = [
        { role: { in: [Role.CUSTOMER, Role.PROVIDER] } }
    ];

    if (role) {
        andConditions.push({ role: role as Role });
    }

    if (status) {
        andConditions.push({ status: status as UserStatus });
    }

    if (searchTerm) {
        andConditions.push({
            OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { email: { contains: searchTerm, mode: "insensitive" } }
            ]
        });
    }

    const where: Prisma.UserWhereInput = { AND: andConditions };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            omit: { password: true },
            include: { profile: true }
        }),
        prisma.user.count({ where })
    ]);

    return { meta: buildMeta(page, limit, total), users };
};

const updateUserStatusInDB = async (adminId: string, userId: string, status: UserStatus) => {
    if (!status || !Object.values(UserStatus).includes(status)) {
        throw new Error("Status must be ACTIVE or SUSPENDED");
    }

    if (adminId === userId) {
        throw new Error("You can't change your own status");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.role === Role.ADMIN) {
        throw new Error("Admin accounts can't be suspended");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status },
        omit: { password: true },
        include: { profile: true }
    });

    return updatedUser;
};

// ---------- gear ----------
const getAllGearFromDB = async (query: AdminGearQuery) => {
    const { searchTerm, status, categoryId, providerId } = query;

    if (status && !Object.values(GearStatus).includes(status as GearStatus)) {
        throw new Error("Invalid status filter");
    }

    const { page, limit, skip } = getPagination(query.page, query.limit);

    // unlike the public list, hidden gear is included here
    const andConditions: Prisma.GearItemWhereInput[] = [];

    if (status) {
        andConditions.push({ status: status as GearStatus });
    }

    if (categoryId) {
        andConditions.push({ categoryId });
    }

    if (providerId) {
        andConditions.push({ providerId });
    }

    if (searchTerm) {
        andConditions.push({
            OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { brand: { contains: searchTerm, mode: "insensitive" } }
            ]
        });
    }

    const where: Prisma.GearItemWhereInput = andConditions.length ? { AND: andConditions } : {};

    const [gears, total] = await Promise.all([
        prisma.gearItem.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                provider: { select: { id: true, name: true, email: true, status: true } }
            }
        }),
        prisma.gearItem.count({ where })
    ]);

    return { meta: buildMeta(page, limit, total), gears };
};

// moderation: admin can hide or restore a listing
const updateGearStatusInDB = async (gearId: string, status: GearStatus) => {
    if (!status || !Object.values(GearStatus).includes(status)) {
        throw new Error("Status must be ACTIVE or HIDDEN");
    }

    const gear = await prisma.gearItem.findUnique({
        where: { id: gearId }
    });

    if (!gear) {
        throw new Error("Gear not found");
    }

    const updatedGear = await prisma.gearItem.update({
        where: { id: gearId },
        data: { status },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            provider: { select: { id: true, name: true } }
        }
    });

    return updatedGear;
};

// ---------- rental orders ----------
const getAllRentalsFromDB = async (query: AdminRentalQuery) => {
    const { status, customerId, providerId } = query;

    if (status && !Object.values(RentalStatus).includes(status as RentalStatus)) {
        throw new Error("Invalid status filter");
    }

    const { page, limit, skip } = getPagination(query.page, query.limit);

    const where: Prisma.RentalOrderWhereInput = {
        status: status as RentalStatus | undefined,
        customerId,
        providerId
    };

    const [orders, total] = await Promise.all([
        prisma.rentalOrder.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                customer: { select: { id: true, name: true, email: true } },
                provider: {
                    select: {
                        id: true,
                        name: true,
                        profile: { select: { shopName: true } }
                    }
                },
                items: {
                    include: { gearItem: { select: { id: true, name: true } } }
                },
                payments: {
                    select: { id: true, status: true, amount: true, provider: true, paidAt: true }
                }
            }
        }),
        prisma.rentalOrder.count({ where })
    ]);

    return { meta: buildMeta(page, limit, total), orders };
};

export const adminService = {
    getAllUsersFromDB,
    updateUserStatusInDB,
    getAllGearFromDB,
    updateGearStatusInDB,
    getAllRentalsFromDB
};