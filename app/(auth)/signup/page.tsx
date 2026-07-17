import Link from "next/link";
import { enabledSocialProviders } from "@/lib/auth";
import { signupsEnabled } from "@/lib/env";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "../sign-up-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const safeNext = next && next.startsWith("/") ? next : "/";

  // Waitlist mode: registration is closed, so explain instead of rendering a
  // form that would 400. The better-auth API rejects sign-up server-side
  // regardless — this page is just the friendly face of it.
  if (!signupsEnabled()) {
    return (
      <main className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Ignis is in private beta</CardTitle>
            <CardDescription>
              Sign-ups are currently closed. Join the waitlist and we&apos;ll
              email you when your spot opens up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" render={<Link href="/#waitlist" />}>
              Join the waitlist
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href={`/login?next=${encodeURIComponent(safeNext)}`}
                className="text-foreground underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <SignUpForm next={safeNext} socialProviders={enabledSocialProviders()} />
    </main>
  );
}
