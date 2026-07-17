import { WaitlistForm } from "@/app/landing-page/_components/waitlist-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Ignis is in private beta
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign-in isn&apos;t open yet. Join the waitlist and we&apos;ll email
            you when the beta opens.
          </p>
        </div>
        <WaitlistForm source="login" />
      </div>
    </main>
  );
}
