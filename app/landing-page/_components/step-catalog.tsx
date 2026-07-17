import {
  ClipboardCheck,
  Eye,
  FolderOpen,
  ImageUp,
  Images,
  LayoutTemplate,
  Layers,
  Link2,
  type LucideIcon,
  MapPin,
  Plus,
  ScanEye,
  Sparkles,
  Split,
  Tags,
  Upload,
  UserCheck,
  Webhook,
} from "lucide-react";

import { GoogleDriveIcon } from "@/components/icons/google-drive";
import { NotionIcon } from "@/components/icons/notion";
import { cn } from "@/lib/utils";

/**
 * The step catalog as compact grouped rows: the group label on the left, its
 * steps as icon chips on the right, closed by a dashed "more every release"
 * row. Icons take the group's tint; Drive and Notion use their brand marks.
 */

interface Step {
  name: string;
  icon?: LucideIcon;
  brand?: React.ReactNode;
}

const GROUPS: { group: string; tone: string; steps: Step[] }[] = [
  {
    group: "Trigger",
    tone: "text-amber-600 dark:text-amber-400",
    steps: [{ name: "Webhook", icon: Webhook }],
  },
  {
    group: "Media",
    tone: "text-sky-600 dark:text-sky-400",
    steps: [
      { name: "Find Location Images", icon: MapPin },
      { name: "Curate Images", icon: Images },
      { name: "Rehost Image", icon: ImageUp },
    ],
  },
  {
    group: "AI",
    tone: "text-violet-600 dark:text-violet-400",
    steps: [
      { name: "Rank Images", icon: ScanEye },
      { name: "Categorize Images", icon: Tags },
      { name: "LLM Prompt", icon: Sparkles },
    ],
  },
  {
    group: "Design",
    tone: "text-ember",
    steps: [
      { name: "Render Template", icon: LayoutTemplate },
      { name: "Render Template Batch", icon: Layers },
      { name: "Preview Design Image", icon: Eye },
      { name: "Review Designs", icon: ClipboardCheck },
    ],
  },
  {
    group: "Flow",
    tone: "text-emerald-600 dark:text-emerald-400",
    steps: [
      { name: "Manual Review", icon: UserCheck },
      { name: "Router", icon: Split },
    ],
  },
  {
    group: "Google Drive",
    tone: "text-muted-foreground",
    steps: [
      {
        name: "List Drive Images",
        icon: FolderOpen,
        brand: <GoogleDriveIcon className="size-3.5 shrink-0" />,
      },
      {
        name: "Upload Drive Files",
        icon: Upload,
        brand: <GoogleDriveIcon className="size-3.5 shrink-0" />,
      },
    ],
  },
  {
    group: "Notion",
    tone: "text-muted-foreground",
    steps: [
      {
        name: "Update Notion Page",
        brand: <NotionIcon className="size-3.5 shrink-0" />,
      },
    ],
  },
  {
    group: "Utility",
    tone: "text-muted-foreground",
    steps: [{ name: "Run Link", icon: Link2 }],
  },
];

export function StepCatalog() {
  return (
    <div className="mt-12 flex flex-col divide-y divide-border border-y border-border">
      {GROUPS.map(({ group, tone, steps }) => (
        <div
          key={group}
          className="grid gap-x-4 gap-y-2 py-3.5 sm:grid-cols-[8.5rem_1fr] sm:items-baseline"
        >
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {group}
          </h3>
          <div className="flex flex-wrap gap-2">
            {steps.map((step) => (
              <span
                key={step.name}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card/50 px-2.5 py-1.5 text-xs font-medium"
              >
                {step.brand ??
                  (step.icon ? (
                    <step.icon className={cn("size-3.5 shrink-0", tone)} />
                  ) : null)}
                {step.name}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div className="grid gap-x-4 gap-y-2 py-3.5 sm:grid-cols-[8.5rem_1fr] sm:items-baseline">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground/70">
          Coming
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
            <Plus className="size-3.5 shrink-0" />
            More steps land with every release
          </span>
        </div>
      </div>
    </div>
  );
}
