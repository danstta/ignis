"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { GitHubIcon } from "@/components/icons/github";
import { Button } from "@/components/ui/button";

import { GITHUB_URL } from "./site";

const NAV = [
  { label: "How it works", href: "#how" },
  { label: "Design", href: "#design" },
  { label: "Automate", href: "#automate" },
  { label: "Runs", href: "#runs" },
  { label: "Steps", href: "#steps" },
];

export function LandingHeader() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <nav className="hidden items-center gap-1 md:-ml-3 md:flex">
          {NAV.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              render={<a href={item.href} />}
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle theme"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
          >
            <Sun className="dark:hidden" />
            <Moon className="hidden dark:block" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Ignis on GitHub"
            render={<a href={GITHUB_URL} target="_blank" rel="noreferrer" />}
          >
            <GitHubIcon className="size-4" />
          </Button>
          <Button
            size="sm"
            className="bg-ember text-ember-foreground hover:bg-ember/90"
            render={<a href="#waitlist" />}
          >
            Join waitlist
          </Button>
        </div>
      </div>
    </header>
  );
}
