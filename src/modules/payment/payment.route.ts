import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { paymentController } from "./payment.controller";

const router = Router();

// customer
router.post("/create", auth(Role.CUSTOMER), paymentController.createPayment);

router.post("/confirm", auth(Role.CUSTOMER), paymentController.confirmStripePayment);

router.get("/", auth(Role.CUSTOMER), paymentController.getMyPayments);

// gateway calls (no auth: verified by signature / gateway validation instead)
router.post("/stripe/webhook", paymentController.stripeWebhook);

router.post("/sslcommerz/success", paymentController.sslcommerzSuccess);
router.post("/sslcommerz/fail", paymentController.sslcommerzFail);
router.post("/sslcommerz/cancel", paymentController.sslcommerzCancel);

// keep this last so it doesn't swallow the routes above
router.get("/:id", auth(Role.CUSTOMER), paymentController.getPaymentById);

export const paymentRoutes = router;