import type { ComponentType, SVGProps } from "react";

import {
  AnthropicDark,
  AnthropicLight,
  Asana,
  Atlassian,
  Bluesky,
  Canva,
  ClickUp,
  Cohere,
  DeepSeek,
  Discord,
  Dropbox,
  Facebook,
  Figma,
  Gemini,
  GitHubDark,
  GitHubLight,
  Gmail,
  GoogleAnalytics,
  GoogleCalendar,
  GoogleDrive,
  GoogleSheets,
  GrokDark,
  GrokLight,
  Groq,
  HuggingFace,
  Instagram,
  Linear,
  LinkedIn,
  Loom,
  MicrosoftAzure,
  MicrosoftExcel,
  MicrosoftOneDrive,
  MicrosoftTeams,
  MistralAI,
  Notion,
  OllamaDark,
  OllamaLight,
  OpenAIDark,
  OpenAILight,
  OpenRouterDark,
  OpenRouterLight,
  PerplexityAI,
  Pinterest,
  Reddit,
  Shopify,
  Slack,
  Stripe,
  Supabase,
  Telegram,
  ThreadsDark,
  ThreadsLight,
  TikTokDark,
  TikTokLight,
  Trello,
  Webflow,
  WhatsApp,
  WordPress,
  XDark,
  XLight,
  YouTube,
  Zoom,
} from "@ridemountainpig/svgl-react";

import { cn } from "@/lib/utils";

/**
 * The connections wall: everything Ignis connects to today (full color) next
 * to the roadmap (grayscale), as one wrapping field of pills. Logos come from
 * svgl via @ridemountainpig/svgl-react; brands with theme-specific marks
 * render both variants and let dark: classes pick one.
 */

type BrandIcon = ComponentType<SVGProps<SVGSVGElement>>;

/** A brand whose mark differs per theme: light-bg variant + dark-bg variant. */
function themed(Light: BrandIcon, Dark: BrandIcon) {
  return (
    <>
      <Light className="size-4 dark:hidden" />
      <Dark className="hidden size-4 dark:block" />
    </>
  );
}

function solid(Icon: BrandIcon) {
  return <Icon className="size-4" />;
}

const LIVE: { name: string; icon: React.ReactNode }[] = [
  { name: "Google Drive", icon: solid(GoogleDrive) },
  { name: "Notion", icon: solid(Notion) },
  { name: "OpenAI", icon: themed(OpenAILight, OpenAIDark) },
  { name: "Anthropic", icon: themed(AnthropicLight, AnthropicDark) },
  { name: "Azure AI Foundry", icon: solid(MicrosoftAzure) },
];

const ROADMAP: { name: string; icon: React.ReactNode }[] = [
  { name: "Gemini", icon: solid(Gemini) },
  { name: "Mistral AI", icon: solid(MistralAI) },
  { name: "DeepSeek", icon: solid(DeepSeek) },
  { name: "Groq", icon: solid(Groq) },
  { name: "Hugging Face", icon: solid(HuggingFace) },
  { name: "Perplexity", icon: solid(PerplexityAI) },
  { name: "Cohere", icon: solid(Cohere) },
  { name: "Ollama", icon: themed(OllamaLight, OllamaDark) },
  { name: "OpenRouter", icon: themed(OpenRouterLight, OpenRouterDark) },
  { name: "xAI", icon: themed(GrokLight, GrokDark) },
  { name: "Gmail", icon: solid(Gmail) },
  { name: "Google Sheets", icon: solid(GoogleSheets) },
  { name: "Google Calendar", icon: solid(GoogleCalendar) },
  { name: "Google Analytics", icon: solid(GoogleAnalytics) },
  { name: "OneDrive", icon: solid(MicrosoftOneDrive) },
  { name: "Excel", icon: solid(MicrosoftExcel) },
  { name: "Microsoft Teams", icon: solid(MicrosoftTeams) },
  { name: "Slack", icon: solid(Slack) },
  { name: "Discord", icon: solid(Discord) },
  { name: "Telegram", icon: solid(Telegram) },
  { name: "WhatsApp", icon: solid(WhatsApp) },
  { name: "Zoom", icon: solid(Zoom) },
  { name: "X", icon: themed(XLight, XDark) },
  { name: "Instagram", icon: solid(Instagram) },
  { name: "Facebook", icon: solid(Facebook) },
  { name: "LinkedIn", icon: solid(LinkedIn) },
  { name: "YouTube", icon: solid(YouTube) },
  { name: "TikTok", icon: themed(TikTokLight, TikTokDark) },
  { name: "Pinterest", icon: solid(Pinterest) },
  { name: "Reddit", icon: solid(Reddit) },
  { name: "Bluesky", icon: solid(Bluesky) },
  { name: "Threads", icon: themed(ThreadsLight, ThreadsDark) },
  { name: "Figma", icon: solid(Figma) },
  { name: "Canva", icon: solid(Canva) },
  { name: "Webflow", icon: solid(Webflow) },
  { name: "WordPress", icon: solid(WordPress) },
  { name: "Shopify", icon: solid(Shopify) },
  { name: "Trello", icon: solid(Trello) },
  { name: "Asana", icon: solid(Asana) },
  { name: "ClickUp", icon: solid(ClickUp) },
  { name: "Linear", icon: solid(Linear) },
  { name: "Jira", icon: solid(Atlassian) },
  { name: "Loom", icon: solid(Loom) },
  { name: "GitHub", icon: themed(GitHubLight, GitHubDark) },
  { name: "Stripe", icon: solid(Stripe) },
  { name: "Dropbox", icon: solid(Dropbox) },
  { name: "Supabase", icon: solid(Supabase) },
];

function Pill({
  name,
  icon,
  live,
}: {
  name: string;
  icon: React.ReactNode;
  live?: boolean;
}) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm",
        live
          ? "border-border bg-card"
          : "border-border/60 text-muted-foreground [&_svg]:opacity-55 [&_svg]:grayscale",
      )}
    >
      {icon}
      {name}
    </span>
  );
}

export function ConnectionsWall() {
  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Available today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-muted-foreground/40" />
          On the roadmap
        </span>
      </div>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {LIVE.map((c) => (
          <Pill key={c.name} name={c.name} icon={c.icon} live />
        ))}
        {ROADMAP.map((c) => (
          <Pill key={c.name} name={c.name} icon={c.icon} />
        ))}
      </div>
    </div>
  );
}
