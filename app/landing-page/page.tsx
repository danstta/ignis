import type { Metadata } from "next";

import { garet } from "./fonts";
import "./landing.css";
import { ConnectionsWall } from "./_components/connections-wall";
import { DesignEditorMockup } from "./_components/design-editor-mockup";
import { HeroPipeline } from "./_components/hero-pipeline";
import { HowItWorks } from "./_components/how-it-works";
import { LandingHeader } from "./_components/landing-header";
import { Reveal } from "./_components/reveal";
import { RunMockup } from "./_components/run-mockup";
import { AUTHOR_GITHUB_URL, AUTHOR_X_URL, GITHUB_URL } from "./_components/site";
import { StepCatalog } from "./_components/step-catalog";
import { TextLayers } from "./_components/text-layers";
import { WaitlistForm } from "./_components/waitlist-form";
import { WorkflowMockup } from "./_components/workflow-mockup";

export const metadata: Metadata = {
  title: "Ignis — design once, render forever",
  description:
    "Ignis is an open-source studio that pairs a design template editor with a general-purpose workflow engine. Draw designs with placeholders, automate any process with AI steps, branching, and human review — and render on-brand images into Google Drive and Notion.",
};

/** The three product tour stops, in the order a real pipeline executes. */
const TOUR: {
  id: string;
  step: string;
  kicker: string;
  title: string;
  lede: string;
  mockup: React.ReactNode;
  features: { title: string; desc: React.ReactNode }[];
  extra?: React.ReactNode;
}[] = [
  {
    id: "design",
    step: "S1",
    kicker: "Design",
    title: "A canvas where placeholders are first-class",
    lede: "Everything you expect from a design editor — shapes, text, images, multi-page documents, brand kits. And one thing you don't: any layer can be named as a placeholder, which turns your design into a function your workflows can call.",
    mockup: <DesignEditorMockup />,
    features: [
      {
        title: "Placeholder layers",
        desc: (
          <>
            Give a text layer the key{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              title
            </code>{" "}
            and every run fills it with live data. Image placeholders work the
            same way.
          </>
        ),
      },
      {
        title: "Multi-page templates",
        desc: "Carousels and series live in one template — every page renders in a single pass.",
      },
      {
        title: "Export anywhere",
        desc: "Download finished art as PNG, or take the template itself as a React component or HTML.",
      },
    ],
    extra: <TextLayers />,
  },
  {
    id: "automate",
    step: "S2",
    kicker: "Automate",
    title: "Wire steps around the template",
    lede: "Start from a webhook — a published post, a form, any event. Pull images from Drive, rank them with vision, write the copy with an LLM. Branch with routers, pause for a human pick — then render. Every step speaks the same token language, so any output can feed any placeholder.",
    mockup: <WorkflowMockup />,
    features: [
      {
        title: "AI in the loop",
        desc: "Rank and categorize photos with vision models, or call any LLM with your own prompt — using your own API keys.",
      },
      {
        title: "Branches and gates",
        desc: "Routers take conditional paths; manual review pauses a run until a human approves or picks.",
      },
      {
        title: "Plain-token bindings",
        desc: (
          <>
            Map any step&apos;s output into any input with tokens like{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
              {"{{S3.best.url}}"}
            </code>
            . No glue code.
          </>
        ),
      },
    ],
  },
  {
    id: "runs",
    step: "S3",
    kicker: "Run",
    title: "Runs you can watch — and trust",
    lede: "Every run executes durably and streams back live: per-step status, logs as they happen, pages as they render. Stop it, review it, or let it finish straight into Google Drive or Notion.",
    mockup: <RunMockup />,
    features: [
      {
        title: "Live, step by step",
        desc: "Statuses, logs, and outputs stream into the run view in real time — no refresh, no guessing.",
      },
      {
        title: "Durable by design",
        desc: "Runs survive restarts and reconnects, retry transient failures, and pick up exactly where they left off.",
      },
      {
        title: "Every render kept",
        desc: "Each run keeps its rendered pages and full logs, so you can audit what shipped and why.",
      },
    ],
  },
];

function StepBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-6 min-w-9 items-center justify-center rounded-md bg-ember/15 px-1.5 font-mono text-[11px] font-semibold text-ember">
      {children}
    </span>
  );
}

