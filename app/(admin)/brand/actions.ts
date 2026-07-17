"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireWorkspace } from "@/lib/workspaces";
import { createBrand, deleteBrand, updateBrand } from "@/lib/brand/service";
import type { BrandColor, BrandFont } from "@/lib/brand/types";

export async function createBrandAction(formData: FormData) {
  const ws = await requireWorkspace();
  const name = String(formData.get("name") || "Untitled brand").trim();
  const brand = await createBrand(ws.workspace.id, {
    name: name || "Untitled brand",
  });
  redirect(`/brand/${brand.id}`);
}

export async function saveBrandAction(
  id: string,
  data: {
    name: string;
    colors: BrandColor[];
    fonts: BrandFont[];
    logoUrl: string | null;
  },
) {
  const ws = await requireWorkspace();
  await updateBrand(ws.workspace.id, id, {
    name: data.name.trim() || "Untitled brand",
    colors: data.colors,
    fonts: data.fonts,
    logoUrl: data.logoUrl?.trim() ? data.logoUrl.trim() : null,
  });
  revalidatePath(`/brand/${id}`);
  revalidatePath("/brand");
}

export async function deleteBrandAction(id: string) {
  const ws = await requireWorkspace();
  await deleteBrand(ws.workspace.id, id);
  redirect("/brand");
}
