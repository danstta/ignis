"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/workspaces";
import {
  createFolder,
  deleteFolder,
  moveTemplateToFolder,
  moveWorkflowToFolder,
  renameFolder,
  renameTemplate,
  renameWorkflow,
  setFolderIcon,
} from "@/lib/folders/service";
import type { FolderKind } from "@/lib/folders/types";

function revalidateFolderSurfaces(kind: FolderKind) {
  revalidatePath("/", "layout");
  revalidatePath(kind === "design" ? "/templates" : "/workflows");
}

export async function createFolderAction(kind: FolderKind, name: string) {
  const ws = await requireWorkspace();
  const folder = await createFolder(ws.workspace.id, { kind, name });
  revalidateFolderSurfaces(kind);
  return { id: folder.id, kind: folder.kind, name: folder.name };
}

export async function renameFolderAction(kind: FolderKind, id: string, name: string) {
  const ws = await requireWorkspace();
  await renameFolder(ws.workspace.id, id, name);
  revalidateFolderSurfaces(kind);
}

export async function setFolderIconAction(
  kind: FolderKind,
  id: string,
  assetId: string | null,
) {
  const ws = await requireWorkspace();
  await setFolderIcon(ws.workspace.id, id, assetId);
  revalidateFolderSurfaces(kind);
}

export async function deleteFolderAction(kind: FolderKind, id: string) {
  const ws = await requireWorkspace();
  await deleteFolder(ws.workspace.id, id, kind);
  revalidateFolderSurfaces(kind);
}

export async function renameFolderItemAction({
  kind,
  itemId,
  name,
}: {
  kind: FolderKind;
  itemId: string;
  name: string;
}) {
  const ws = await requireWorkspace();
  if (kind === "design") {
    await renameTemplate(ws.workspace.id, itemId, name);
  } else {
    await renameWorkflow(ws.workspace.id, itemId, name);
  }
  revalidateFolderSurfaces(kind);
}

export async function moveFolderItemAction({
  kind,
  itemId,
  folderId,
}: {
  kind: FolderKind;
  itemId: string;
  folderId: string | null;
}) {
  const ws = await requireWorkspace();
  if (kind === "design") {
    await moveTemplateToFolder(ws.workspace.id, itemId, folderId);
  } else {
    await moveWorkflowToFolder(ws.workspace.id, itemId, folderId);
  }
  revalidateFolderSurfaces(kind);
}
