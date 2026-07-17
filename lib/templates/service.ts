import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import {
  collectPlaceholders,
  migrateDoc,
  type TemplateDoc,
} from "@/lib/editor/types";

export type TemplateInput = {
  name: string;
  width: number;
  height: number;
  doc: TemplateDoc;
};

export async function listTemplates(workspaceId: string) {
  const rows = await db()
    .select({
      id: templates.id,
      name: templates.name,
      folderId: templates.folderId,
      width: templates.width,
      height: templates.height,
      doc: templates.doc,
      updatedAt: templates.updatedAt,
    })
    .from(templates)
    .where(eq(templates.workspaceId, workspaceId))
    .orderBy(desc(templates.updatedAt));
  // Normalize every stored doc to the current shape so callers only see v2.
  return rows.map((r) => ({ ...r, doc: migrateDoc(r.doc) }));
}

/** Templates with their placeholder keys resolved — used by the binding UI. */
export async function listTemplatesWithPlaceholders(workspaceId: string) {
  const rows = await db()
    .select({ id: templates.id, name: templates.name, doc: templates.doc })
    .from(templates)
    .where(eq(templates.workspaceId, workspaceId))
    .orderBy(desc(templates.updatedAt));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    placeholders: collectPlaceholders(migrateDoc(r.doc)),
  }));
}

export async function getTemplate(workspaceId: string, id: string) {
  const rows = await db()
    .select()
    .from(templates)
    .where(and(eq(templates.id, id), eq(templates.workspaceId, workspaceId)))
    .limit(1);
  const row = rows[0];
  // Normalize the stored doc to the current shape (lazy v1 -> v2 migration).
  return row ? { ...row, doc: migrateDoc(row.doc) } : null;
}

export async function createTemplate(workspaceId: string, input: TemplateInput) {
  const rows = await db()
    .insert(templates)
    .values({ ...input, workspaceId })
    .returning();
  return rows[0];
}

export async function updateTemplate(
  workspaceId: string,
  id: string,
  input: TemplateInput,
) {
  const rows = await db()
    .update(templates)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(templates.id, id), eq(templates.workspaceId, workspaceId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteTemplate(workspaceId: string, id: string) {
  await db()
    .delete(templates)
    .where(and(eq(templates.id, id), eq(templates.workspaceId, workspaceId)));
}
