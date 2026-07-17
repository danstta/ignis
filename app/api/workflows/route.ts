import { NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/workspaces";
import { createWorkflow, listWorkflows } from "@/lib/workflows/service";
import { workflowInputSchema } from "@/lib/workflows/validation";

export async function GET() {
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await listWorkflows(ws.workspace.id);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = workflowInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const row = await createWorkflow(ws.workspace.id, {
    name: parsed.data.name,
    active: parsed.data.active,
    graph: parsed.data.graph,
  });
  return NextResponse.json(row);
}
