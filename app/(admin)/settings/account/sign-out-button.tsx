"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await signOut();
        // Full navigation so the proxy re-evaluates without the cookie.
        window.location.assign("/login");
      }}
    >
      <LogOut className="size-4" /> {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
