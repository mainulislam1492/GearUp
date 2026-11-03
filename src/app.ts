import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config";
import express, { Application, Request, Response } from "express";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";
import { providerRoutes } from "./modules/provider/provider.route";
import { gearRoutes } from "./modules/gear/gear.route";
import { rentalRoutes } from "./modules/rental/rental.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { reviewRoutes } from "./modules/review/review.route";
import { adminRoutes } from "./modules/admin/admin.route";
import { categoryRoutes } from "./modules/category/category.route";


const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))

app.use("/api/payments/stripe/webhook", express.raw({ type: "application/json" }));


app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());

app.get("/",(req : Request, res : Response) => {
    res.send("Hello, World!");
});

app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)

app.use("/api/provider", providerRoutes);

app.use("/api/gear", gearRoutes);

app.use("/api/rentals", rentalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes)

app.get("/payment/success", (req: Request, res: Response) => {
    res.send(`Payment successful. Transaction: ${req.query.transactionId}`);
});

app.get("/payment/cancel", (req: Request, res: Response) => {
    res.send("Payment cancelled.");
});

app.get("/payment/failed", (req: Request, res: Response) => {
    res.send("Payment failed.");
});

app.use(notFound)
app.use(globalErrorHandler)


export default app;