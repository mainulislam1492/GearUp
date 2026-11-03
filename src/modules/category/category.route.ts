import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { categoryController } from "./category.controller";

const router = Router();

// public
router.get("/", categoryController.getAllCategories);

// admin only
router.post("/", auth(Role.ADMIN), categoryController.createCategory);

router.put("/:id", auth(Role.ADMIN), categoryController.updateCategory);

router.delete("/:id", auth(Role.ADMIN), categoryController.deleteCategory);

export const categoryRoutes = router;