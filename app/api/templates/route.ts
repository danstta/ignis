import { NextResponse } from "next/server";
import { getActiveWorkspace } from "@/lib/workspaces";
import { createTemplate, listTemplates } from "@/lib/templates/service";
import { templateInputSchema } from "@/lib/templates/validation";
import type { TemplateInput } from "@/lib/templates/service";

export async function GET() {
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await listTemplates(ws.workspace.id);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parsed = templateInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const row = await createTemplate(ws.workspace.id, parsed.data as TemplateInput);
  return NextResponse.json(row, { status: 201 });
}
