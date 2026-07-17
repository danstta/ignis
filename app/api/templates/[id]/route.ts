import { NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/workspaces";
import {
  deleteTemplate,
  getTemplate,
  updateTemplate,
} from "@/lib/templates/service";
import { templateInputSchema } from "@/lib/templates/validation";
import type { TemplateInput } from "@/lib/templates/service";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/templates/[id]">,
) {
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const row = await getTemplate(ws.workspace.id, id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(
  req: Request,
  ctx: RouteContext<"/api/templates/[id]">,
) {
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = templateInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const row = await updateTemplate(ws.workspace.id, id, parsed.data as TemplateInput);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/templates/[id]">,
) {
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await deleteTemplate(ws.workspace.id, id);
  return new NextResponse(null, { status: 204 });
}
