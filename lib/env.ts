/**
 * Centralized, lazy env access. Values are read at call time (not import time) so
 * `next build` never fails on a missing var — only the code path that needs it does.
 */

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example.`,
    );
  }
  return v;
}

export const databaseUrl = () => required("DATABASE_URL");

export const adminPassword = () => required("ADMIN_PASSWORD");

/** Cookie signing secret. Falls back to a dev-only constant outside production. */
export function sessionSecret(): string {
  const v = process.env.SESSION_SECRET;
  if (v) return v;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production. See .env.example.");
  }
  return "dev-only-insecure-secret-change-me";
}

export const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN;
export const notionWebhookSecret = () => process.env.NOTION_WEBHOOK_SECRET;
export const notionApiToken = () => process.env.NOTION_API_TOKEN;
