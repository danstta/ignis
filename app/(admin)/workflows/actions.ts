"use server";

import { revalidatePath } from "next/cache";
import { requireWorkspace } from "@/lib/workspaces";
import { deleteWorkflow } from "@/lib/workflows/service";

export async function deleteWorkflowAction(id: string) {
  const ws = await requireWorkspace();
  await deleteWorkflow(ws.workspace.id, id);
  revalidatePath("/workflows");
}
