import {
  Cloud,
  History,
  Laptop,
  RefreshCw,
  Smartphone,
  TrendingUp,
  WifiOff,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shared art for the fictional "Social Card" template that threads through
 * every mockup on the page: the hero pipeline renders it, the design editor
 * edits it, and the run view uploads it. `CardPage` is the full 264×330
 * design; `CardPageThumb` scales it down for page strips and run outputs so
 * thumbnails show the real artwork, exactly like the app.
 */

export const CARD_GRADIENT =
  "linear-gradient(168deg, #241a3a 0%, #6e2b3d 42%, #c25a2e 74%, #eea45c 100%)";

/** Per-page variants for multi-page (carousel) views of the same template. */
export const CARD_PAGE_GRADIENTS = [
  CARD_GRADIENT,
  "linear-gradient(168deg, #1c2440 0%, #4f2f4a 45%, #a5522f 78%, #e3b06b 100%)",
  "linear-gradient(168deg, #2e1f33 0%, #834032 50%, #d1772f 80%, #f2c078 100%)",
];

/** Native design size of the card (1080×1350 at ~24.5%). */
export const CARD_BASE_WIDTH = 264;
export const CARD_BASE_HEIGHT = 330;

/** The fictional client brand stamped on the card. */
export function CardBrandRow() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full bg-white/90" />
      <span className="text-[9px] font-semibold tracking-[0.18em] text-white/90">
        ATLAS
      </span>
    </div>
  );
}

/** A floating glass icon chip — the poster's graphic motif, per page. */
type ArtChip = {
  icon: LucideIcon;
  left: string;
  top: string;
  size: number;
  rotate: number;
  emphasis?: boolean;
};

const CHIP_CLUSTERS: ArtChip[][] = [
  // Page 1 — the announcement: a cloud keeping a laptop and a phone in sync.
  [
    { icon: Cloud, left: "72%", top: "16%", size: 44, rotate: 0, emphasis: true },
    { icon: Laptop, left: "50%", top: "31%", size: 34, rotate: -8 },
    { icon: Smartphone, left: "87%", top: "33%", size: 30, rotate: 10 },
  ],
  // Page 2 — the feature list carries the detail; keep the art quiet.
  [
    { icon: RefreshCw, left: "84%", top: "14%", size: 36, rotate: 8, emphasis: true },
    { icon: Cloud, left: "66%", top: "26%", size: 28, rotate: -6 },
  ],
  // Page 3 — the stat page: speed.
  [
    { icon: Zap, left: "22%", top: "17%", size: 38, rotate: -8, emphasis: true },
    { icon: TrendingUp, left: "40%", top: "29%", size: 30, rotate: 6 },
  ],
];

/**
 * The decorative layers that make the card read as a designed asset instead
 * of a bare gradient: a soft key light, a fading dot grid, a loose cluster of
 * glass icon chips (the poster's motif), and a scrim that seats the type
 * block.
 */
export function CardArt({ variant = 0 }: { variant?: number }) {
  const chips = CHIP_CLUSTERS[variant % CHIP_CLUSTERS.length];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {/* Key light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(85% 60% at 78% 6%, rgba(255,233,205,0.22), transparent 62%)",
        }}
      />
      {/* Dot grid, fading toward the text block */}
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          WebkitMaskImage: "linear-gradient(180deg, black 20%, transparent 65%)",
          maskImage: "linear-gradient(180deg, black 20%, transparent 65%)",
        }}
      />
      {/* Floating glass icon chips */}
      {chips.map((chip) => (
        <span
          key={`${chip.left}-${chip.top}`}
          className={cn(
            "absolute flex items-center justify-center border backdrop-blur-sm",
            chip.emphasis
              ? "border-white/30 bg-white/[0.14] shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
              : "border-white/20 bg-white/[0.08]",
          )}
          style={{
            left: chip.left,
            top: chip.top,
            width: chip.size,
            height: chip.size,
            borderRadius: Math.round(chip.size * 0.28),
            transform: `translate(-50%, -50%) rotate(${chip.rotate}deg)`,
          }}
        >
          <chip.icon
            className="text-white/90"
            style={{ width: chip.size * 0.48, height: chip.size * 0.48 }}
          />
        </span>
      ))}
      {/* Scrim under the type block */}
      <div
        className="absolute inset-x-0 bottom-0 h-3/5"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(24,12,26,0.42) 55%, rgba(24,12,26,0.6))",
        }}
      />
    </div>
  );
}

const PAGE_2_FEATURES = [
  {
    icon: RefreshCw,
    title: "Real-time sync",
    desc: "Every device, updated instantly",
  },
  {
    icon: WifiOff,
    title: "Offline first",
    desc: "Edits merge when you're back",
  },
  {
    icon: History,
    title: "Version history",
    desc: "Every file, every change, kept",
  },
];

/**
 * One finished page of the Social Card template. Fills its parent — give the
 * parent the 4:5 box (or use `CardPageThumb` for a fixed-width miniature).
 */
export function CardPage({ index }: { index: number }) {
  const background = CARD_PAGE_GRADIENTS[index] ?? CARD_GRADIENT;

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden p-4"
      style={{ background }}
    >
      <CardArt variant={index} />

      <div className="relative flex flex-1 flex-col">
        <div className="flex items-start justify-between">
          <CardBrandRow />
          {index > 0 ? (
            <span className="font-mono text-[9px] tabular-nums text-white/50">
              0{index + 1}
            </span>
          ) : null}
        </div>

        {index === 0 ? (
          <div className="mt-auto">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/70">
              New on the blog
            </p>
            <p className="font-display mt-1.5 text-4xl font-bold leading-none text-white">
              Atlas Sync
            </p>
            <p className="mt-2 text-[11px] text-white/80">
              Your work, in sync everywhere
            </p>
          </div>
        ) : null}

        {index === 1 ? (
          <div className="mt-auto">
            <p className="font-display text-xl font-bold leading-tight text-white">
              What&apos;s new
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {PAGE_2_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-center gap-2.5 rounded-lg border border-white/15 bg-white/[0.08] px-2.5 py-2 backdrop-blur-sm"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white/15">
                    <feature.icon className="size-3 text-white" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold leading-tight text-white">
                      {feature.title}
                    </p>
                    <p className="truncate text-[9px] leading-tight text-white/65">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {index === 2 ? (
          <div className="mb-2 mt-auto">
            <p className="font-display text-[44px] font-bold leading-none text-white">
              2.4×
            </p>
            <p className="mt-1.5 text-[11px] text-white/80">
              faster content ops with Atlas Sync
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-2.5 py-1 font-mono text-[9px] text-white backdrop-blur-sm">
              atlas.app/sync →
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** A pixel-accurate miniature of `CardPage`, scaled like the app's thumbnails. */
export function CardPageThumb({
  index,
  width,
  className,
}: {
  index: number;
  width: number;
  className?: string;
}) {
  const scale = width / CARD_BASE_WIDTH;
  return (
    <div
      aria-hidden
      className={cn("overflow-hidden", className)}
      style={{ width, height: Math.round(width * (CARD_BASE_HEIGHT / CARD_BASE_WIDTH)) }}
    >
      <div
        style={{
          width: CARD_BASE_WIDTH,
          height: CARD_BASE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <CardPage index={index} />
      </div>
    </div>
  );
}
