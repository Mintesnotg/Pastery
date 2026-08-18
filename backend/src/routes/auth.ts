import { Router } from "express";
import { loginController, logoutController, meController } from "../controllers/authController.js";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.get("/me", meController);
authRouter.post("/logout", logoutController);
