import { Router } from "express";
import { createRoleController, deleteRoleController, getRoleController, getRolePermissionsController, listRolesController, updateRoleController } from "../controllers/accountController.js";

export const rolesRouter = Router();
rolesRouter.get("/", listRolesController);
rolesRouter.post("/", createRoleController);
rolesRouter.get("/:id", getRoleController);
rolesRouter.get("/:id/permissions", getRolePermissionsController);
rolesRouter.put("/:id", updateRoleController);
rolesRouter.delete("/:id", deleteRoleController);
