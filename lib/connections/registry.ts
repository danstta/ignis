import type { ConnectionDefinition } from "./types";
import { notionConnection } from "./notion";

/**
 * Registry of available connection types. To add a new integration, implement a
 * ConnectionDefinition and add it here — the webhook route and UI pick it up.
 */
const definitions: ConnectionDefinition[] = [
  notionConnection as unknown as ConnectionDefinition,
];

const byId = new Map(definitions.map((d) => [d.id, d]));

export function listConnectionTypes(): ConnectionDefinition[] {
  return definitions;
}

export function getConnectionType(id: string): ConnectionDefinition | undefined {
  return byId.get(id);
}
