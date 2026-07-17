import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Braces,
  BringToFront,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Images,
  Maximize,
  Minus,
  Plus,
  Redo2,
  Save,
  SendToBack,
  Shapes as ShapesIcon,
  Trash2,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import { AppFrame } from "./app-frame";
import { MockSelect } from "./mock-ui";
import {
  CARD_BASE_HEIGHT,
  CARD_BASE_WIDTH,
  CARD_GRADIENT,
  CardArt,
  CardBrandRow,
  CardPageThumb,
} from "./social-card";

/**
 * The Ignis design editor, reproduced 1:1 from components/editor/* with the
 * real UI primitives and static values: floating toolbar (editor-toolbar.tsx),
 * canvas with a Moveable-style selection, zoom controls (editor-canvas.tsx),
 * page strip (page-strip.tsx), and the text properties panel
 * (properties-panel.tsx), lightly condensed so the frame fits one viewport.
 * Nothing is wired up.
 */

/** Moveable's default control-box blue. */
const SELECTION = "#44aaff";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h3>
  );
}

function SwitchRow({ label, on }: { label: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Switch defaultChecked={on} aria-label={label} />
    </div>
  );
}

/**
 * The Social Card on the canvas, its `title` placeholder layer selected.
 * Placeholder layers show their {token} on the canvas — the run fills them.
 */
function CanvasCard() {
  return (
    <div
      className="relative overflow-hidden rounded-sm shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_12px_44px_rgba(0,0,0,0.18)]"
      style={{
        width: CARD_BASE_WIDTH,
        height: CARD_BASE_HEIGHT,
        background: CARD_GRADIENT,
      }}
    >
      <CardArt variant={0} />

      <div className="absolute left-4 top-4">
        <CardBrandRow />
      </div>

      <div className="absolute inset-x-4 bottom-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/70">
          New on the blog
        </p>

        {/* Selected `title` text layer with Moveable-style handles. */}
        <div className="relative mt-1.5">
          <div
            className="pointer-events-none absolute -inset-px border"
            style={{ borderColor: SELECTION }}
          />
          {[
            "-left-1 -top-1",
            "left-1/2 -top-1 -translate-x-1/2",
            "-right-1 -top-1",
            "-left-1 top-1/2 -translate-y-1/2",
            "-right-1 top-1/2 -translate-y-1/2",
            "-bottom-1 -left-1",
            "-bottom-1 left-1/2 -translate-x-1/2",
            "-bottom-1 -right-1",
          ].map((pos) => (
            <span
              key={pos}
              className={cn("absolute size-2 rounded-full border bg-white", pos)}
              style={{ borderColor: SELECTION }}
            />
          ))}
          <p className="font-display py-1 text-4xl font-bold leading-none text-white/75">
            {"{title}"}
          </p>
        </div>

        <p className="mt-2 text-[11px] text-white/60">{"{subtitle}"}</p>
      </div>
    </div>
  );
}

function PageThumb({ active, index }: { active?: boolean; index: number }) {
  return (
    <div className="relative flex h-full flex-col justify-center">
      <div
        className={cn(
          "relative h-20 overflow-hidden rounded-md border bg-muted",
          active && "ring-2 ring-ring ring-offset-1 ring-offset-background",
        )}
        style={{ aspectRatio: "1080 / 1350" }}
      >
        <CardPageThumb index={index} width={64} />
      </div>
      <span className="pointer-events-none absolute bottom-1 left-1 rounded bg-background/80 px-1 text-[10px] font-medium tabular-nums text-muted-foreground backdrop-blur">
        {index + 1}
      </span>
    </div>
  );
}

