import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { rentalController } from "./rental.controller";

const router = Router();

router.post("/", auth(Role.CUSTOMER), rentalController.createRental);

router.get("/", auth(Role.CUSTOMER), rentalController.getMyRentals);

router.get("/:id", auth(Role.CUSTOMER), rentalController.getRentalById);

router.patch("/:id/cancel", auth(Role.CUSTOMER), rentalController.cancelRental);

export const rentalRoutes = router;