import { Prisma } from "../../../generated/prisma/client";
import { GearStatus, UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { GearQuery } from "./gear.interface";

const ALLOWED_SORT_FIELDS = ["pricePerDay", "createdAt", "name"];

const toNumber = (value?: string) => {
    if (value === undefined || value === "") return undefined;
    const num = Number(value);
    return Number.isNaN(num) ? undefined : num;
};

// only show gear that is active and whose provider is not suspended
const publicVisibilityFilter: Prisma.GearItemWhereInput = {
    status: GearStatus.ACTIVE,
    provider: { status: UserStatus.ACTIVE }
};

const providerSelect = {
    select: {
        id: true,
        name: true,
        profile: {
            select: {
                shopName: true,
                shopAddress: true
            }
        }
    }
} as const;

const getAllGearFromDB = async (query: GearQuery) => {
    const { searchTerm, category, brand, available, sortBy, sortOrder } = query;

    const minPrice = toNumber(query.minPrice);
    const maxPrice = toNumber(query.maxPrice);

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
        throw new Error("minPrice can't be greater than maxPrice");
    }

    // pagination
    const page = Math.max(toNumber(query.page) ?? 1, 1);
    const limit = Math.min(Math.max(toNumber(query.limit) ?? 10, 1), 50);
    const skip = (page - 1) * limit;

    // sorting
    const orderField = sortBy && ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const orderDirection = sortOrder === "asc" ? "asc" : "desc";

    // filters
    const andConditions: Prisma.GearItemWhereInput[] = [publicVisibilityFilter];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { name: { contains: searchTerm, mode: "insensitive" } },
                { brand: { contains: searchTerm, mode: "insensitive" } },
                { description: { contains: searchTerm, mode: "insensitive" } }
            ]
        });
    }

    if (category) {
        andConditions.push({
            category: {
                OR: [{ id: category }, { slug: category }]
            }
        });
    }

    if (brand) {
        andConditions.push({
            brand: { equals: brand, mode: "insensitive" }
        });
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        andConditions.push({
            pricePerDay: {
                gte: minPrice,
                lte: maxPrice
            }
        });
    }

    if (available === "true") {
        andConditions.push({ isAvailable: true, stockQuantity: { gt: 0 } });
    } else if (available === "false") {
        andConditions.push({
            OR: [{ isAvailable: false }, { stockQuantity: { lte: 0 } }]
        });
    }

    const where: Prisma.GearItemWhereInput = { AND: andConditions };

    const [gears, total] = await Promise.all([
        prisma.gearItem.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [orderField]: orderDirection },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                provider: providerSelect
            }
        }),
        prisma.gearItem.count({ where })
    ]);

    // average rating for the gear on this page
    const ratings = await prisma.review.groupBy({
        by: ["gearItemId"],
        where: { gearItemId: { in: gears.map((gear) => gear.id) } },
        _avg: { rating: true },
        _count: { rating: true }
    });

    const ratingMap = new Map(ratings.map((r) => [r.gearItemId, r]));

    const data = gears.map((gear) => {
        const rating = ratingMap.get(gear.id);

        return {
            ...gear,
            averageRating: rating?._avg.rating ? Math.round(rating._avg.rating * 10) / 10 : 0,
            totalReviews: rating?._count.rating ?? 0
        };
    });

    return {
        meta: {
            page,
            limit,
            total,
            totalPage: Math.ceil(total / limit)
        },
        gears: data
    };
};

const getGearByIdFromDB = async (gearId: string) => {
    const gear = await prisma.gearItem.findFirst({
        where: {
            id: gearId,
            ...publicVisibilityFilter
        },
        include: {
            category: { select: { id: true, name: true, slug: true } },
            provider: providerSelect,
            reviews: {
                take: 10,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    customer: {
                        select: {
                            name: true,
                            profile: { select: { profilePhoto: true } }
                        }
                    }
                }
            }
        }
    });

    if (!gear) {
        throw new Error("Gear not found");
    }

    const rating = await prisma.review.aggregate({
        where: { gearItemId: gearId },
        _avg: { rating: true },
        _count: { rating: true }
    });

    return {
        ...gear,
        averageRating: rating._avg.rating ? Math.round(rating._avg.rating * 10) / 10 : 0,
        totalReviews: rating._count.rating
    };
};

export const gearService = {
    getAllGearFromDB,
    getGearByIdFromDB
};