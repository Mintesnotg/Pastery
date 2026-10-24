import { Router } from "express";
import {
  downgradeController,
  listTasksController,
  processCollectionsController,
  resolveTaskController,
} from "./collection.controller.js";

export const collectionsRouter = Router();

collectionsRouter.post("/process", processCollectionsController);
collectionsRouter.get("/tasks", listTasksController);
collectionsRouter.post("/tasks/:id/resolve", resolveTaskController);
collectionsRouter.post("/downgrade", downgradeController);
