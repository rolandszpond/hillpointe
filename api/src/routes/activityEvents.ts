import { Router } from "express";
import { db } from "../db.js";

export const activityEventsRouter = Router();

activityEventsRouter.get("/", async (req, res) => {
  const { prospectId } = req.query;
  if (!prospectId) return res.status(400).json({ error: "prospectId is required" });

  const events = await db.activityEvent.findMany({
    where: { prospectId: String(prospectId) },
    orderBy: { timestamp: "desc" },
  });
  res.json(events);
});
