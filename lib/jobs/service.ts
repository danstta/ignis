import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { renderJobs, templates } from "@/lib/db/schema";

/** Recent render jobs (optionally for one connection), with template name. */
export async function listRecentJobs(connectionId?: string, limit = 24) {
  const q = db()
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
    .leftJoin(templates, eq(renderJobs.templateId, templates.id));

  const filtered = connectionId
    ? q.where(eq(renderJobs.connectionId, connectionId))
    : q;

  return filtered.orderBy(desc(renderJobs.createdAt)).limit(limit);
}
