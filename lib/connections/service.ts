import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { connections } from "@/lib/db/schema";

export async function listConnections() {
  return db()
    .select()
    .from(connections)
    .orderBy(desc(connections.createdAt));
}

export async function getConnection(id: string) {
  const rows = await db()
    .select()
    .from(connections)
    .where(eq(connections.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createConnection(input: {
  type: string;
  name: string;
  config?: Record<string, unknown>;
}) {
  const rows = await db()
    .insert(connections)
    .values({ type: input.type, name: input.name, config: input.config ?? {} })
    .returning();
  return rows[0];
}

export async function updateConnection(
  id: string,
  patch: { name?: string; config?: Record<string, unknown> },
) {
  const rows = await db()
    .update(connections)
    .set(patch)
    .where(eq(connections.id, id))
    .returning();
  return rows[0] ?? null;
}

/** Shallow-merge new values into a connection's stored config. */
export async function mergeConnectionConfig(
  id: string,
  patch: Record<string, unknown>,
) {
  const current = await getConnection(id);
  if (!current) return null;
  return updateConnection(id, {
    config: { ...(current.config ?? {}), ...patch },
  });
}

export async function deleteConnection(id: string) {
  await db().delete(connections).where(eq(connections.id, id));
}
