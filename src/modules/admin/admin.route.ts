import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { adminController } from "./admin.controller";

const router = Router();

// every admin route is admin only
router.use(auth(Role.ADMIN));

router.get("/users", adminController.getAllUsers);

router.patch("/users/:id", adminController.updateUserStatus);

router.get("/gear", adminController.getAllGear);

router.patch("/gear/:id", adminController.updateGearStatus);

router.get("/rentals", adminController.getAllRentals);

export const adminRoutes = router;