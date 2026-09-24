import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  updateMeController,
} from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", loginController);
authRouter.get("/me", meController);
authRouter.put("/me", updateMeController);
authRouter.post("/logout", logoutController);
