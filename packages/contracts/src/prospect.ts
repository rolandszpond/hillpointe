import { z } from "zod";

export const ProspectStatusSchema = z.enum([
  "new",
  "contacted",
  "tour_scheduled",
  "toured",
  "application",
  "leased",
  "lost",
]);
export type ProspectStatus = z.infer<typeof ProspectStatusSchema>;

export const ProspectSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  assignedUnitId: z.string().nullable(),
  status: ProspectStatusSchema,
  assignee: z.string().optional(),
});
export type Prospect = z.infer<typeof ProspectSchema>;

export const CreateProspectSchema = ProspectSchema.omit({ id: true }).extend({
  status: ProspectStatusSchema.default("new"),
  assignedUnitId: z.string().nullable().default(null),
});
export type CreateProspect = z.infer<typeof CreateProspectSchema>;

export const UpdateProspectSchema = ProspectSchema.omit({ id: true }).partial();
export type UpdateProspect = z.infer<typeof UpdateProspectSchema>;
