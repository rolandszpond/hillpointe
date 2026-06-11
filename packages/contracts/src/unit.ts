import { z } from "zod";

export const UnitStatusSchema = z.enum(["available", "held", "leased"]);
export type UnitStatus = z.infer<typeof UnitStatusSchema>;

export const UnitSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: UnitStatusSchema,
});
export type Unit = z.infer<typeof UnitSchema>;

export const CreateUnitSchema = UnitSchema.omit({ id: true });
export type CreateUnit = z.infer<typeof CreateUnitSchema>;

export const UpdateUnitSchema = CreateUnitSchema.partial();
export type UpdateUnit = z.infer<typeof UpdateUnitSchema>;
