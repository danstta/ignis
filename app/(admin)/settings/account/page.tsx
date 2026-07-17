import { requireUser } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export default async function SettingsAccountPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your account and session on this device.
      </p>

      <div className="mt-6 space-y-4">
        <section className="rounded-lg border p-5">
          <h2 className="text-sm font-medium">Profile</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-16 text-muted-foreground">Name</dt>
              <dd>{user.name}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 text-muted-foreground">Email</dt>
              <dd>{user.email}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border p-5">
          <h2 className="text-sm font-medium">Session</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign out of your session on this device.
          </p>
          <div className="mt-3">
            <SignOutButton />
          </div>
        </section>
      </div>
    </div>
  );
}
