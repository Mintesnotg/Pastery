import { Router } from "express";
import {
  downloadDocumentController,
  getBusinessAccountController,
  getMyBusinessAccountController,
  listBusinessAccountsController,
  registerBusinessAccountController,
  updateBusinessAccountController,
} from "./businessAccount.controller.js";
import { businessAccountUpload } from "./businessAccount.upload.js";

export const businessAccountsRouter = Router();

businessAccountsRouter.get("/me", getMyBusinessAccountController);
businessAccountsRouter.get("/", listBusinessAccountsController);
businessAccountsRouter.post(
  "/",
  businessAccountUpload.fields([
    { name: "business_id_doc", maxCount: 1 },
    { name: "license_doc", maxCount: 1 },
  ]),
  registerBusinessAccountController,
);
businessAccountsRouter.get("/:id/documents/:kind", downloadDocumentController);
businessAccountsRouter.get("/:id", getBusinessAccountController);
businessAccountsRouter.put("/:id", updateBusinessAccountController);
