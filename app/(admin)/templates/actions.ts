"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/workspaces";
import { deleteTemplate } from "@/lib/templates/service";

export async function deleteTemplateAction(id: string) {
  const ws = await requireWorkspace();
  await deleteTemplate(ws.workspace.id, id);
  revalidatePath("/templates");
}
