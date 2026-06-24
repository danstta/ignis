import crypto from "crypto";
import { z } from "zod";
import type {
  ConnectionDefinition,
  FieldDescriptor,
  WebhookResult,
} from "@/lib/connections/types";
import { describeDatabaseProperties, normalizePage } from "./normalize";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

const configSchema = z.object({
  integrationToken: z.string().default(""),
  databaseId: z.string().default(""),
  // Captured automatically from the verification handshake; doubles as the
  // HMAC secret for verifying subsequent events.
  verificationToken: z.string().optional(),
});

type NotionConfig = z.infer<typeof configSchema>;

async function notionFetch<T>(token: string, path: string): Promise<T> {
  const res = await fetch(`${NOTION_API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
    },
  });
  if (!res.ok) {
    throw new Error(`Notion API ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

function verifySignature(
  rawBody: string,
  secret: string,
  header: string | null,
): boolean {
  if (!header) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const notionConnection: ConnectionDefinition<NotionConfig> = {
  id: "notion",
  name: "Notion",
  description:
    "Fill template placeholders from a Notion database page via webhooks.",
  configFields: [
    {
      name: "integrationToken",
      label: "Internal integration token",
      type: "password",
      placeholder: "ntn_… or secret_…",
      help: "Create an internal integration in Notion and share the database with it.",
    },
    {
      name: "databaseId",
      label: "Database ID",
      type: "text",
      placeholder: "32-character id from the database URL",
      help: "Used to list fields available for binding.",
    },
  ],
  configSchema,

  async listFields(config): Promise<FieldDescriptor[]> {
    if (!config.integrationToken || !config.databaseId) return [];
    const db = await notionFetch<{
      properties?: Record<string, { type?: string }>;
    }>(config.integrationToken, `/databases/${config.databaseId}`);
    return describeDatabaseProperties(db.properties ?? {});
  },

  async handleWebhook(req, config, rawBody): Promise<WebhookResult> {
    let body: {
      verification_token?: string;
      entity?: { id?: string; type?: string };
    };
    try {
      body = JSON.parse(rawBody);
    } catch {
      return { type: "ignored", reason: "invalid JSON" };
    }

    // One-time verification handshake — capture the token (also the signing secret).
    if (body.verification_token) {
      return { type: "verification", verificationToken: body.verification_token };
    }

    if (!config.verificationToken) {
      return { type: "ignored", reason: "subscription not verified yet" };
    }
    if (
      !verifySignature(
        rawBody,
        config.verificationToken,
        req.headers.get("x-notion-signature"),
      )
    ) {
      return { type: "ignored", reason: "invalid signature" };
    }

    const pageId = body.entity?.id;
    const entityType = body.entity?.type;
    if (!pageId || (entityType && entityType !== "page")) {
      return { type: "ignored", reason: `unsupported entity: ${entityType}` };
    }
    if (!config.integrationToken) {
      return { type: "ignored", reason: "missing integration token" };
    }

    const page = await notionFetch<{
      properties?: Record<string, Record<string, unknown>>;
      cover?: { file?: { url?: string }; external?: { url?: string } } | null;
    }>(config.integrationToken, `/pages/${pageId}`);

    return { type: "event", recordId: pageId, fields: normalizePage(page) };
  },
};
