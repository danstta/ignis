"use server";

import { requireWorkspace } from "@/lib/workspaces";
import { getLatestWebhookEvent } from "@/lib/workflows/webhook-events";

/**
 * Return the most recent payload posted to a Webhook node's URL, so the editor
 * can detect its fields. Null if nothing has been received yet.
 */
export async function captureWebhookSampleAction(
  workflowId: string,
  nodeId: string,
): Promise<Record<string, unknown> | null> {
  const ws = await requireWorkspace();
  const event = await getLatestWebhookEvent(ws.workspace.id, workflowId, nodeId);
  return event ? (event.payload as Record<string, unknown>) : null;
}
