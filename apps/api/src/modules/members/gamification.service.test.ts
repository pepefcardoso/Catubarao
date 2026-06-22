import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@repo/db";
import { recordGamificationEvent, getMemberPoints, getLeaderboard } from "./gamification.service";
import { NotFoundError } from "../../lib/errors";

describe("Gamification Service", () => {
  let memberId: string;

  beforeAll(async () => {
    // Create a dummy member
    const member = await prisma.member.create({
      data: {
        id: \`test-gamification-\${Date.now()}\`,
        name: "Gamification Test",
        email: \`gami.\${Date.now()}@test.com\`,
        showOnLeaderboard: true,
      } as any,
    });
    memberId = member.id;

    // Create rules
    await (prisma as any).gamificationRule.createMany({
      data: [
        { type: "CHECKIN", points: 10 },
        { type: "ANNIVERSARY", points: 50 },
      ],
      skipDuplicates: true,
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.member.delete({ where: { id: memberId } }).catch(() => {});
    await (prisma as any).gamificationRule.deleteMany({
      where: { type: { in: ["CHECKIN", "ANNIVERSARY"] } },
    }).catch(() => {});
  });

  it("should record a new gamification event", async () => {
    const event = await recordGamificationEvent(memberId, "CHECKIN", prisma, null, \`CHECKIN_123_\${Date.now()}\`);
    expect(event).toBeDefined();
    expect(event.points).toBe(10);
    expect(event.type).toBe("CHECKIN");
  });

  it("should prevent duplicate events with the same idempotency key", async () => {
    const idempotencyKey = \`ANNIVERSARY_2026_\${Date.now()}\`;
    const event1 = await recordGamificationEvent(memberId, "ANNIVERSARY", prisma, null, idempotencyKey);
    const event2 = await recordGamificationEvent(memberId, "ANNIVERSARY", prisma, null, idempotencyKey);
    
    expect(event1.id).toBe(event2.id); // Should return the same event
  });

  it("should throw NotFoundError if rule is not found", async () => {
    await expect(recordGamificationEvent(memberId, "STREAK_6M", prisma)).rejects.toThrowError(NotFoundError);
  });

  it("should correctly aggregate member points", async () => {
    const { totalPoints, breakdown } = await getMemberPoints(memberId, prisma);
    expect(totalPoints).toBe(60); // 10 + 50
    const checkinPoints = breakdown.find((b) => b.type === "CHECKIN")?.points;
    expect(checkinPoints).toBe(10);
  });

  it("should include opted-in member in leaderboard", async () => {
    const leaderboard = await getLeaderboard(10, prisma);
    const entry = leaderboard.find((l) => l.memberId === memberId);
    expect(entry).toBeDefined();
    expect(entry?.totalPoints).toBe(60);
  });
});
