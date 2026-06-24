import type { FieldMap } from "@/lib/connections/types";

/**
 * Convert a Notion page's `properties` object into a flat string FieldMap.
 * Pure (no network) so it can be unit-tested with sample payloads.
 */

type RichText = { plain_text?: string };
type NotionFile = { file?: { url?: string }; external?: { url?: string } };

function richTextToString(value: RichText[] | undefined): string {
  if (!Array.isArray(value)) return "";
  return value.map((t) => t.plain_text ?? "").join("");
}

function fileUrl(file: NotionFile | undefined): string {
  if (!file) return "";
  return file.file?.url ?? file.external?.url ?? "";
}

function propertyToString(prop: Record<string, unknown>): string {
  const type = prop?.type as string | undefined;
  if (!type) return "";
  const v = prop[type];

  switch (type) {
    case "title":
    case "rich_text":
      return richTextToString(v as RichText[]);
    case "url":
    case "email":
    case "phone_number":
      return (v as string) ?? "";
    case "number":
      return v === null || v === undefined ? "" : String(v);
    case "checkbox":
      return v ? "true" : "false";
    case "select":
    case "status":
      return (v as { name?: string } | null)?.name ?? "";
    case "multi_select":
      return ((v as { name?: string }[]) ?? []).map((o) => o.name ?? "").join(", ");
    case "people":
      return ((v as { name?: string }[]) ?? []).map((p) => p.name ?? "").join(", ");
    case "date": {
      const d = v as { start?: string; end?: string } | null;
      if (!d?.start) return "";
      return d.end ? `${d.start} – ${d.end}` : d.start;
    }
    case "files":
      return fileUrl(((v as NotionFile[]) ?? [])[0]);
    case "formula": {
      const f = v as Record<string, unknown>;
      const ft = f?.type as string;
      return ft ? String(f[ft] ?? "") : "";
    }
    case "rollup": {
      const r = v as Record<string, unknown>;
      const rt = r?.type as string;
      return rt ? String(r[rt] ?? "") : "";
    }
    default:
      return "";
  }
}

/** Notion page properties + cover -> FieldMap keyed by property name. */
export function normalizePage(page: {
  properties?: Record<string, Record<string, unknown>>;
  cover?: NotionFile | null;
}): FieldMap {
  const fields: FieldMap = {};
  for (const [name, prop] of Object.entries(page.properties ?? {})) {
    fields[name] = propertyToString(prop);
  }
  const cover = fileUrl(page.cover ?? undefined);
  if (cover) fields["cover"] = cover;
  return fields;
}

/** Map a Notion database schema to bindable fields. */
export function describeDatabaseProperties(
  properties: Record<string, { type?: string }>,
): { key: string; label: string; kind: "text" | "image" }[] {
  const fields = Object.entries(properties).map(([name, prop]) => ({
    key: name,
    label: name,
    kind: prop.type === "files" ? ("image" as const) : ("text" as const),
  }));
  fields.push({ key: "cover", label: "Page cover", kind: "image" });
  return fields;
}
