"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/workspaces";
import {
  createConnection,
  deleteConnection,
  getConnection,
  updateConnection,
} from "@/lib/connections/service";
import { getOAuthEnvRefreshToken } from "@/lib/connections/oauth";
import { getConnectionType } from "@/lib/connections/registry";

/** Create a key-based account, then open its detail page to enter credentials. */
export async function createConnectionAction(formData: FormData) {
  const ws = await requireWorkspace();
  const type = String(formData.get("type") ?? "");
  const def = getConnectionType(type);
  if (!def) throw new Error(`Unknown connection type: ${type}`);
  if (def.auth.type !== "keys") {
    throw new Error(`${def.name} connects via OAuth, not a form`);
  }
  const name = String(formData.get("name") || def.name);
  const conn = await createConnection(ws.workspace.id, { type, name });
  redirect(`/settings/connections/${conn.id}`);
}

/** Create an OAuth connection that uses a fixed account refresh token from env. */
export async function createEnvOAuthConnectionAction(formData: FormData) {
  const ws = await requireWorkspace();
  const type = String(formData.get("type") ?? "");
  const def = getConnectionType(type);
  if (!def) throw new Error(`Unknown connection type: ${type}`);
  if (def.auth.type !== "oauth") {
    throw new Error(`${def.name} is not an OAuth provider`);
  }
  if (!getOAuthEnvRefreshToken(def.auth)) {
    throw new Error(
      `Missing required environment variable: ${def.auth.refreshTokenEnv ?? "refresh token"}`,
    );
  }

  // Self-host semantics: the operator's env refresh token backs this row. The
  // cloud overlay gates/disables env-credential connections entirely.
  const conn = await createConnection(ws.workspace.id, {
    type,
    name: String(formData.get("name") || `${def.name} (env)`),
    config: {
      credential_source: "env",
      scope: def.auth.scopes.join(" "),
    },
  });
  redirect(`/settings/connections/${conn.id}`);
}

/** Save the name and (for key-based providers) credential fields. */
export async function updateConnectionConfigAction(
  id: string,
  formData: FormData,
) {
  const ws = await requireWorkspace();
  const conn = await getConnection(ws.workspace.id, id);
  if (!conn) throw new Error("Connection not found");
  const def = getConnectionType(conn.type);
  if (!def) throw new Error(`Unknown connection type: ${conn.type}`);

  const fields = def.auth.type === "keys" ? def.auth.fields : [];
  const patch: Record<string, unknown> = {};
  for (const f of fields) {
    const v = formData.get(f.name);
    if (v !== null) patch[f.name] = String(v).trim();
  }
  const name = String(formData.get("name") || conn.name);
  const missingRequired = fields.filter(
    (field) =>
      field.required !== false &&
      !String(patch[field.name] ?? conn.config?.[field.name] ?? "").trim(),
  );
  if (missingRequired.length > 0) {
    throw new Error(
      `Missing required field: ${missingRequired.map((f) => f.label).join(", ")}`,
    );
  }

  // Preserve existing config (e.g. OAuth tokens) while applying edits.
  await updateConnection(ws.workspace.id, id, {
    name,
    config: { ...(conn.config ?? {}), ...patch },
  });
  revalidatePath(`/settings/connections/${id}`);
}

export async function deleteConnectionAction(id: string) {
  const ws = await requireWorkspace();
  await deleteConnection(ws.workspace.id, id);
  redirect("/settings/connections");
}
