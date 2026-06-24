"use server";

import { revalidatePath } from "next/cache";
import { deleteTemplate } from "@/lib/templates/service";

export async function deleteTemplateAction(id: string) {
  await deleteTemplate(id);
  revalidatePath("/templates");
}
