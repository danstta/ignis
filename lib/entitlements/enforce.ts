import { and, count, eq, gte, sql, sum } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  assets,
  workflowRuns,
  workflows,
  workspaceMembers,
} from "@/lib/db/schema";
import { getEntitlements } from ".";

/**
 * Enforcement points for plan limits. Each assert loads the workspace's
 * entitlements, measures current usage, and throws {@link EntitlementLimitError}
 * when the action would exceed a limit. With the self-hosted impl every limit
 * is null (unlimited), so the usage query is skipped entirely and these are
 * near-free.
 *
 * Wired at: run-trigger (webhook ingest + editor test run), asset-upload
 * (createAssetFromBytes funnel). Seat enforcement (assertSeatQuota) is ready
 * for the member-invite flow when it lands.
 */

export type EntitlementLimit = "runs" | "storage" | "seats";

/** Thrown when an action would exceed a plan limit. Routes map it to HTTP 402. */
export class EntitlementLimitError extends Error {
  readonly limit: EntitlementLimit;

  constructor(limit: EntitlementLimit, message: string) {
    super(message);
    this.name = "EntitlementLimitError";
    this.limit = limit;
  }
}

/** Throws when the workspace has used up this month's run allowance. */
export async function assertRunQuota(workspaceId: string): Promise<void> {
  const { maxRunsPerMonth } = await getEntitlements(workspaceId);
  if (maxRunsPerMonth === null) return;

  const rows = await db()
    .select({ n: count() })
    .from(workflowRuns)
    .innerJoin(workflows, eq(workflowRuns.workflowId, workflows.id))
    .where(
      and(
        eq(workflows.workspaceId, workspaceId),
        gte(workflowRuns.createdAt, sql`date_trunc('month', now())`),
      ),
    );
  if (rows[0].n >= maxRunsPerMonth) {
    throw new EntitlementLimitError(
      "runs",
      `Monthly run limit reached (${maxRunsPerMonth} runs). Upgrade your plan or wait for the next billing month.`,
    );
  }
}

/** Throws when storing `incomingBytes` more would exceed the storage allowance. */
export async function assertStorageQuota(
  workspaceId: string,
  incomingBytes: number,
): Promise<void> {
  const { maxStorageBytes } = await getEntitlements(workspaceId);
  if (maxStorageBytes === null) return;

  const rows = await db()
    .select({ used: sum(assets.bytes) })
    .from(assets)
    .where(eq(assets.workspaceId, workspaceId));
  const used = Number(rows[0].used ?? 0);
  if (used + incomingBytes > maxStorageBytes) {
    throw new EntitlementLimitError(
      "storage",
      `Storage limit reached (${formatBytes(maxStorageBytes)}). Delete unused assets or upgrade your plan.`,
    );
  }
}

/** Throws when the workspace already has as many members as its plan allows. */
export async function assertSeatQuota(workspaceId: string): Promise<void> {
  const { maxSeats } = await getEntitlements(workspaceId);
  if (maxSeats === null) return;

  const rows = await db()
    .select({ n: count() })
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceId));
  if (rows[0].n >= maxSeats) {
    throw new EntitlementLimitError(
      "seats",
      `Member limit reached (${maxSeats} seats). Upgrade your plan to invite more people.`,
    );
  }
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb % 1 === 0 ? gb : gb.toFixed(1)} GB`;
  const mb = bytes / 1024 ** 2;
  return `${mb % 1 === 0 ? mb : mb.toFixed(1)} MB`;
}
