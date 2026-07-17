/**
 * better-auth provider implementation. Nothing outside `lib/auth/`, the
 * `app/(auth)` pages, and the `app/api/auth` route may import this (or any
 * `better-auth` module) directly — app code goes through the `@/lib/auth` seam
 * so the provider stays swappable.
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { user, session, account, verification } from "@/lib/db/schema";
import { publicAppUrl, sessionSecret, signupsEnabled } from "@/lib/env";
import { ensurePersonalWorkspace } from "@/lib/workspaces/service";

/**
 * Social login is opt-in: a provider shows up only when its OAuth credentials
 * are present in the environment. Email/password always works, so a fresh
 * self-hosted deploy needs no external services.
 */
export type SocialProviderId = "google" | "github";

function socialProviders() {
  const providers: Partial<
    Record<
      SocialProviderId,
      {
        clientId: string;
        clientSecret: string;
        disableImplicitSignUp?: boolean;
      }
    >
  > = {};
  // Waitlist mode: existing users still social-sign-in, but an unknown
  // identity no longer auto-creates an account.
  const disableImplicitSignUp = !signupsEnabled();
  // Dedicated AUTH_* vars — deliberately NOT the GOOGLE_CLIENT_ID/SECRET pair
  // used by the Google Drive connection, so configuring Drive doesn't silently
  // enable a "Continue with Google" login button.
  const googleId = process.env.AUTH_GOOGLE_CLIENT_ID;
  const googleSecret = process.env.AUTH_GOOGLE_CLIENT_SECRET;
  if (googleId && googleSecret) {
    providers.google = {
      clientId: googleId,
      clientSecret: googleSecret,
      disableImplicitSignUp,
    };
  }
  const githubId = process.env.AUTH_GITHUB_CLIENT_ID;
  const githubSecret = process.env.AUTH_GITHUB_CLIENT_SECRET;
  if (githubId && githubSecret) {
    providers.github = {
      clientId: githubId,
      clientSecret: githubSecret,
      disableImplicitSignUp,
    };
  }
  return providers;
}

/** Provider ids with credentials configured — used to render social buttons. */
export function enabledSocialProviders(): SocialProviderId[] {
  return Object.keys(socialProviders()) as SocialProviderId[];
}

function makeAuth() {
  return betterAuth({
    database: drizzleAdapter(db(), {
      provider: "pg",
      schema: { user, session, account, verification },
    }),
    // Reuse the app's existing signing secret (SESSION_SECRET), not
    // BETTER_AUTH_SECRET — one secret env var for the whole app.
    secret: sessionSecret(),
    baseURL: publicAppUrl(),
    emailAndPassword: {
      enabled: true,
      // Waitlist mode: the sign-up endpoint 400s even if someone bypasses the
      // (also gated) /signup page and posts to the API directly.
      disableSignUp: !signupsEnabled(),
    },
    socialProviders: socialProviders(),
    databaseHooks: {
      user: {
        create: {
          // Personal-workspace fast path. Best-effort only: request-time
          // resolution (lib/workspaces/context) creates it just-in-time if
          // this hook ever fails, so never block sign-up on it. The Clerk
          // overlay calls the same service function from its own webhook.
          after: async (newUser) => {
            try {
              await ensurePersonalWorkspace(newUser.id, newUser.name);
            } catch (err) {
              console.warn(
                `Failed to create personal workspace for ${newUser.id}: ${
                  err instanceof Error ? err.message : String(err)
                }`,
              );
            }
          },
        },
      },
    },
  });
}

type Auth = ReturnType<typeof makeAuth>;

/**
 * Cache on globalThis so dev hot-reloads don't rebuild the instance (same
 * pattern as `lib/db`). Lazy so importing this module never throws on missing
 * env — only the code paths that use auth do.
 */
const globalForAuth = globalThis as unknown as { _betterAuth?: Auth };

export function auth(): Auth {
  if (!globalForAuth._betterAuth) globalForAuth._betterAuth = makeAuth();
  return globalForAuth._betterAuth;
}
