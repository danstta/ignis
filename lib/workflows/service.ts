import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { workflows } from "@/lib/db/schema";
import type { WorkflowGraph } from "./types";

export type WorkflowInput = {
  name: string;
  active: boolean;
  graph: WorkflowGraph;
};

export async function listWorkflows(workspaceId: string) {
  return db()
    .select({
      id: workflows.id,
      name: workflows.name,
      folderId: workflows.folderId,
      active: workflows.active,
      updatedAt: workflows.updatedAt,
    })
    .from(workflows)
    .where(eq(workflows.workspaceId, workspaceId))
    .orderBy(desc(workflows.updatedAt));
}

/** A workflow scoped to the caller's workspace — for pages, routes and actions. */
export async function getWorkflow(workspaceId: string, id: string) {
  const rows = await db()
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.workspaceId, workspaceId)))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * INTERNAL by-id load for sessionless callers: the engine (startRun/resumeRun,
 * where the run's step ids must stay stable across Inngest replays) and the
 * public webhook ingest (which addresses a workflow by unguessable uuid). Both
 * derive tenancy FROM the returned row (`row.workspaceId`) instead of proving
 * it first. Never call this with an id from a signed-in user's request — use
 * {@link getWorkflow}.
 */
export async function getWorkflowById(id: string) {
  const rows = await db()
    .select()
    .from(workflows)
    .where(eq(workflows.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createWorkflow(workspaceId: string, input: WorkflowInput) {
  const rows = await db()
    .insert(workflows)
    .values({ ...input, workspaceId })
    .returning();
  return rows[0];
}

export async function updateWorkflow(
  workspaceId: string,
  id: string,
  input: WorkflowInput,
) {
  const rows = await db()
    .update(workflows)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(workflows.id, id), eq(workflows.workspaceId, workspaceId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteWorkflow(workspaceId: string, id: string) {
  await db()
    .delete(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.workspaceId, workspaceId)));
}
