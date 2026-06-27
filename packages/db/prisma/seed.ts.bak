import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rules = [
    { type: "CHECKIN", points: 50 },
    { type: "REFERRAL", points: 200 },
    { type: "ANNIVERSARY", points: 250 },
    { type: "STREAK_6M", points: 500 },
    { type: "STREAK_12M", points: 1000 },
    { type: "STREAK_24M", points: 1500 },
    { type: "STREAK_36M", points: 3000 },
    { type: "STREAK_60M", points: 6000 },
  ];

  for (const rule of rules) {
    await prisma.gamificationRule.upsert({
      where: { type: rule.type as any },
      update: { points: rule.points },
      create: { type: rule.type as any, points: rule.points },
    });
  }

  console.log("Gamification rules seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
