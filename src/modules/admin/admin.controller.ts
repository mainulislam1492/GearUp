import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminGearQuery, AdminRentalQuery, AdminUserQuery } from "./admin.interface";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllUsersFromDB(req.query as AdminUserQuery);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users fetched successfully",
        data: result
    });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const adminId = req.user?.id as string;
    const userId = req.params.id as string;

    const user = await adminService.updateUserStatusInDB(adminId, userId, req.body.status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `User status updated to ${user.status}`,
        data: { user }
    });
});

const getAllGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllGearFromDB(req.query as AdminGearQuery);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear listings fetched successfully",
        data: result
    });
});

const updateGearStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const gearId = req.params.id as string;

    const gear = await adminService.updateGearStatusInDB(gearId, req.body.status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Gear status updated to ${gear.status}`,
        data: { gear }
    });
});

const getAllRentals = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllRentalsFromDB(req.query as AdminRentalQuery);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental orders fetched successfully",
        data: result
    });
});

export const adminController = {
    getAllUsers,
    updateUserStatus,
    getAllGear,
    updateGearStatus,
    getAllRentals
};