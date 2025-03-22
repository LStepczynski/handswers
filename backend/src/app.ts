import express, { ErrorRequestHandler } from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "@utils/middleware";
import routes from "@api/routes";

import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

console.log(`✅ Allowed CORS Origin: ${process.env.FRONTEND_URL}`);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Set-Cookie"],
    credentials: true,
  })
);

app.use("/", routes);

app.use(errorHandler as ErrorRequestHandler);

export default app;
