import { notFound } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { getTemplate } from "@/lib/templates/service";
import { listBrands } from "@/lib/brand/service";
import { requireWorkspace } from "@/lib/workspaces";
import { emptyDoc, type TemplateDoc } from "@/lib/editor/types";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await requireWorkspace();

  // Brands are an editor convenience; the editor must still work without a DB.
  const brands = await listBrands(ctx.workspace.id).catch(() => []);

  if (id === "new") {
    return (
      <Editor
        template={{ id: null, name: "Untitled template", doc: emptyDoc() }}
        brands={brands}
      />
    );
  }

  const row = await getTemplate(ctx.workspace.id, id);
  if (!row) notFound();

  return (
    <Editor
      template={{
        id: row.id,
        name: row.name,
        doc: row.doc as TemplateDoc,
      }}
      brands={brands}
    />
  );
}
