import type { ZodType } from "zod";

/**
 * The connection plugin contract. Adding a new integration = implement this and
 * register it in `registry.ts`. The webhook route, config UI, and binding UI are
 * all driven generically off these definitions — no per-connection plumbing.
 */

/** Normalized incoming data: placeholder-able field name -> value (text or image URL). */
export type FieldMap = Record<string, string>;

/** A field a connection can provide, shown in the binding UI. */
export interface FieldDescriptor {
  key: string;
  label: string;
  kind: "text" | "image";
}

/** A config input the generic connection form should render. */
export interface ConfigField {
  name: string;
  label: string;
  type: "text" | "password";
  placeholder?: string;
  help?: string;
}

/** Result of handling an incoming webhook request. */
export type WebhookResult =
  | { type: "verification"; verificationToken: string }
  | { type: "event"; recordId: string; fields: FieldMap }
  | { type: "ignored"; reason?: string };

export interface ConnectionDefinition<
  Config extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Stable type id stored on connection instances, e.g. "notion". */
  id: string;
  name: string;
  description: string;
  /** Inputs the config UI renders (secrets use type "password"). */
  configFields: ConfigField[];
  /** Validates/normalizes stored config. */
  configSchema: ZodType<Config>;
  /** Fields available for binding; may call the source API using config. */
  listFields(config: Config): Promise<FieldDescriptor[]>;
  /**
   * Verify + parse an incoming webhook. `rawBody` is the exact request body text
   * (needed for signature verification); `req` exposes headers.
   */
  handleWebhook(
    req: Request,
    config: Config,
    rawBody: string,
  ): Promise<WebhookResult>;
}
