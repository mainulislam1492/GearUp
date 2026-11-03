import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { GearQuery } from "./gear.interface";
import { gearService } from "./gear.service";

const getAllGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await gearService.getAllGearFromDB(req.query as GearQuery);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear fetched successfully",
        data: result
    });
});

const getGearById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const gearId = req.params.id as string;

    const gear = await gearService.getGearByIdFromDB(gearId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear details fetched successfully",
        data: { gear }
    });
});

export const gearController = {
    getAllGear,
    getGearById
};