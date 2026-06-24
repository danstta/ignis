"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { deleteBrandAction, saveBrandAction } from "@/app/(admin)/brand/actions";
import type { Brand, BrandColor, BrandFont } from "@/lib/brand/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function BrandEditor({ brand }: { brand: Brand }) {
  const [name, setName] = useState(brand.name);
  const [colors, setColors] = useState<BrandColor[]>(brand.colors);
  const [fonts, setFonts] = useState<BrandFont[]>(brand.fonts);
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl ?? "");
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();

  const updateColor = (i: number, patch: Partial<BrandColor>) =>
    setColors((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  const addColor = () =>
    setColors((cs) => [
      ...cs,
      { id: crypto.randomUUID(), name: "", value: "#000000" },
    ]);
  const removeColor = (i: number) =>
    setColors((cs) => cs.filter((_, idx) => idx !== i));

  const updateFont = (i: number, patch: Partial<BrandFont>) =>
    setFonts((fs) => fs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const addFont = () => setFonts((fs) => [...fs, { name: "" }]);
  const removeFont = (i: number) =>
    setFonts((fs) => fs.filter((_, idx) => idx !== i));

  function save() {
    startSave(async () => {
      try {
        await saveBrandAction(brand.id, {
          name,
          // Drop blank rows so empty inputs don't pollute the saved palette.
          colors: colors.filter((c) => c.value.trim()),
          fonts: fonts.filter((f) => f.name.trim()),
          logoUrl,
        });
        toast.success("Brand saved");
      } catch (err) {
        toast.error("Failed to save", { description: String(err) });
      }
    });
  }

  function remove() {
    if (!window.confirm(`Delete brand "${brand.name}"?`)) return;
    startDelete(() => {
      void deleteBrandAction(brand.id);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="brand-name">Brand name</Label>
        <Input
          id="brand-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Separator />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold">Colors</h2>
          <p className="text-xs text-muted-foreground">
            These appear as swatches in every color picker in the editor.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {colors.length === 0 ? (
            <p className="text-xs text-muted-foreground">No colors yet.</p>
          ) : (
            colors.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2">
                <input
                  type="color"
                  value={c.value}
                  onChange={(e) => updateColor(i, { value: e.target.value })}
                  className="size-8 shrink-0 cursor-pointer rounded border bg-transparent"
                  aria-label={`Color ${i + 1} value`}
                />
                <Input
                  value={c.value}
                  onChange={(e) => updateColor(i, { value: e.target.value })}
                  className="h-8 w-28 shrink-0"
                  aria-label={`Color ${i + 1} hex`}
                />
                <Input
                  value={c.name}
                  onChange={(e) => updateColor(i, { name: e.target.value })}
                  placeholder="Name (e.g. Primary)"
                  className="h-8"
                  aria-label={`Color ${i + 1} name`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => removeColor(i)}
                  aria-label="Remove color"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
        <Button variant="outline" size="sm" className="self-start" onClick={addColor}>
          <Plus className="size-4" /> Add color
        </Button>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold">Fonts</h2>
          <p className="text-xs text-muted-foreground">
            Selectable in the editor&apos;s font picker. Note: the PNG renderer is
            currently locked to Inter, so brand fonts render as Inter in exports until
            a font file is wired up.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {fonts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No fonts yet.</p>
          ) : (
            fonts.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={f.name}
                  onChange={(e) => updateFont(i, { name: e.target.value })}
                  placeholder="Font family (e.g. Roboto)"
                  className="h-8 w-48 shrink-0"
                  aria-label={`Font ${i + 1} family`}
                />
                <Input
                  value={f.url ?? ""}
                  onChange={(e) =>
                    updateFont(i, { url: e.target.value || undefined })
                  }
                  placeholder="Font file URL (.woff/.ttf/.otf) — optional"
                  className="h-8"
                  aria-label={`Font ${i + 1} file URL`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0"
                  onClick={() => removeFont(i)}
                  aria-label="Remove font"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))
          )}
        </div>
        <Button variant="outline" size="sm" className="self-start" onClick={addFont}>
          <Plus className="size-4" /> Add font
        </Button>
      </section>

      <Separator />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold">Logo</h2>
          <p className="text-xs text-muted-foreground">
            Insert it onto the canvas from the editor&apos;s Add menu.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {logoUrl.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              className="size-12 shrink-0 rounded border object-contain"
            />
          ) : null}
          <Input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://…"
            className="max-w-md"
            aria-label="Logo URL"
          />
        </div>
      </section>

      <Separator />

      <div className="flex items-center justify-between">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save brand"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={remove}
          disabled={deleting}
        >
          <Trash2 className="size-4" /> Delete brand
        </Button>
      </div>
    </div>
  );
}
