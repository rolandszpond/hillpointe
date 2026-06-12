import { Router } from "express";
import { db } from "../db.js";

export const tasksRouter = Router();

tasksRouter.get("/", async (req, res) => {
  const { prospectId } = req.query;
  const tasks = await db.task.findMany({
    where: prospectId ? { prospectId: String(prospectId) } : undefined,
    orderBy: { dueDate: "asc" },
  });
  res.json(tasks);
});

tasksRouter.patch("/:id/done", async (req, res) => {
  const task = await db.task.findUnique({ where: { id: req.params.id } });
  if (!task) return res.status(404).json({ error: "Task not found" });

  const updated = await db.task.update({
    where: { id: req.params.id },
    data: { state: "done" },
  });
  res.json(updated);
});
