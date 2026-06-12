import { PrismaClient, Prospect } from "@prisma/client";
import { ProspectStatus } from "@repo/contracts";

type RuleContext = {
  prospect: Prospect;
  db: PrismaClient;
};

type Rule = {
  toStatus: ProspectStatus;
  apply: (ctx: RuleContext) => Promise<void>;
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const RULES: Rule[] = [
  {
    toStatus: "contacted",
    apply: async ({ prospect, db }) => {
      await db.task.create({
        data: {
          title: `Send tour availability to ${prospect.name}`,
          dueDate: addDays(new Date(), 2),
          prospectId: prospect.id,
          assignee: prospect.assignee,
          state: "open",
        },
      });
    },
  },
  {
    toStatus: "tour_scheduled",
    apply: async ({ prospect, db }) => {
      const tour = await db.tour.findFirst({
        where: { prospectId: prospect.id },
        orderBy: { scheduledTime: "desc" },
      });
      const dueDate = tour
        ? new Date(tour.scheduledTime.getTime() - 24 * 60 * 60 * 1000)
        : addDays(new Date(), 1);
      await db.task.create({
        data: {
          title: `Confirm tour 24h prior for ${prospect.name}`,
          dueDate,
          prospectId: prospect.id,
          assignee: prospect.assignee,
          state: "open",
        },
      });
    },
  },
  {
    toStatus: "toured",
    apply: async ({ prospect, db }) => {
      await db.task.create({
        data: {
          title: `Send application link to ${prospect.name}`,
          dueDate: addDays(new Date(), 1),
          prospectId: prospect.id,
          assignee: prospect.assignee,
          state: "open",
        },
      });
    },
  },
  {
    toStatus: "application",
    apply: async ({ prospect, db }) => {
      await db.task.create({
        data: {
          title: `Review application for ${prospect.name}`,
          dueDate: addDays(new Date(), 3),
          prospectId: prospect.id,
          assignee: prospect.assignee,
          state: "open",
        },
      });
    },
  },
  {
    toStatus: "leased",
    apply: async ({ prospect, db }) => {
      if (prospect.assignedUnitId) {
        await db.unit.update({
          where: { id: prospect.assignedUnitId },
          data: { status: "leased" },
        });
      }
      await db.task.updateMany({
        where: { prospectId: prospect.id, state: "open" },
        data: { state: "done" },
      });
      await db.activityEvent.create({
        data: {
          type: "unit_leased",
          summary: `${prospect.name} signed a lease`,
          prospectId: prospect.id,
          unitId: prospect.assignedUnitId,
        },
      });
    },
  },
  {
    toStatus: "lost",
    apply: async ({ prospect, db }) => {
      await db.task.updateMany({
        where: { prospectId: prospect.id, state: "open" },
        data: { state: "done" },
      });
    },
  },
];

export async function runRules(
  ctx: RuleContext,
  toStatus: ProspectStatus
): Promise<void> {
  await ctx.db.activityEvent.create({
    data: {
      type: "status_changed",
      summary: `Status changed to ${toStatus}`,
      prospectId: ctx.prospect.id,
    },
  });

  const rule = RULES.find((r) => r.toStatus === toStatus);
  if (rule) {
    await rule.apply(ctx);
  }
}
