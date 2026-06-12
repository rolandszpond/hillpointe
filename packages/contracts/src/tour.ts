import { z } from "zod";

export const TourOutcomeSchema = z.enum(["toured", "no_show", "cancelled"]);
export type TourOutcome = z.infer<typeof TourOutcomeSchema>;

export const TourSchema = z.object({
  id: z.string(),
  prospectId: z.string(),
  unitId: z.string(),
  scheduledTime: z.string().datetime(),
  outcome: TourOutcomeSchema.nullable(),
});
export type Tour = z.infer<typeof TourSchema>;

export const CreateTourSchema = TourSchema.omit({ id: true, outcome: true });
export type CreateTour = z.infer<typeof CreateTourSchema>;

export const UpdateTourSchema = TourSchema.omit({ id: true }).partial();
export type UpdateTour = z.infer<typeof UpdateTourSchema>;
