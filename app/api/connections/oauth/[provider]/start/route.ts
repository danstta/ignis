import { NextResponse } from "next/server";
import { publicAppUrl } from "@/lib/env";
import { getActiveWorkspace } from "@/lib/workspaces";
import { getConnectionType } from "@/lib/connections/registry";
import {
  buildAuthorizeUrl,
  getMissingOAuthEnv,
  redirectUri,
  signState,
} from "@/lib/connections/oauth";

/**
 * Kick off an OAuth connect flow. Optionally `?connectionId=…` to re-authorize an
 * existing account instead of creating a new one. Redirects to the provider's
 * consent screen; the callback finishes the exchange.
 */
export async function GET(
  req: Request,
  ctx: RouteContext<"/api/connections/oauth/[provider]/start">,
) {
  const { provider } = await ctx.params;
  const url = new URL(req.url);
  const connectionId = url.searchParams.get("connectionId") ?? undefined;
  const base = publicAppUrl() ?? `${url.protocol}//${url.host}`;
  const back = (err: string) => {
    const u = new URL(
      connectionId
        ? `/settings/connections/${connectionId}`
        : "/settings/connections",
      base,
    );
    u.searchParams.set("error", err);
    return NextResponse.redirect(u.toString());
  };

  const def = getConnectionType(provider);
  if (!def || def.auth.type !== "oauth") {
    return NextResponse.json(
      { error: `No OAuth provider "${provider}"` },
      { status: 400 },
    );
  }

  const missing = getMissingOAuthEnv(def.auth);
  if (missing.length > 0) {
    return back(`missing_oauth_env:${missing.join(",")}`);
  }

  // The workspace is resolved from the verified session HERE and carried in the
  // signed state, so the callback can trust where the tokens belong.
  const ws = await getActiveWorkspace();
  if (!ws) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const state = await signState({
    provider,
    workspaceId: ws.workspace.id,
    connectionId,
  });
  const authorizeUrl = buildAuthorizeUrl(
    def.auth,
    provider,
    redirectUri(provider, req),
    state,
  );
  return NextResponse.redirect(authorizeUrl);
}
