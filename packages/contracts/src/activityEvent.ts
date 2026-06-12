import { z } from "zod";

export const ActivityEventTypeSchema = z.enum([
  "status_changed",
  "task_created",
  "task_closed",
  "unit_leased",
]);
export type ActivityEventType = z.infer<typeof ActivityEventTypeSchema>;

export const ActivityEventSchema = z.object({
  id: z.string(),
  type: ActivityEventTypeSchema,
  summary: z.string(),
  timestamp: z.string().datetime(),
  prospectId: z.string(),
  unitId: z.string().nullable(),
});
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;
