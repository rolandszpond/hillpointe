import { z } from "zod";

export const TaskStateSchema = z.enum(["open", "done"]);
export type TaskState = z.infer<typeof TaskStateSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  dueDate: z.string().datetime(),
  assignee: z.string().optional(),
  state: TaskStateSchema,
  prospectId: z.string(),
  createdAt: z.string().datetime(),
});
export type Task = z.infer<typeof TaskSchema>;

export const CreateTaskSchema = TaskSchema.omit({ id: true, createdAt: true }).extend({
  state: TaskStateSchema.default("open"),
});
export type CreateTask = z.infer<typeof CreateTaskSchema>;
