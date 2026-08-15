import { Router } from "express";
import { createPermissionController, deletePermissionController, getPermissionController, listPermissionsController, updatePermissionController } from "../controllers/accountController.js";

export const permissionsRouter = Router();
permissionsRouter.get("/", listPermissionsController);
permissionsRouter.post("/", createPermissionController);
permissionsRouter.get("/:id", getPermissionController);
permissionsRouter.put("/:id", updatePermissionController);
permissionsRouter.delete("/:id", deletePermissionController);
