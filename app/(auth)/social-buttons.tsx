"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth/client";
import type { SocialProviderId } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const LABELS: Record<SocialProviderId, string> = {
  google: "Continue with Google",
  github: "Continue with GitHub",
};

/**
 * OAuth sign-in buttons for whichever providers have credentials configured
 * (see lib/auth/impl). Renders nothing when the list is empty, which is the
 * default for a fresh self-hosted deploy.
 */
export function SocialButtons({
  providers,
  next,
}: {
  providers: SocialProviderId[];
  next: string;
}) {
  const [pending, setPending] = useState(false);

  if (providers.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>
      {providers.map((provider) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            // Redirects to the provider; callbackURL brings us back after.
            await signIn.social({ provider, callbackURL: next });
          }}
        >
          {LABELS[provider]}
        </Button>
      ))}
    </div>
  );
}
