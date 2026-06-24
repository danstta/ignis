"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTemplateAction } from "@/app/(admin)/templates/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function TemplateCard({
  id,
  name,
  size,
  updated,
}: {
  id: string;
  name: string;
  size: string;
  updated: string;
}) {
  const [pending, start] = useTransition();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="truncate">{name}</CardTitle>
        <CardDescription>
          {size} · updated {updated}
        </CardDescription>
      </CardHeader>
      <CardFooter className="gap-2">
        <Button
          size="sm"
          variant="outline"
          render={<Link href={`/editor/${id}`} />}
        >
          <Pencil className="size-4" /> Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            if (!window.confirm(`Delete "${name}"?`)) return;
            start(async () => {
              await deleteTemplateAction(id);
              toast.success("Template deleted");
            });
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