export function DesignEditorMockup() {
  return (
    <AppFrame path="/editor/social-card">
      <div className="flex max-h-[97vh] items-stretch">
        {/* Canvas column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-[480px] flex-1 overflow-hidden bg-muted/40">
            {/* Floating toolbar — editor-toolbar.tsx */}
            <div className="pointer-events-none absolute left-3 right-3 top-3 z-20 flex justify-center">
              <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-hidden rounded-full border bg-background/90 p-1 shadow-sm shadow-black/10 backdrop-blur">
                <Button variant="ghost" size="icon" className="size-8" aria-label="Back to templates">
                  <ArrowLeft className="size-4" />
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ShapesIcon className="size-4" />
                  <span className="hidden sm:inline">Shapes</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Elements</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Braces className="size-4" />
                  <span className="hidden sm:inline">Placeholders</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Images className="size-4" />
                  <span className="hidden sm:inline">Assets</span>
                </Button>
                <Button variant="ghost" size="icon" className="size-8" aria-label="Undo">
                  <Undo2 className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8" aria-label="Redo" disabled>
                  <Redo2 className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex h-full items-center justify-center p-6 pt-16">
              {/* The card is drawn at thumbnail scale and zoomed up here so the
                  design fills the canvas like a fit-to-view in the real editor. */}
              <div className="scale-110 md:scale-150">
                <CanvasCard />
              </div>
            </div>

            {/* Zoom controls — editor-canvas.tsx */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-md border bg-background/90 p-1 shadow-sm backdrop-blur">
              <Button variant="ghost" size="icon" className="size-7" aria-label="Zoom out">
                <Minus className="size-4" />
              </Button>
              <span className="w-12 text-center text-xs tabular-nums">75%</span>
              <Button variant="ghost" size="icon" className="size-7" aria-label="Zoom in">
                <Plus className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-7" aria-label="Fit to view">
                <Maximize className="size-4" />
              </Button>
            </div>
          </div>

          {/* Page strip — page-strip.tsx */}
          <div className="flex h-28 shrink-0 items-center gap-3 overflow-x-hidden border-t bg-background px-3">
            <PageThumb active index={0} />
            <PageThumb index={1} />
            <PageThumb index={2} />
            <div
              className="flex h-20 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted/40 px-4 text-muted-foreground"
              style={{ aspectRatio: "1080 / 1350" }}
            >
              <Plus className="size-5" />
            </div>
          </div>
        </div>

        {/* Properties panel — editor.tsx + properties-panel.tsx */}
        <aside className="hidden w-80 shrink-0 flex-col overflow-hidden border-l bg-background md:flex">
          <div className="flex shrink-0 items-center gap-2 border-b p-3">
            <Input
              readOnly
              value="Social Card"
              aria-label="Template name"
              className="h-8 min-w-0 flex-1 font-medium"
            />
            <Button variant="outline" size="icon-sm" aria-label="Export">
              <Download className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="All changes saved"
              className="border-emerald-500/15 bg-emerald-500/[0.08] text-emerald-700 hover:bg-emerald-500/[0.12] dark:text-emerald-300"
            >
              <Save className="size-4" />
            </Button>
          </div>

          <div className="scrollbar-thin-muted min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-3 p-3">
              <div className="flex items-center justify-between">
                <SectionTitle>text</SectionTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Bring to front">
                    <BringToFront className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Forward">
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Backward">
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-7" aria-label="Send to back">
                    <SendToBack className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label="X">
                  <Input readOnly type="number" value={118} className="h-8" />
                </Field>
                <Field label="Y">
                  <Input readOnly type="number" value={702} className="h-8" />
                </Field>
                <Field label="Width">
                  <Input readOnly type="number" value={844} className="h-8" />
                </Field>
                <Field label="Height">
                  <Input readOnly type="number" value={186} className="h-8" />
                </Field>
                <Field label="Rotation">
                  <Input readOnly type="number" value={0} className="h-8" />
                </Field>
                <Field label="Opacity">
                  <Slider defaultValue={[1]} min={0} max={1} step={0.01} />
                </Field>
              </div>

              <Separator />

              <Field label="Placeholder key (leave empty for fixed text)">
                <Input readOnly value="title" placeholder="e.g. title" className="h-8" />
              </Field>
              <Field label="Fallback text">
                <Textarea readOnly value="Atlas Sync" rows={1} className="min-h-9" />
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Font">
                  <MockSelect value="Garet" className="font-display" />
                </Field>
                <Field label="Size">
                  <Input readOnly type="number" value={128} className="h-8" />
                </Field>
                <Field label="Style">
                  <Toggle
                    defaultPressed
                    variant="outline"
                    className="h-8 w-full justify-start px-2.5"
                    aria-label="Bold"
                  >
                    <Bold className="size-4" />
                    Bold
                  </Toggle>
                </Field>
                <Field label="Weight">
                  <MockSelect value="700" />
                </Field>
                <Field label="Line height">
                  <Input readOnly type="number" value={1.05} className="h-8" />
                </Field>
              </div>
              <Field label="Align">
                <ToggleGroup defaultValue={["left"]} variant="outline" className="w-full">
                  <ToggleGroupItem value="left" aria-label="Align left" className="flex-1">
                    <AlignLeft className="size-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center" aria-label="Align center" className="flex-1">
                    <AlignCenter className="size-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Align right" className="flex-1">
                    <AlignRight className="size-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </Field>
              <Field label="Color">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-8 shrink-0 rounded border bg-white" aria-label="Color" />
                    <Input readOnly value="#ffffff" className="h-8" />
                  </div>
                  {/* Brand swatches from the active Atlas brand kit. */}
                  <div className="flex flex-wrap gap-1">
                    {["#241a3a", "#6e2b3d", "#c25a2e", "#eea45c", "#ffffff"].map((c) => (
                      <span
                        key={c}
                        className="size-5 rounded-full border"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </Field>

              <Separator />
              <SectionTitle>Box</SectionTitle>
              <SwitchRow label="Center content" on />
              <SwitchRow label="Auto width (hug text)" />
              <SwitchRow label="Fit to box (auto size)" />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Padding X">
                  <Input readOnly type="number" value={0} className="h-8" />
                </Field>
                <Field label="Padding Y">
                  <Input readOnly type="number" value={0} className="h-8" />
                </Field>
              </div>

              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="size-4" /> Duplicate
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppFrame>
  );
}
