import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { providerController } from "./provider.controller";

const router = Router();

router.post("/gear", auth(Role.PROVIDER), providerController.addGear);

router.put("/gear/:id", auth(Role.PROVIDER), providerController.updateGear);

router.delete("/gear/:id", auth(Role.PROVIDER), providerController.deleteGear);

router.get("/orders", auth(Role.PROVIDER), providerController.getProviderOrders);

router.patch("/orders/:id", auth(Role.PROVIDER), providerController.updateOrderStatus);

export const providerRoutes = router;