function SectionHeader({
  step,
  kicker,
  title,
  lede,
}: {
  step: React.ReactNode;
  kicker: string;
  title: string;
  lede: string;
}) {
  return (
    <Reveal>
      <div className="flex items-center gap-2.5">
        <StepBadge>{step}</StepBadge>
        <span className="text-sm font-medium text-muted-foreground">
          {kicker}
        </span>
      </div>
      <h2 className="font-display mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        {lede}
      </p>
    </Reveal>
  );
}

export default function LandingPage() {
  return (
    <div className={`${garet.variable} min-h-svh bg-background text-foreground`}>
      <LandingHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Fill the viewport below the sticky h-14 header so nothing else
              peeks above the fold on load. */}
          <div className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-6xl items-center gap-14 px-6 py-10 sm:py-14 lg:grid-cols-[1fr_auto] lg:gap-20 lg:py-16">
            <div>
              <h1 className="font-display mt-6 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                Design once.
                <br />
                Render forever<span className="text-ember">.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Ignis puts a design editor and a workflow engine in one tool.
                Draw a template with placeholders, wire a workflow around it,
                and every trigger renders finished, on-brand images.
                Don&apos;t need the canvas? Automate any process with AI steps,
                branching, and human review.
              </p>
              <div id="waitlist" className="mt-8 scroll-mt-28">
                <WaitlistForm />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                One email when the hosted beta opens. Prefer self-hosting?{" "}
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  It&apos;s open source
                </a>
                .
              </p>
            </div>

            <div className="flex justify-center lg:justify-end">
              <HeroPipeline />
            </div>
          </div>
        </section>

        {/* How it works: template → binding → workflow → output */}
        <section id="how" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20 lg:py-24">
            <SectionHeader
              step="fn"
              kicker="How it works"
              title="Your template is a function"
              lede="Name a layer and it becomes a placeholder — an argument your workflow can fill. Steps bind their outputs to it, the render step calls the template, and finished pages ship out the other side. Same template, different data, every run."
            />
            <Reveal delay={100} className="mt-14">
              <HowItWorks />
            </Reveal>
          </div>
        </section>

        {/* Product tour: S1 Design → S2 Automate → S3 Run */}
        {TOUR.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-20 border-t border-border"
          >
            <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20 lg:py-24">
              <SectionHeader
                step={section.step}
                kicker={section.kicker}
                title={section.title}
                lede={section.lede}
              />
              <Reveal delay={100} className="mt-12">
                {section.mockup}
              </Reveal>
              <div className="mt-10 grid gap-8 sm:grid-cols-3">
                {section.features.map((feature) => (
                  <div key={feature.title} className="border-t border-border pt-4">
                    <h3 className="text-sm font-semibold">{feature.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </div>
              {section.extra ? <Reveal delay={150}>{section.extra}</Reveal> : null}
            </div>
          </section>
        ))}

        {/* Step catalog */}
        <section id="steps" className="scroll-mt-20 border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20 lg:py-24">
            <SectionHeader
              step="17"
              kicker="Step catalog"
              title="Every step speaks the same language"
              lede="Seventeen steps today, growing with each release. Triggers, media, AI, design, flow control, and destinations — all bound together with plain tokens."
            />
            <Reveal delay={100}>
              <StepCatalog />
            </Reveal>
          </div>
        </section>

        {/* Connections */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20 lg:py-24">
            <SectionHeader
              step="BYO"
              kicker="Connections"
              title="Bring your own keys"
              lede="OAuth for Google Drive; API keys for Notion and your AI providers — live today, with a long roadmap behind them. Connections live on your instance and nowhere else."
            />
            <Reveal delay={100}>
              <ConnectionsWall />
            </Reveal>
          </div>
        </section>

      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground">
          <p>
            Made by{" "}
            <a
              href={AUTHOR_GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              @danstta
            </a>
          </p>
          <div className="flex items-center gap-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
            <a
              href={AUTHOR_X_URL}
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              X
            </a>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
