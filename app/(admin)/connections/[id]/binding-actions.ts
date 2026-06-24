"use server";

import { revalidatePath } from "next/cache";
import {
  createBinding,
  deleteBinding,
  getBinding,
  updateBinding,
} from "@/lib/bindings/service";
import { renderBinding } from "@/lib/connections/pipeline";

export async function createBindingAction(
  connectionId: string,
  templateId: string,
) {
  await createBinding({ connectionId, templateId });
  revalidatePath(`/connections/${connectionId}`);
}

export async function saveBindingAction(input: {
  id: string;
  connectionId: string;
  fieldMap: Record<string, string>;
  defaults: Record<string, string>;
  active: boolean;
}) {
  await updateBinding(input.id, {
    fieldMap: input.fieldMap,
    defaults: input.defaults,
    active: input.active,
  });
  revalidatePath(`/connections/${input.connectionId}`);
}

export async function deleteBindingAction(connectionId: string, id: string) {
  await deleteBinding(id);
  revalidatePath(`/connections/${connectionId}`);
}

/** Render a binding immediately using only its default values (no live event). */
export async function testBindingAction(connectionId: string, id: string) {
  const binding = await getBinding(id);
  if (!binding) throw new Error("Binding not found");
  await renderBinding(binding, {});
  revalidatePath(`/connections/${connectionId}`);
}
