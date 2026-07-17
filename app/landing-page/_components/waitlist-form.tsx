"use client";

import { useId, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** Email capture for the hosted-beta waitlist, backed by POST /api/waitlist. */
export function WaitlistForm({
  className,
  source = "landing",
}: {
  className?: string;
  source?: string;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (joined) {
    return (
      <div
        className={cn(
          "flex min-h-10 items-center gap-2.5 text-sm",
          className,
        )}
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-ember text-ember-foreground">
          <Check className="size-3" strokeWidth={3} />
        </span>
        You&apos;re on the list. One email when the beta opens — nothing else.
      </div>
    );
  }

  return (
    <form
      className={cn(
        "flex w-full max-w-md flex-col gap-2 sm:flex-row sm:flex-wrap",
        className,
      )}
      onSubmit={async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
          const res = await fetch("/api/waitlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, source }),
          });
          if (!res.ok) throw new Error(`Request failed (${res.status})`);
          setJoined(true);
        } catch {
          setError("Something went wrong. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <Input
        id={id}
        type="email"
        required
        placeholder="you@studio.com"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        className="h-10 flex-1 sm:min-w-0"
      />
      <Button
        type="submit"
        disabled={submitting}
        className="h-10 shrink-0 bg-ember px-4 text-ember-foreground hover:bg-ember/90"
      >
        Join the waitlist
        <ArrowRight />
      </Button>
      {error ? (
        <p className="w-full text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
