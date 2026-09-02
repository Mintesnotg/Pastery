import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  getUserController,
  listUsersController,
  updateUserController,
} from "./user.controller.js";

export const usersRouter = Router();

usersRouter.get("/", listUsersController);
usersRouter.post("/", createUserController);
usersRouter.get("/:id", getUserController);
usersRouter.put("/:id", updateUserController);
usersRouter.delete("/:id", deleteUserController);
