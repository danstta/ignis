import { NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/workspaces";
import {
  deleteWorkflow,
  getWorkflow,
  updateWorkflow,
} from "@/lib/workflows/service";
import { workflowInputSchema } from "@/lib/workflows/validation";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/workflows/[id]">,
) {
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const row = await getWorkflow(ws.workspace.id, id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(
  req: Request,
  ctx: RouteContext<"/api/workflows/[id]">,
) {
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = workflowInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const row = await updateWorkflow(ws.workspace.id, id, {
    name: parsed.data.name,
    active: parsed.data.active,
    graph: parsed.data.graph,
  });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/workflows/[id]">,
) {
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await deleteWorkflow(ws.workspace.id, id);
  return new NextResponse(null, { status: 204 });
}
