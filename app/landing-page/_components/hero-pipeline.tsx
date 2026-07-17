import { Fragment, type CSSProperties } from "react";
import { FolderOpen, Images, LayoutTemplate, ScanEye, Webhook } from "lucide-react";

import { CardPage } from "./social-card";

/**
 * The hero's signature: a compact workflow that "ignites" — an ember spark
 * travels down the chain, lighting each step badge as it passes, and lands in
 * the rendered card. Timing lives in landing.css (badge-ignite/spark-fall);
 * reduced-motion users see the finished, static pipeline.
 */

const STEPS = [
  { badge: "S1", label: "Webhook", sub: 'post: "Atlas Sync"', icon: Webhook },
  { badge: "S2", label: "List Drive Images", sub: "18 brand images", icon: FolderOpen },
  { badge: "S3", label: "Rank Images", sub: "vision model · best 0.96", icon: ScanEye },
  { badge: "S4", label: "Render Template", sub: "Social Card · 3 pages", icon: LayoutTemplate },
];

const DOTS_MASK = "radial-gradient(ellipse at center, black 55%, transparent 100%)";

export function HeroPipeline() {
  return (
    <div className="hero-pipeline relative">
      {/* The workflow editor's dotted canvas, fading out at the edges. */}
      <div
        aria-hidden
        className="absolute -inset-10 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          WebkitMaskImage: DOTS_MASK,
          maskImage: DOTS_MASK,
        }}
      />

      <div className="flex w-64 flex-col">
        {STEPS.map((step, i) => (
          <Fragment key={step.badge}>
            <div className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2 shadow-sm">
              <span
                className="hero-badge flex h-6 min-w-9 shrink-0 items-center justify-center rounded-md bg-muted px-1.5 font-mono text-[11px] font-semibold text-muted-foreground"
                style={{ "--seq": i } as CSSProperties}
              >
                {step.badge}
              </span>
              <step.icon className="size-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <span className="block truncate text-xs font-medium">
                  {step.label}
                </span>
                <span className="block truncate font-mono text-[10px] text-muted-foreground">
                  {step.sub}
                </span>
              </div>
            </div>
            <div className="relative ml-[30px] h-5 w-px bg-border">
              <span
                className="hero-spark absolute left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-ember"
                style={{ "--seq": i } as CSSProperties}
              />
            </div>
          </Fragment>
        ))}

        <div className="hero-card relative w-64 overflow-hidden rounded-xl">
          {/* Empty frame shown until the spark reaches the render step. */}
          <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/40">
            <Images className="size-6 text-muted-foreground/40" />
          </div>
          {/* The rendered card, revealed when S4 "finishes". */}
          <div className="hero-card-render relative">
            <div className="aspect-[4/5]">
              <CardPage index={0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
