import { Router } from "express";
import { CreateTourSchema, UpdateTourSchema, TourOutcomeSchema } from "@repo/contracts";
import type { ProspectStatus } from "@repo/contracts";
import { db } from "../db.js";
import { runRules } from "../rules/engine.js";

export const toursRouter = Router();

const OUTCOME_STATUS: Record<string, ProspectStatus> = {
  toured: "toured",
  no_show: "lost",
  cancelled: "contacted",
};

toursRouter.get("/", async (req, res) => {
  const { prospectId } = req.query;
  const tours = await db.tour.findMany({
    where: prospectId ? { prospectId: String(prospectId) } : undefined,
    orderBy: { scheduledTime: "asc" },
  });
  res.json(tours);
});

toursRouter.post("/", async (req, res) => {
  const parsed = CreateTourSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  let tour;
  try {
    tour = await db.tour.create({ data: parsed.data });
  } catch {
    return res.status(409).json({ error: "That unit is already booked at this time" });
  }

  const prospect = await db.prospect.findUnique({ where: { id: tour.prospectId } });
  if (!prospect) return res.status(404).json({ error: "Prospect not found" });

  if (prospect.status !== "tour_scheduled") {
    const updated = await db.prospect.update({
      where: { id: prospect.id },
      data: { status: "tour_scheduled" },
    });
    await runRules({ prospect: updated, db }, "tour_scheduled");
  }

  res.status(201).json(tour);
});

toursRouter.patch("/:id", async (req, res) => {
  const parsed = UpdateTourSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await db.tour.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Tour not found" });

  let tour;
  try {
    tour = await db.tour.update({ where: { id: req.params.id }, data: parsed.data });
  } catch {
    return res.status(409).json({ error: "That unit is already booked at this time" });
  }

  if (parsed.data.outcome) {
    const outcomeStatus = OUTCOME_STATUS[parsed.data.outcome];
    const prospect = await db.prospect.findUnique({ where: { id: tour.prospectId } });
    if (!prospect) return res.status(404).json({ error: "Prospect not found" });

    if (outcomeStatus && prospect.status !== outcomeStatus) {
      const updated = await db.prospect.update({
        where: { id: prospect.id },
        data: { status: outcomeStatus },
      });
      await runRules({ prospect: updated, db }, outcomeStatus);
    }
  }

  res.json(tour);
});
