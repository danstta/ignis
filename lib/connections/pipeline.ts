import { db } from "@/lib/db";
import { renderJobs } from "@/lib/db/schema";
import type { Binding } from "@/lib/db/schema";
import { listActiveBindingsForConnection } from "@/lib/bindings/service";
import { getTemplate } from "@/lib/templates/service";
import { getRenderer } from "@/lib/render/renderer";
import { storage } from "@/lib/storage";
import type { FieldMap } from "@/lib/connections/types";
import type { PlaceholderData, TemplateDoc } from "@/lib/editor/types";

/** Resolve a template's placeholder values from incoming fields via a binding. */
function resolveData(
  fieldMap: Record<string, string>,
  defaults: Record<string, string>,
  fields: FieldMap,
): PlaceholderData {
  const data: PlaceholderData = {};
  for (const [placeholderKey, fieldName] of Object.entries(fieldMap)) {
    data[placeholderKey] = fields[fieldName] ?? defaults[placeholderKey] ?? "";
  }
  // Defaults for placeholders not explicitly mapped.
  for (const [placeholderKey, value] of Object.entries(defaults)) {
    if (!(placeholderKey in data)) data[placeholderKey] = value;
  }
  return data;
}

/** Render a single binding with the given fields, store the PNG, and log a job. */
export async function renderBinding(
  binding: Binding,
  fields: FieldMap,
): Promise<string> {
  const data = resolveData(binding.fieldMap, binding.defaults, fields);
  try {
    const template = await getTemplate(binding.templateId);
    if (!template) throw new Error("template not found");

    const png = await getRenderer().render({
      doc: template.doc as TemplateDoc,
      data,
    });
    const key = `renders/${crypto.randomUUID()}.png`;
    const { url } = await storage().put(key, png, "image/png");

    const [job] = await db()
      .insert(renderJobs)
      .values({
        templateId: binding.templateId,
        connectionId: binding.connectionId,
        input: data,
        outputUrl: url,
        status: "success",
      })
      .returning({ id: renderJobs.id });
    return job.id;
  } catch (err) {
    const [job] = await db()
      .insert(renderJobs)
      .values({
        templateId: binding.templateId,
        connectionId: binding.connectionId,
        input: data,
        status: "error",
        error: err instanceof Error ? err.message : String(err),
      })
      .returning({ id: renderJobs.id });
    return job.id;
  }
}

export type PipelineResult = { processed: number; jobIds: string[] };

/**
 * For each active binding on the connection: resolve data, render a PNG, store it,
 * and record a render_job. Per-binding errors are recorded on the job rather than
 * failing the whole webhook.
 */
export async function processEvent(
  connectionId: string,
  _recordId: string,
  fields: FieldMap,
): Promise<PipelineResult> {
  const activeBindings = await listActiveBindingsForConnection(connectionId);
  const jobIds: string[] = [];
  for (const binding of activeBindings) {
    jobIds.push(await renderBinding(binding, fields));
  }
  return { processed: activeBindings.length, jobIds };
}
