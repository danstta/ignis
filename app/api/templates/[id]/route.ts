import { NextResponse } from "next/server";
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
  const { id } = await ctx.params;
  const row = await getTemplate(id);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(
  req: Request,
  ctx: RouteContext<"/api/templates/[id]">,
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = templateInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const row = await updateTemplate(id, parsed.data as TemplateInput);
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  _req: Request,
  ctx: RouteContext<"/api/templates/[id]">,
) {
  const { id } = await ctx.params;
  await deleteTemplate(id);
  return new NextResponse(null, { status: 204 });
}
