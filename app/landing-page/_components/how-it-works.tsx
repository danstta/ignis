import { ArrowDown } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  CARD_GRADIENT,
  CARD_PAGE_GRADIENTS,
  CardArt,
  CardBrandRow,
  CardPageThumb,
} from "./social-card";

/**
 * The "how it works" schematic: the Social Card template on the left, its
 * placeholder layers traced through an ember binding arrow into the Render
 * Template step of the workflow, and the rendered pages every run produces on
 * the right. A deliberately simplified diagram — the 1:1 mockups live in the
 * tour sections below it.
 */

const WORKFLOW_STEPS: {
  badge: string;
  label: string;
  isTrigger?: boolean;
  bindings?: { key: string; token: string }[];
}[] = [
  { badge: "S1", label: "Webhook", isTrigger: true },
  { badge: "S2", label: "List Drive Images" },
  { badge: "S3", label: "Rank Images" },
  { badge: "S4", label: "LLM Prompt" },
  {
    badge: "S5",
    label: "Render Template",
    bindings: [
      { key: "title", token: "{{S1.body.title}}" },
      { key: "subtitle", token: "{{S4.text}}" },
      { key: "background", token: "{{S3.best.url}}" },
    ],
  },
  { badge: "S6", label: "Upload Drive Files" },
];

function PanelLabel({ title, sub }: { title: string; sub: string }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
      {title} <span className="text-muted-foreground/60">· {sub}</span>
    </p>
  );
}

/** A placeholder key chip pinned to a layer's dashed outline. */
function KeyChip({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        "absolute rounded-full border bg-background px-2 py-0.5 font-mono text-[10px] leading-4 text-foreground shadow-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}

function TemplatePanel() {
  return (
    <div className="flex flex-col items-center gap-3">
      <PanelLabel title="Template" sub="Social Card" />
      <div
        className="relative w-52 rounded-xl"
        style={{ aspectRatio: "4 / 5", background: CARD_GRADIENT }}
      >
        <div aria-hidden className="absolute inset-0 overflow-hidden rounded-xl">
          <CardArt variant={0} />
        </div>
        {/* The whole card is the `background` image placeholder. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl border border-dashed border-white/40"
        />
        <KeyChip className="-top-2.5 right-3">background</KeyChip>

        <div className="absolute left-3.5 top-3.5">
          <CardBrandRow />
        </div>

        {/* The type block sits exactly where the render puts it: bottom-left. */}
        <div className="absolute inset-x-3.5 bottom-3.5">
          <p className="font-mono text-[7px] uppercase tracking-[0.22em] text-white/70">
            New on the blog
          </p>

          {/* `title` placeholder layer — unfilled until a run binds it. */}
          <div className="relative mt-1 border border-dashed border-white/60 px-1 py-1">
            <KeyChip className="-top-2.5 right-1">title</KeyChip>
            <p className="font-display text-2xl font-bold leading-none text-white/75">
              {"{title}"}
            </p>
          </div>

          {/* `subtitle` placeholder layer — unfilled until a run binds it. */}
          <div className="relative mt-2 border border-dashed border-white/40 px-1 py-1">
            <KeyChip className="-bottom-2.5 right-1">subtitle</KeyChip>
            <p className="text-[9px] leading-none text-white/60">
              {"{subtitle}"}
            </p>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">3 placeholders · 3 pages</p>
    </div>
  );
}

function WorkflowPanel() {
  return (
    <div className="flex flex-col items-center gap-3">
      <PanelLabel title="Workflow" sub="Blog to Social Posts" />
      <div className="flex w-56 flex-col gap-2">
        {WORKFLOW_STEPS.map((step) => (
          <div
            key={step.badge}
            className={cn(
              "rounded-lg border bg-background px-2.5 py-2 shadow-sm",
              step.bindings && "border-ember/60 ring-1 ring-ember/25",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex h-5 min-w-7 shrink-0 items-center justify-center rounded px-1 font-mono text-[10px] font-semibold",
                  step.isTrigger
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {step.badge}
              </span>
              <span className="truncate text-xs font-medium">{step.label}</span>
            </div>
            {step.bindings ? (
              <div className="mt-1.5 flex flex-col gap-1 border-t pt-1.5">
                {step.bindings.map((binding) => (
                  <p
                    key={binding.key}
                    className="truncate font-mono text-[9px] leading-[13px] text-muted-foreground"
                  >
                    {binding.key} ← <span className="text-ember">{binding.token}</span>
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function OutputPanel() {
  return (
    <div className="flex flex-col items-center gap-3">
      <PanelLabel title="Output" sub="every run" />
      <div className="relative w-44" style={{ aspectRatio: "4 / 5" }}>
        {/* Earlier runs fanned behind the latest render. */}
        <div
          aria-hidden
          className="absolute inset-0 origin-bottom -translate-x-3 -rotate-6 rounded-xl"
          style={{ background: CARD_PAGE_GRADIENTS[2] }}
        />
        <div
          aria-hidden
          className="absolute inset-0 origin-bottom translate-x-3 rotate-6 rounded-xl"
          style={{ background: CARD_PAGE_GRADIENTS[1] }}
        />
        <div className="relative overflow-hidden rounded-xl shadow-lg shadow-black/15">
          <CardPageThumb index={0} width={176} />
        </div>
      </div>
    </div>
  );
}

/**
 * Ember connector between panels. "bind" dips from the template's placeholder
 * layers down to the highlighted Render Template step; "render" rises from
 * that step back up to the output stack.
 */
function FlowArrow({ variant, label }: { variant: "bind" | "render"; label: string }) {
  const path =
    variant === "bind"
      ? "M2 150 C 40 150, 40 177, 60 177"
      : "M2 177 C 40 177, 40 100, 60 100";
  const headY = variant === "bind" ? 177 : 100;
  return (
    <div aria-hidden className="relative hidden justify-self-center lg:block">
      <svg
        width="72"
        height="200"
        viewBox="0 0 72 200"
        fill="none"
        className="flow-arrow overflow-visible"
      >
        <path d={path} className="dash" stroke="var(--ember)" strokeWidth="1.5" />
        <path
          d={`M60 ${headY - 4} L67 ${headY} L60 ${headY + 4}`}
          stroke="var(--ember)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground shadow-sm"
        style={{ top: variant === "bind" ? "calc(50% + 58px)" : "calc(50% + 43px)" }}
      >
        {label}
      </span>
    </div>
  );
}

/** Stacked-layout stand-in for FlowArrow below lg. */
function MobileArrow({ label }: { label: string }) {
  return (
    <div aria-hidden className="flex items-center gap-2 lg:hidden">
      <ArrowDown className="size-4 text-ember" />
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function HowItWorks() {
  return (
    <div className="flex flex-col items-center gap-7 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)] lg:items-center lg:gap-0">
      <TemplatePanel />
      <FlowArrow variant="bind" label="bound in S5" />
      <MobileArrow label="bound in S5" />
      <WorkflowPanel />
      <FlowArrow variant="render" label="rendered" />
      <MobileArrow label="rendered" />
      <OutputPanel />
    </div>
  );
}
