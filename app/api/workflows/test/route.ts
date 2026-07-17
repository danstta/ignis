import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveWorkspace } from "@/lib/workspaces";
import { EntitlementLimitError, assertRunQuota } from "@/lib/entitlements";
import { runWorkflowTest } from "@/lib/workflows/test-runner";
import { workflowGraphSchema } from "@/lib/workflows/validation";

const testRequestSchema = z.object({
  graph: workflowGraphSchema,
  trigger: z.record(z.string(), z.unknown()).default({}),
  targetNodeId: z.string().optional(),
});

export async function POST(req: Request) {
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = testRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Test runs execute real nodes (renders, API calls), so they count against
  // the same run quota as production triggers.
  try {
    await assertRunQuota(ws.workspace.id);
  } catch (err) {
    if (err instanceof EntitlementLimitError) {
      return NextResponse.json({ error: err.message }, { status: 402 });
    }
    throw err;
  }

  // The graph arrives from the client: nodes execute with the tester's own
  // workspace, so embedded connection/template ids resolve only if owned.
  const result = await runWorkflowTest({
    workspaceId: ws.workspace.id,
    graph: parsed.data.graph,
    trigger: parsed.data.trigger,
    targetNodeId: parsed.data.targetNodeId,
  });
  return NextResponse.json(result);
}
