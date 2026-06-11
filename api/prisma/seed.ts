import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  await db.unit.deleteMany();
  await db.prospect.deleteMany();

  const units = await Promise.all([
    db.unit.create({ data: { name: "101", status: "available" } }),
    db.unit.create({ data: { name: "102", status: "available" } }),
    db.unit.create({ data: { name: "203", status: "held" } }),
    db.unit.create({ data: { name: "204", status: "leased" } }),
    db.unit.create({ data: { name: "305", status: "available" } }),
  ]);

  await Promise.all([
    db.prospect.create({
      data: {
        name: "Alice Johnson",
        email: "alice@example.com",
        phone: "555-0101",
        status: "new",
        assignee: "Sarah M.",
        assignedUnitId: null,
      },
    }),
    db.prospect.create({
      data: {
        name: "Bob Smith",
        email: "bob@example.com",
        phone: "555-0102",
        status: "contacted",
        assignee: "Sarah M.",
        assignedUnitId: units[0].id,
      },
    }),
    db.prospect.create({
      data: {
        name: "Carol White",
        email: "carol@example.com",
        phone: "555-0103",
        status: "tour_scheduled",
        assignee: "James K.",
        assignedUnitId: units[1].id,
      },
    }),
    db.prospect.create({
      data: {
        name: "David Lee",
        email: "david@example.com",
        status: "toured",
        assignee: "James K.",
        assignedUnitId: units[2].id,
      },
    }),
    db.prospect.create({
      data: {
        name: "Eva Martinez",
        email: "eva@example.com",
        phone: "555-0105",
        status: "application",
        assignee: "Sarah M.",
        assignedUnitId: units[2].id,
      },
    }),
    db.prospect.create({
      data: {
        name: "Frank Chen",
        email: "frank@example.com",
        phone: "555-0106",
        status: "leased",
        assignee: "James K.",
        assignedUnitId: units[3].id,
      },
    }),
    db.prospect.create({
      data: {
        name: "Grace Kim",
        email: "grace@example.com",
        status: "lost",
        assignee: "Sarah M.",
        assignedUnitId: null,
      },
    }),
  ]);

  console.log("Seeded 5 units and 7 prospects.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
