import { prisma } from "../../lib/prisma";
import { CreateCategoryPayload, UpdateCategoryPayload } from "./category.interface";

const slugify = (name: string) =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const createCategoryIntoDB = async (payload: CreateCategoryPayload) => {
    const { name, description, imageUrl } = payload;

    if (!name || !name.trim()) {
        throw new Error("Category name is required");
    }

    const cleanName = name.trim();
    const slug = slugify(cleanName);

    if (!slug) {
        throw new Error("Category name must contain letters or numbers");
    }

    const existingCategory = await prisma.category.findFirst({
        where: {
            OR: [{ name: { equals: cleanName, mode: "insensitive" } }, { slug }]
        }
    });

    if (existingCategory) {
        throw new Error("A category with this name already exists");
    }

    const category = await prisma.category.create({
        data: { name: cleanName, slug, description, imageUrl }
    });

    return category;
};

const getAllCategoriesFromDB = async () => {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: { select: { gearItems: true } }
        }
    });

    return categories;
};

const updateCategoryInDB = async (categoryId: string, payload: UpdateCategoryPayload) => {
    const { name, description, imageUrl } = payload;

    const category = await prisma.category.findUnique({
        where: { id: categoryId }
    });

    if (!category) {
        throw new Error("Category not found");
    }

    let cleanName: string | undefined;
    let slug: string | undefined;

    if (name !== undefined) {
        cleanName = name.trim();
        slug = slugify(cleanName);

        if (!cleanName || !slug) {
            throw new Error("Category name must contain letters or numbers");
        }

        const duplicate = await prisma.category.findFirst({
            where: {
                id: { not: categoryId },
                OR: [{ name: { equals: cleanName, mode: "insensitive" } }, { slug }]
            }
        });

        if (duplicate) {
            throw new Error("A category with this name already exists");
        }
    }

    const updatedCategory = await prisma.category.update({
        where: { id: categoryId },
        data: { name: cleanName, slug, description, imageUrl }
    });

    return updatedCategory;
};

const deleteCategoryFromDB = async (categoryId: string) => {
    const category = await prisma.category.findUnique({
        where: { id: categoryId }
    });

    if (!category) {
        throw new Error("Category not found");
    }

    // gear items depend on the category, so it can't be deleted while in use
    const gearCount = await prisma.gearItem.count({
        where: { categoryId }
    });

    if (gearCount > 0) {
        throw new Error(
            `This category has ${gearCount} gear item(s). Move or remove them before deleting the category`
        );
    }

    await prisma.category.delete({
        where: { id: categoryId }
    });

    return { id: categoryId };
};

export const categoryService = {
    createCategoryIntoDB,
    getAllCategoriesFromDB,
    updateCategoryInDB,
    deleteCategoryFromDB
};