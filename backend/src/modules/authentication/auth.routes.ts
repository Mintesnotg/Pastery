import { Router } from "express";
import {
  googleAuthController,
  loginController,
  logoutController,
  meController,
  resendVerificationController,
  updateMeController,
  verifyEmailController,
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.post("/google", googleAuthController);
authRouter.get("/verify-email", verifyEmailController);
authRouter.post("/resend-verification", resendVerificationController);
authRouter.get("/me", meController);
authRouter.put("/me", updateMeController);
authRouter.post("/logout", logoutController);
