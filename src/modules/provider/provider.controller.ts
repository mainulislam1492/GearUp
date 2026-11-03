import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { providerService } from "./provider.service";

const addGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;

    const gear = await providerService.addGearIntoDB(providerId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Gear added successfully",
        data: { gear }
    });
});

const updateGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const gearId = req.params.id as string;

    const gear = await providerService.updateGearInDB(providerId, gearId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear updated successfully",
        data: { gear }
    });
});

const deleteGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const gearId = req.params.id as string;

    const result = await providerService.deleteGearFromDB(providerId, gearId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: result.mode === "deleted"
            ? "Gear deleted successfully"
            : "Gear has rental history, so it was hidden instead of deleted",
        data: result
    });
});

const getProviderOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;

    const orders = await providerService.getProviderOrdersFromDB(providerId, req.query as { status?: string });

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Orders fetched successfully",
        data: { orders }
    });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const orderId = req.params.id as string;

    const order = await providerService.updateOrderStatusInDB(providerId, orderId, req.body.status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Order status updated to ${order.status}`,
        data: { order }
    });
});

export const providerController = {
    addGear,
    updateGear,
    deleteGear,
    getProviderOrders,
    updateOrderStatus
};