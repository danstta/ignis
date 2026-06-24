import { NextResponse } from "next/server";
import { getRenderer } from "@/lib/render/renderer";
import { getTemplate } from "@/lib/templates/service";
import type { PlaceholderData, TemplateDoc } from "@/lib/editor/types";

type RenderBody = {
  doc?: TemplateDoc;
  templateId?: string;
  data?: PlaceholderData;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as RenderBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let doc = body.doc;
  if (!doc && body.templateId) {
    const row = await getTemplate(body.templateId);
    if (!row) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    doc = row.doc as TemplateDoc;
  }

  if (!doc || doc.version !== 1 || !Array.isArray(doc.elements)) {
    return NextResponse.json(
      { error: "Provide a valid `doc` or `templateId`." },
      { status: 400 },
    );
  }

  try {
    const png = await getRenderer().render({ doc, data: body.data });
    return new Response(png, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[/api/render] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
