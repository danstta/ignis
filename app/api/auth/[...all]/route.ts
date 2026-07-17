import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/impl/better-auth";

// Lazy wrapper (not `auth().handler`) so importing the route at build time
// never constructs the auth instance — matching the lib/env philosophy.
export const { GET, POST } = toNextJsHandler((req: Request) =>
  auth().handler(req),
);
