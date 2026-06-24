import { NextResponse } from "next/server";
import { createTemplate, listTemplates } from "@/lib/templates/service";
import { templateInputSchema } from "@/lib/templates/validation";
import type { TemplateInput } from "@/lib/templates/service";

export async function GET() {
  const rows = await listTemplates();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = templateInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const row = await createTemplate(parsed.data as TemplateInput);
  return NextResponse.json(row, { status: 201 });
}
