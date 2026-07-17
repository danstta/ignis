import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { connections } from "@/lib/db/schema";
import { openConfig, sealConfig } from "./crypto";

type ConnectionRow = typeof connections.$inferSelect;

/** Decrypt a row's config before it leaves the service (returns a new object). */
function openRow(row: ConnectionRow): ConnectionRow {
  return { ...row, config: openConfig(row.config ?? {}) };
}

export async function listConnections(workspaceId: string) {
  const rows = await db()
    .select()
    .from(connections)
    .where(eq(connections.workspaceId, workspaceId))
    .orderBy(desc(connections.createdAt));
  return rows.map(openRow);
}

/**
 * A connection scoped to the caller's workspace. Rows hold live credentials, so
 * every caller with a session (pages, routes, actions) and every engine node
 * (via ctx.workspaceId) must use this — the workspace check is what stops a
 * foreign connection id smuggled into a workflow graph from resolving.
 */
export async function getConnection(workspaceId: string, id: string) {
  const rows = await db()
    .select()
    .from(connections)
    .where(and(eq(connections.id, id), eq(connections.workspaceId, workspaceId)))
    .limit(1);
  return rows[0] ? openRow(rows[0]) : null;
}

/**
 * INTERNAL by-id lookup for callers that hold a proven capability instead of a
 * session: the token-refresh path under an already-authorized connection
 * (ensureFreshToken) and the HMAC-verified public image proxy. Never call this
 * with a user-supplied id.
 */
export async function getConnectionById(id: string) {
  const rows = await db()
    .select()
    .from(connections)
    .where(eq(connections.id, id))
    .limit(1);
  return rows[0] ? openRow(rows[0]) : null;
}

export async function createConnection(
  workspaceId: string,
  input: {
    type: string;
    name: string;
    config?: Record<string, unknown>;
  },
) {
  const rows = await db()
    .insert(connections)
    .values({
      workspaceId,
      type: input.type,
      name: input.name,
      config: sealConfig(input.config ?? {}),
    })
    .returning();
  return openRow(rows[0]);
}

export async function updateConnection(
  workspaceId: string,
  id: string,
  patch: { name?: string; config?: Record<string, unknown> },
) {
  const rows = await db()
    .update(connections)
    .set(
      patch.config !== undefined
        ? { ...patch, config: sealConfig(patch.config) }
        : patch,
    )
    .where(and(eq(connections.id, id), eq(connections.workspaceId, workspaceId)))
    .returning();
  return rows[0] ? openRow(rows[0]) : null;
}

/** Shallow-merge new values into a connection's stored config. */
export async function mergeConnectionConfig(
  workspaceId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  const current = await getConnection(workspaceId, id);
  if (!current) return null;
  return updateConnection(workspaceId, id, {
    config: { ...(current.config ?? {}), ...patch },
  });
}

/**
 * INTERNAL merge for the token-refresh path (see {@link getConnectionById}) —
 * persists refreshed OAuth tokens under an id that was already authorized.
 */
export async function mergeConnectionConfigById(
  id: string,
  patch: Record<string, unknown>,
) {
  const current = await getConnectionById(id);
  if (!current) return null;
  const rows = await db()
    .update(connections)
    .set({ config: sealConfig({ ...(current.config ?? {}), ...patch }) })
    .where(eq(connections.id, id))
    .returning();
  return rows[0] ? openRow(rows[0]) : null;
}

export async function deleteConnection(workspaceId: string, id: string) {
  await db()
    .delete(connections)
    .where(and(eq(connections.id, id), eq(connections.workspaceId, workspaceId)));
}
