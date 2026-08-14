import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { loginController, logoutController, meController } from "../controllers/authController.js";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.get("/me", requireAuth, meController);
authRouter.post("/logout", logoutController);
