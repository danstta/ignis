import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { waitlistSignups } from "@/lib/db/schema";

const waitlistInputSchema = z.object({
  email: z.email(),
  source: z.string().optional(),
});

/**
 * Basic in-memory sliding-window rate limit per client IP. Module-level state,
 * so on serverless each instance keeps its own window — good enough as a
 * best-effort brake on abuse, not a hard guarantee.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = waitlistInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  // Idempotent: duplicates are a no-op, and the response never reveals whether
  // the email was already on the list (prevents enumeration).
  await db()
    .insert(waitlistSignups)
    .values({ email, source: parsed.data.source ?? null })
    .onConflictDoNothing({ target: waitlistSignups.email });

  return NextResponse.json({ ok: true });
}
