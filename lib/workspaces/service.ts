import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { workspaceMembers, workspaces } from "@/lib/db/schema";

/**
 * Provider-neutral workspace service. Deliberately free of any auth imports so
 * the better-auth impl (and the cloud overlay's provider impl) can call
 * {@link ensurePersonalWorkspace} from their own user-creation hooks without a
 * dependency cycle through the `lib/auth` seam.
 */

export type WorkspaceRole = "owner" | "member";

/** A workspace as seen through one user's membership. */
export type WorkspaceSummary = {
  id: string;
  name: string;
  role: WorkspaceRole;
};

/** Workspaces the user belongs to, oldest membership first (stable default). */
export async function listUserWorkspaces(
  userId: string,
): Promise<WorkspaceSummary[]> {
  const rows = await db()
    .select({
      id: workspaces.id,
      name: workspaces.name,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userId, userId))
    .orderBy(asc(workspaceMembers.createdAt));
  return rows;
}

/** Create a workspace with `userId` as its owner. */
export async function createWorkspaceWithOwner(
  userId: string,
  name: string,
): Promise<WorkspaceSummary> {
  return db().transaction(async (tx) => {
    const [ws] = await tx.insert(workspaces).values({ name }).returning();
    await tx
      .insert(workspaceMembers)
      .values({ workspaceId: ws.id, userId, role: "owner" });
    return { id: ws.id, name: ws.name, role: "owner" };
  });
}

/**
 * Guarantee the user has at least one workspace, creating their personal one on
 * first need. Called from the provider's user-create hook (fast path) and from
 * request-time workspace resolution (JIT fallback — which also covers accounts
 * that predate workspaces, and provider impls without a create hook). The
 * advisory lock makes concurrent first requests agree on a single workspace
 * instead of racing two into existence.
 */
export async function ensurePersonalWorkspace(
  userId: string,
  userName?: string | null,
): Promise<WorkspaceSummary> {
  const existing = await listUserWorkspaces(userId);
  if (existing.length > 0) return existing[0];

  return db().transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext(${`workspace:ensure:${userId}`}))`,
    );
    // Re-check under the lock: a concurrent request may have won the race.
    const won = await tx
      .select({
        id: workspaces.id,
        name: workspaces.name,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, userId))
      .orderBy(asc(workspaceMembers.createdAt))
      .limit(1);
    if (won[0]) return won[0];

    const [ws] = await tx
      .insert(workspaces)
      .values({ name: personalWorkspaceName(userName) })
      .returning();
    await tx
      .insert(workspaceMembers)
      .values({ workspaceId: ws.id, userId, role: "owner" });
    return { id: ws.id, name: ws.name, role: "owner" };
  });
}

function personalWorkspaceName(userName?: string | null): string {
  const trimmed = userName?.trim();
  return trimmed ? `${trimmed}'s workspace` : "Personal";
}
