import { Router } from "express";
import {
  generateInvoicesController,
  getInvoiceController,
  listInvoicesController,
  listMyInvoicesController,
  recordPaymentController,
  voidInvoiceController,
} from "./invoice.controller.js";

export const invoicesRouter = Router();

invoicesRouter.get("/", listInvoicesController);
invoicesRouter.get("/me", listMyInvoicesController);
invoicesRouter.post("/generate", generateInvoicesController);
invoicesRouter.get("/:id", getInvoiceController);
invoicesRouter.post("/:id/payments", recordPaymentController);
invoicesRouter.post("/:id/void", voidInvoiceController);
