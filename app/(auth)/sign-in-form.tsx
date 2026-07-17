"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth/client";
import type { SocialProviderId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SocialButtons } from "./social-buttons";

export function SignInForm({
  next,
  socialProviders,
  signupsEnabled,
}: {
  next: string;
  socialProviders: SocialProviderId[];
  signupsEnabled: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setError(null);
    setPending(true);
    const { error } = await signIn.email({
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    });
    if (error) {
      setError(error.message ?? "Sign in failed. Please try again.");
      setPending(false);
      return;
    }
    // Full navigation (not router.push) so the proxy re-evaluates with the new
    // session cookie — e.g. "/" stops rewriting to the landing page.
    window.location.assign(next);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Ignis</CardTitle>
        <CardDescription>Sign in to your account to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <SocialButtons providers={socialProviders} next={next} />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {signupsEnabled ? (
            <>
              No account yet?{" "}
              <Link
                href={`/signup?next=${encodeURIComponent(next)}`}
                className="text-foreground underline underline-offset-4"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              No account yet?{" "}
              <Link
                href="/#waitlist"
                className="text-foreground underline underline-offset-4"
              >
                Join the waitlist
              </Link>
            </>
          )}
        </p>
      </CardContent>
    </Card>
  );
}
