import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { productsRouter } from "./routes/products.js";
import { testimonialsRouter } from "./routes/testimonials.js";
import { messagesRouter } from "./routes/messages.js";
import { ordersRouter } from "./routes/orders.js";
import { authRouter } from "./routes/auth.js";

export const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => res.json({ ok: true, service: "house-of-bread-backend" }));
app.use("/health", healthRouter);
app.use("/api/products", productsRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/auth", authRouter);
