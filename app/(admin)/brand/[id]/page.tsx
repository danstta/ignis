import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBrand } from "@/lib/brand/service";
import type { Brand } from "@/lib/brand/types";
import { BrandEditor } from "@/components/brand/brand-editor";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let row;
  try {
    row = await getBrand(id);
  } catch (err) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-dashed p-6 text-sm">
        <p className="font-medium">Database not reachable</p>
        <p className="mt-1 text-muted-foreground">
          {err instanceof Error ? err.message : String(err)}
        </p>
      </div>
    );
  }
  if (!row) notFound();

  const brand: Brand = {
    id: row.id,
    name: row.name,
    colors: row.colors ?? [],
    fonts: row.fonts ?? [],
    logoUrl: row.logoUrl,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        render={<Link href="/brand" />}
      >
        <ArrowLeft className="size-4" /> Brand identity
      </Button>

      <h1 className="text-2xl font-semibold">{row.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage this brand&apos;s colors, fonts, and logo.
      </p>

      <Separator className="my-6" />

      <BrandEditor brand={brand} />
    </div>
  );
}
