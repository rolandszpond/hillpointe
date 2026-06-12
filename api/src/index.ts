import express from "express";
import cors from "cors";
import { unitsRouter } from "./routes/units.js";
import { prospectsRouter } from "./routes/prospects.js";
import { tasksRouter } from "./routes/tasks.js";
import { activityEventsRouter } from "./routes/activityEvents.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/units", unitsRouter);
app.use("/api/prospects", prospectsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/activity-events", activityEventsRouter);

app.listen(3001, () => {
  console.log("API running on http://localhost:3001");
});
