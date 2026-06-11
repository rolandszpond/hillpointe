import { Router } from "express";
import { CreateUnitSchema, UpdateUnitSchema } from "@repo/contracts";
import { db } from "../db.js";

export const unitsRouter = Router();

unitsRouter.get("/", async (_req, res) => {
  const units = await db.unit.findMany();
  res.json(units);
});

unitsRouter.get("/:id", async (req, res) => {
  const unit = await db.unit.findUnique({ where: { id: req.params.id } });
  if (!unit) return res.status(404).json({ error: "Unit not found" });
  res.json(unit);
});

unitsRouter.post("/", async (req, res) => {
  const parsed = CreateUnitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const unit = await db.unit.create({ data: parsed.data });
  res.status(201).json(unit);
});

unitsRouter.patch("/:id", async (req, res) => {
  const parsed = UpdateUnitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const unit = await db.unit.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  res.json(unit);
});

unitsRouter.delete("/:id", async (req, res) => {
  await db.unit.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
