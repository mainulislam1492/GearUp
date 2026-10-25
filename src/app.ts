import cookieParser from "cookie-parser";
import cors from "cors";
import config from "./config";
import express, { Application, Request, Response } from "express";
import { userRoutes } from "./modules/user/user.route";
import { authRoutes } from "./modules/auth/auth.route";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { notFound } from "./middlewares/notFound";

const app : Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))


app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser());

app.get("/",(req : Request, res : Response) => {
    res.send("Hello, World!");
});

app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)


app.use(notFound)
app.use(globalErrorHandler)


export default app;