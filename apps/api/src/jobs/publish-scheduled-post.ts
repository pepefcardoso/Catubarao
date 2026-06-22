import type { Job } from "bullmq";
import { prisma } from "@repo/db";

export async function publishScheduledPostJob(job: Job) {
  const { postId } = job.data;

  if (!postId) {
    throw new Error("Missing postId in job data");
  }

  const post = await prisma.transparencyPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    return;
  }

  if (post.isArchived || post.supersededById) {
    return;
  }

  await prisma.transparencyPost.update({
    where: { id: postId },
    data: {
      publishedAt: new Date(),
      scheduledFor: null,
    },
  });
}
