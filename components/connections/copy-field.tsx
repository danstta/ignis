"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex max-w-xl gap-2">
      <Input readOnly value={value} className="font-mono text-xs" />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Copy"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // clipboard may be unavailable over http; ignore
          }
        }}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}
