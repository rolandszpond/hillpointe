import { Router } from "express";
import { CreateProspectSchema, UpdateProspectSchema } from "@repo/contracts";
import { db } from "../db.js";
import { runRules } from "../rules/engine.js";

export const prospectsRouter = Router();

prospectsRouter.get("/", async (_req, res) => {
  const prospects = await db.prospect.findMany();
  res.json(prospects);
});

prospectsRouter.get("/:id", async (req, res) => {
  const prospect = await db.prospect.findUnique({ where: { id: req.params.id } });
  if (!prospect) return res.status(404).json({ error: "Prospect not found" });
  res.json(prospect);
});

prospectsRouter.post("/", async (req, res) => {
  const parsed = CreateProspectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const prospect = await db.prospect.create({ data: parsed.data });
  res.status(201).json(prospect);
});

prospectsRouter.patch("/:id", async (req, res) => {
  const parsed = UpdateProspectSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await db.prospect.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Prospect not found" });

  const prospect = await db.prospect.update({
    where: { id: req.params.id },
    data: parsed.data,
  });

  if (parsed.data.status && parsed.data.status !== existing.status) {
    await runRules({ prospect, db }, parsed.data.status);
  }

  res.json(prospect);
});

prospectsRouter.delete("/:id", async (req, res) => {
  await db.prospect.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
