/**
 * Client-side auth API — the browser half of the `@/lib/auth` seam. Client
 * components import sign-in/sign-up/sign-out from here and never from
 * better-auth directly, so the provider stays swappable.
 */

import { createAuthClient } from "better-auth/react";

/** Same-origin by default; the /api/auth/* handler serves all calls. */
const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
