import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bindings } from "@/lib/db/schema";

export async function listBindingsForConnection(connectionId: string) {
  return db()
    .select()
    .from(bindings)
    .where(eq(bindings.connectionId, connectionId));
}

export async function listActiveBindingsForConnection(connectionId: string) {
  return db()
    .select()
    .from(bindings)
    .where(
      and(eq(bindings.connectionId, connectionId), eq(bindings.active, true)),
    );
}

export async function listBindingsForTemplate(templateId: string) {
  return db().select().from(bindings).where(eq(bindings.templateId, templateId));
}

export async function getBinding(id: string) {
  const rows = await db()
    .select()
    .from(bindings)
    .where(eq(bindings.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createBinding(input: {
  templateId: string;
  connectionId: string;
  fieldMap?: Record<string, string>;
  defaults?: Record<string, string>;
  active?: boolean;
}) {
  const rows = await db()
    .insert(bindings)
    .values({
      templateId: input.templateId,
      connectionId: input.connectionId,
      fieldMap: input.fieldMap ?? {},
      defaults: input.defaults ?? {},
      active: input.active ?? true,
    })
    .returning();
  return rows[0];
}

export async function updateBinding(
  id: string,
  patch: {
    fieldMap?: Record<string, string>;
    defaults?: Record<string, string>;
    active?: boolean;
  },
) {
  const rows = await db()
    .update(bindings)
    .set(patch)
    .where(eq(bindings.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function deleteBinding(id: string) {
  await db().delete(bindings).where(eq(bindings.id, id));
}
