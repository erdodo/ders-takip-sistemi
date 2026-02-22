import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

export type WebhookEvent =
  | "lesson.processed"
  | "payment.created"
  | "customer.created"
  | "customer.updated"
  | "package.assigned"
  | "credit.low";

interface WebhookPayload {
  event: WebhookEvent;
  studioId: string;
  timestamp: string;
  data: Record<string, unknown>;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export async function fireWebhooks(
  studioId: string,
  event: WebhookEvent,
  data: Record<string, unknown>
) {
  try {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: { studioId, isActive: true, events: { has: event } },
    });
    if (endpoints.length === 0) return;

    const payload: WebhookPayload = {
      event,
      studioId,
      timestamp: new Date().toISOString(),
      data,
    };
    const bodyStr = JSON.stringify(payload);

    // Fire and forget — her endpoint için ayrı log kaydı
    await Promise.allSettled(
      endpoints.map(async (ep) => {
        const signature = sign(bodyStr, ep.secret);
        let status = "failed";
        let statusCode: number | null = null;
        let error: string | null = null;

        try {
          const res = await fetch(ep.url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Webhook-Event": event,
              "X-Webhook-Signature": `sha256=${signature}`,
              "X-Webhook-Timestamp": payload.timestamp,
            },
            body: bodyStr,
            signal: AbortSignal.timeout(8000), // 8 sn timeout
          });
          statusCode = res.status;
          status = res.ok ? "success" : "failed";
          if (!res.ok) error = `HTTP ${res.status}`;
        } catch (err: unknown) {
          error = err instanceof Error ? err.message : "Unknown error";
        }

        await prisma.webhookLog.create({
          data: {
            endpointId: ep.id,
            event,
            payload: bodyStr,
            status,
            statusCode,
            error,
          },
        });
      })
    );
  } catch {
    // Webhook hataları ana akışı durdurmaz
  }
}
