import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { renderJobs, templates } from "@/lib/db/schema";

/** Recent render jobs (optionally for one connection), with template name. */
export async function listRecentJobs(
  workspaceId: string,
  connectionId?: string,
  limit = 24,
) {
  const conditions = [eq(renderJobs.workspaceId, workspaceId)];
  if (connectionId) conditions.push(eq(renderJobs.connectionId, connectionId));

  return db()
    .select({
      id: renderJobs.id,
      templateId: renderJobs.templateId,
      templateName: templates.name,
      status: renderJobs.status,
      outputUrl: renderJobs.outputUrl,
      error: renderJobs.error,
      input: renderJobs.input,
      createdAt: renderJobs.createdAt,
    })
    .from(renderJobs)
    .leftJoin(templates, eq(renderJobs.templateId, templates.id))
    .where(and(...conditions))
    .orderBy(desc(renderJobs.createdAt))
    .limit(limit);
}
