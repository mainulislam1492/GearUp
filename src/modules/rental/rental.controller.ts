import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";
import { RentalQuery } from "./rental.interface";


const createRental = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;

    const order = await rentalService.createRentalOrderIntoDB(customerId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Rental order placed successfully",
        data: { order }
    });
});

const getMyRentals = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;

    const orders = await rentalService.getMyRentalOrdersFromDB(customerId, req.query as RentalQuery);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental orders fetched successfully",
        data: { orders }
    });
});

const getRentalById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const orderId = req.params.id as string;

    const order = await rentalService.getRentalOrderByIdFromDB(customerId, orderId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental order fetched successfully",
        data: { order }
    });
});

const cancelRental = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const orderId = req.params.id as string;

    const order = await rentalService.cancelRentalOrderInDB(customerId, orderId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental order cancelled successfully",
        data: { order }
    });
});

export const rentalController = {
    createRental,
    getMyRentals,
    getRentalById,
    cancelRental
};