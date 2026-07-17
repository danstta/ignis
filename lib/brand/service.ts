import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import type { Brand, BrandColor, BrandFont } from "./types";

/** Brands as the editor consumes them (id, name, colors, fonts, logoUrl). */
export async function listBrands(workspaceId: string): Promise<Brand[]> {
  const rows = await db()
    .select({
      id: brands.id,
      name: brands.name,
      colors: brands.colors,
      fonts: brands.fonts,
      logoUrl: brands.logoUrl,
    })
    .from(brands)
    .where(eq(brands.workspaceId, workspaceId))
    .orderBy(desc(brands.createdAt));
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    colors: r.colors ?? [],
    fonts: r.fonts ?? [],
    logoUrl: r.logoUrl,
  }));
}

export async function getBrand(workspaceId: string, id: string) {
  const rows = await db()
    .select()
    .from(brands)
    .where(and(eq(brands.id, id), eq(brands.workspaceId, workspaceId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createBrand(workspaceId: string, input: { name: string }) {
  const rows = await db()
    .insert(brands)
    .values({ workspaceId, name: input.name })
    .returning();
  return rows[0];
}

export async function updateBrand(
  workspaceId: string,
  id: string,
  patch: {
    name?: string;
    colors?: BrandColor[];
    fonts?: BrandFont[];
    logoUrl?: string | null;
  },
) {
  const rows = await db()
    .update(brands)
    .set({ ...patch, updatedAt: new Date() })
    .where(and(eq(brands.id, id), eq(brands.workspaceId, workspaceId)))
    .returning();
  return rows[0] ?? null;
}

export async function deleteBrand(workspaceId: string, id: string) {
  await db()
    .delete(brands)
    .where(and(eq(brands.id, id), eq(brands.workspaceId, workspaceId)));
}
