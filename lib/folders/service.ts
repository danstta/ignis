import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { assets, folders, templates, workflows } from "@/lib/db/schema";
import type { FolderKind } from "@/lib/folders/types";

export type FolderInput = {
  kind: FolderKind;
  name: string;
};

function normalizeFolderName(name: string) {
  const normalized = name.trim().replace(/\s+/g, " ");
  if (!normalized) throw new Error("Folder name is required");
  if (normalized.length > 80) throw new Error("Folder name is too long");
  return normalized;
}

export async function listFolders(workspaceId: string, kind: FolderKind) {
  return db()
    .select({
      id: folders.id,
      kind: folders.kind,
      name: folders.name,
      iconUrl: folders.iconUrl,
      updatedAt: folders.updatedAt,
    })
    .from(folders)
    .where(and(eq(folders.workspaceId, workspaceId), eq(folders.kind, kind)))
    .orderBy(asc(folders.name));
}

export async function createFolder(workspaceId: string, input: FolderInput) {
  const rows = await db()
    .insert(folders)
    .values({
      workspaceId,
      kind: input.kind,
      name: normalizeFolderName(input.name),
    })
    .returning();
  return rows[0];
}

export async function renameFolder(
  workspaceId: string,
  id: string,
  name: string,
) {
  const rows = await db()
    .update(folders)
    .set({ name: normalizeFolderName(name), updatedAt: new Date() })
    .where(and(eq(folders.id, id), eq(folders.workspaceId, workspaceId)))
    .returning();
  if (!rows[0]) throw new Error("Folder not found");
  return rows[0];
}

export async function setFolderIcon(
  workspaceId: string,
  id: string,
  assetId: string | null,
) {
  let iconUrl: string | null = null;
  if (assetId) {
    // Scoped lookup: a foreign asset id must not become this folder's icon.
    const rows = await db()
      .select({ id: assets.id, url: assets.url })
      .from(assets)
      .where(and(eq(assets.id, assetId), eq(assets.workspaceId, workspaceId)))
      .limit(1);
    const asset = rows[0];
    if (!asset) throw new Error("Asset not found");
    iconUrl = asset.url;
  }

  const rows = await db()
    .update(folders)
    .set({ iconAssetId: assetId, iconUrl, updatedAt: new Date() })
    .where(and(eq(folders.id, id), eq(folders.workspaceId, workspaceId)))
    .returning();
  if (!rows[0]) throw new Error("Folder not found");
  return rows[0];
}

export async function deleteFolder(
  workspaceId: string,
  id: string,
  kind: FolderKind,
) {
  return db().transaction(async (tx) => {
    const folderRows = await tx
      .select({ id: folders.id, kind: folders.kind, name: folders.name })
      .from(folders)
      .where(
        and(
          eq(folders.id, id),
          eq(folders.workspaceId, workspaceId),
          eq(folders.kind, kind),
        ),
      )
      .limit(1);
    const folder = folderRows[0];
    if (!folder) throw new Error("Folder not found");

    const now = new Date();
    if (kind === "design") {
      await tx
        .update(templates)
        .set({ folderId: null, updatedAt: now })
        .where(eq(templates.folderId, id));
    } else {
      await tx
        .update(workflows)
        .set({ folderId: null, updatedAt: now })
        .where(eq(workflows.folderId, id));
    }

    const deletedRows = await tx
      .delete(folders)
      .where(
        and(
          eq(folders.id, id),
          eq(folders.workspaceId, workspaceId),
          eq(folders.kind, kind),
        ),
      )
      .returning({ id: folders.id });
    if (!deletedRows[0]) throw new Error("Folder not found");

    return folder;
  });
}

async function assertFolderKind(
  workspaceId: string,
  folderId: string | null,
  kind: FolderKind,
) {
  if (!folderId) return;
  const rows = await db()
    .select({ id: folders.id, kind: folders.kind })
    .from(folders)
    .where(and(eq(folders.id, folderId), eq(folders.workspaceId, workspaceId)))
    .limit(1);
  const folder = rows[0];
  if (!folder) throw new Error("Folder not found");
  if (folder.kind !== kind) {
    throw new Error("Folder cannot contain this item type");
  }
}

export async function moveTemplateToFolder(
  workspaceId: string,
  id: string,
  folderId: string | null,
) {
  await assertFolderKind(workspaceId, folderId, "design");
  const rows = await db()
    .update(templates)
    .set({ folderId, updatedAt: new Date() })
    .where(and(eq(templates.id, id), eq(templates.workspaceId, workspaceId)))
    .returning({ id: templates.id });
  if (!rows[0]) throw new Error("Design not found");
}

export async function moveWorkflowToFolder(
  workspaceId: string,
  id: string,
  folderId: string | null,
) {
  await assertFolderKind(workspaceId, folderId, "workflow");
  const rows = await db()
    .update(workflows)
    .set({ folderId, updatedAt: new Date() })
    .where(and(eq(workflows.id, id), eq(workflows.workspaceId, workspaceId)))
    .returning({ id: workflows.id });
  if (!rows[0]) throw new Error("Workflow not found");
}

export async function renameTemplate(
  workspaceId: string,
  id: string,
  name: string,
) {
  const rows = await db()
    .update(templates)
    .set({ name: normalizeFolderName(name), updatedAt: new Date() })
    .where(and(eq(templates.id, id), eq(templates.workspaceId, workspaceId)))
    .returning({ id: templates.id });
  if (!rows[0]) throw new Error("Design not found");
}

export async function renameWorkflow(
  workspaceId: string,
  id: string,
  name: string,
) {
  const rows = await db()
    .update(workflows)
    .set({ name: normalizeFolderName(name), updatedAt: new Date() })
    .where(and(eq(workflows.id, id), eq(workflows.workspaceId, workspaceId)))
    .returning({ id: workflows.id });
  if (!rows[0]) throw new Error("Workflow not found");
}
