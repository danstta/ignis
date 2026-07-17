/**
 * App-facing auth API — the seam between the app and the auth provider.
 *
 * App code imports ONLY from `@/lib/auth` (server) and `@/lib/auth/client`
 * (client components). The provider implementation lives in `lib/auth/impl/`
 * and is swappable (better-auth here; a hosted provider in the cloud overlay)
 * without touching any caller.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./impl/better-auth";

export { enabledSocialProviders } from "./impl/better-auth";
export type { SocialProviderId } from "./impl/better-auth";

/** The app's own user shape. Provider payloads are mapped into this. */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

export type AuthSession = { user: AuthUser };

/** Current session, or null when the request is anonymous. */
export async function getSession(): Promise<AuthSession | null> {
  const session = await auth().api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, email, name, image } = session.user;
  return { user: { id, email, name, image: image ?? null } };
}

/**
 * Current user, or a redirect to /login for anonymous requests. Use in server
 * components/actions that must not run without an account — the proxy gate is
 * optimistic (cookie presence only), so sensitive reads/mutations re-check here.
 */
export async function requireUser(): Promise<AuthUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}
