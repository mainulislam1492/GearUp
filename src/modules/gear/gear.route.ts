import { Router } from "express";
import { gearController } from "./gear.controller";

const router = Router();

// public routes: no auth middleware, anyone can access
router.get("/", gearController.getAllGear);

router.get("/:id", gearController.getGearById);

export const gearRoutes = router;