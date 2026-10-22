import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { swaggerHandler, swaggerMiddleware } from "./docs/swagger.js";
import { openapiSpec } from "./docs/openapi.js";
import { requestLogger } from "./shared/middleware/request-logger.middleware.js";
import { apiRateLimiter, authRateLimiter } from "./shared/middleware/rate-limit.middleware.js";
import { cacheControlMiddleware } from "./shared/middleware/cache-control.middleware.js";
import { errorHandler, notFoundHandler } from "./shared/middleware/error.middleware.js";
import { authenticationMiddleware } from "./modules/authentication/auth.middleware.js";
import { permissionsMiddleware } from "./modules/permissions/permission.middleware.js";
import { authorizationMiddleware } from "./shared/middleware/authorization.middleware.js";
import { authRouter } from "./modules/authentication/auth.routes.js";
import { usersRouter } from "./modules/users/user.routes.js";
import { permissionsRouter } from "./modules/permissions/permission.routes.js";
import { rolesRouter } from "./modules/roles/role.routes.js";
import { ordersRouter } from "./modules/orders/order.routes.js";
import { messagesRouter } from "./modules/messages/message.routes.js";
import { productsRouter } from "./modules/products/product.routes.js";
import { productCategoriesRouter } from "./modules/product-categories/productCategory.routes.js";
import { testimonialsRouter } from "./modules/testimonials/testimonial.routes.js";
import { bannersRouter } from "./modules/banners/banner.routes.js";
import { healthRouter } from "./modules/health/health.routes.js";
import "./shared/types/express.js";

export const app = express();

app.disable("x-powered-by");
// The app runs behind the hosting provider's TLS-terminating proxy.
app.set("trust proxy", env.trustProxy);

// Swagger UI relies on inline scripts, so CSP is only relaxed when docs are enabled.
app.use(helmet(env.enableDocs ? { contentSecurityPolicy: false } : {}));
app.use(compression());
app.use(requestLogger);

const allowedOrigins = new Set(env.corsOrigins);
app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (health checks, curl, server-to-server) send no Origin.
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/api", apiRateLimiter);
app.use(["/api/auth/login", "/api/auth/google", "/api/auth/resend-verification"], authRateLimiter);
app.post("/api/users", authRateLimiter);
app.post("/api/messages", authRateLimiter);

app.use(authenticationMiddleware);
app.use(cacheControlMiddleware);
app.use(permissionsMiddleware);
app.use(authorizationMiddleware);

app.get("/", (_req, res) => res.json({ ok: true, service: "house-of-bread-backend" }));
app.use("/health", healthRouter);

if (env.enableDocs) {
  app.get("/openapi.json", (_req, res) => res.json(openapiSpec));
  app.get("/docs/swagger.json", (_req, res) => res.json(openapiSpec));
  app.use("/docs", swaggerMiddleware, swaggerHandler);
}

app.use("/api/products", productsRouter);
app.use("/api/product-categories", productCategoriesRouter);
app.use("/api/testimonials", testimonialsRouter);
app.use("/api/banners", bannersRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/roles", rolesRouter);
app.use("/api/permissions", permissionsRouter);

app.use(notFoundHandler);
app.use(errorHandler);
