import swaggerUi from "swagger-ui-express";
import { openapiSpec } from "./openapi.js";

export const swaggerMiddleware = swaggerUi.serve;
export const swaggerHandler = swaggerUi.setup(openapiSpec);
