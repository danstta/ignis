import type { NodeMeta } from "@/lib/nodes/types";
import type { PluginManifest } from "@/lib/plugins/types";
import { notionUpdatePageMeta } from "./nodes/notion-update-page/meta";

export const notionPlugin: PluginManifest = {
  id: "notion",
  name: "Notion",
  description: "Updates Notion pages from workflow runs.",
  defaultEnabled: true,
  nodes: [notionUpdatePageMeta as unknown as NodeMeta],
};
