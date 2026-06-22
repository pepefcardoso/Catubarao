import { get, set } from "idb-keyval";

export interface QueuedCheckin {
  token: string;
  timestamp: number;
}

const QUEUE_KEY = "offline-checkins";

export async function queueCheckin(token: string) {
  const current = (await get<QueuedCheckin[]>(QUEUE_KEY)) || [];
  // Avoid duplicate scans in the queue for the same token
  if (!current.some((c) => c.token === token)) {
    current.push({
      token,
      timestamp: Date.now(),
    });
    await set(QUEUE_KEY, current);
  }
}

export async function getQueuedCheckins(): Promise<QueuedCheckin[]> {
  return (await get<QueuedCheckin[]>(QUEUE_KEY)) || [];
}

export async function clearQueuedCheckins() {
  await set(QUEUE_KEY, []);
}

export async function syncOfflineCheckins(eventId: string) {
  if (typeof window === "undefined" || !navigator.onLine) return;
  
  const checkins = await getQueuedCheckins();
  if (checkins.length === 0) return;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/checkin-bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checkins }),
    });

    if (res.ok) {
      await clearQueuedCheckins();
    } else {
      console.error("Failed to sync check-ins", await res.text());
    }
  } catch (err) {
    console.error("Error syncing offline check-ins", err);
  }
}
