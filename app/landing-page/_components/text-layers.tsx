import { cn } from "@/lib/utils";

/**
 * Text-layer feature specimens for the Design section: each tile demos one
 * real capability of the type engine (properties-panel.tsx / fit-text.ts /
 * brand kits) with a small visual instead of a screenshot.
 */

/** Brand-kit swatches — the same palette the Social Card art is built from. */
const BRAND_SWATCHES = ["#241a3a", "#6e2b3d", "#c25a2e", "#eea45c", "#ffffff"];

function Demo({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg border bg-muted/25">
      {children}
    </div>
  );
}

const TILES: { title: string; desc: string; demo: React.ReactNode }[] = [
  {
    title: "Auto width",
    desc: "The box hugs whatever a run sends, whether it's one word or a whole sentence.",
    demo: (
      <div className="flex flex-col items-start gap-2">
        <span className="border border-dashed border-foreground/35 px-1.5 py-0.5 text-[11px] font-medium">
          Sync
        </span>
        <span className="border border-dashed border-foreground/35 px-1.5 py-0.5 text-[11px] font-medium">
          Atlas Sync for Teams
        </span>
      </div>
    ),
  },
  {
    title: "Fit to box",
    desc: "Or draw a fixed box and the type scales to fill it — long headlines never overflow.",
    demo: (
      <div className="flex h-12 w-36 items-center justify-center border border-dashed border-foreground/35">
        <span className="font-display text-xl font-bold leading-none">
          ATLAS SYNC
        </span>
      </div>
    ),
  },
  {
    title: "Custom fonts",
    desc: "Add .woff, .ttf, or .otf files to your brand kit — previews and renders use the exact same file.",
    demo: (
      <div className="flex items-baseline gap-5">
        <span className="font-display text-3xl font-bold">Ag</span>
        <span className="font-serif text-3xl">Ag</span>
        <span className="font-mono text-2xl">Ag</span>
      </div>
    ),
  },
  {
    title: "Nine-point alignment",
    desc: "Anchor text to any corner, edge, or center — plus weight and line height per layer.",
    demo: (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "size-1.5 rounded-full",
              i === 4 ? "bg-ember" : "bg-muted-foreground/30",
            )}
          />
        ))}
      </div>
    ),
  },
  {
    title: "Brand colors",
    desc: "Your brand kit's palette sits inside every color picker, one click from any layer.",
    demo: (
      <div className="flex gap-1.5">
        {BRAND_SWATCHES.map((color) => (
          <span
            key={color}
            className="size-5 rounded-full border"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    ),
  },
  {
    title: "Fallback text",
    desc: "If a run sends no value, the layer renders its fallback instead of an empty box.",
    demo: (
      <div className="flex items-center gap-2 font-mono text-[11px]">
        <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
          title
        </span>
        <span className="text-muted-foreground">∅ →</span>
        <span className="font-medium">Atlas Sync</span>
      </div>
    ),
  },
];

export function TextLayers() {
  return (
    <div className="mt-16 border-t border-border pt-10">
      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        Under the hood
      </p>
      <h3 className="font-display mt-2 text-xl font-bold tracking-tight sm:text-2xl">
        The type engine underneath
      </h3>
      <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Placeholder layers are real text layers — measured, fitted, and typeset
        the same way in the editor, the preview, and every render.
      </p>
      <div className="mt-6 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => (
          <div key={tile.title}>
            <Demo>{tile.demo}</Demo>
            <h4 className="mt-3 text-sm font-semibold">{tile.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {tile.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
