import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";

const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const category = await categoryService.createCategoryIntoDB(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Category created successfully",
        data: { category }
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categories = await categoryService.getAllCategoriesFromDB();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories fetched successfully",
        data: { categories }
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id as string;

    const category = await categoryService.updateCategoryInDB(categoryId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category updated successfully",
        data: { category }
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params.id as string;

    const result = await categoryService.deleteCategoryFromDB(categoryId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Category deleted successfully",
        data: result
    });
});

export const categoryController = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
};