import { notFound } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { getTemplate } from "@/lib/templates/service";
import { listBrands } from "@/lib/brand/service";
import { emptyDoc, type TemplateDoc } from "@/lib/editor/types";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Brands are an editor convenience; the editor must still work without a DB.
  const brands = await listBrands().catch(() => []);

  if (id === "new") {
    return (
      <Editor
        template={{ id: null, name: "Untitled template", doc: emptyDoc() }}
        brands={brands}
      />
    );
  }

  const row = await getTemplate(id);
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
