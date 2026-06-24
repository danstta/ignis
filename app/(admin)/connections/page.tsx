import Link from "next/link";
import { Plug, CheckCircle2, AlertCircle } from "lucide-react";
import { listConnections } from "@/lib/connections/service";
import { listConnectionTypes } from "@/lib/connections/registry";
import { createConnectionAction } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage() {
  let rows: Awaited<ReturnType<typeof listConnections>> = [];
  let dbError: string | null = null;
  try {
    rows = await listConnections();
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err);
  }
  const types = listConnectionTypes();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Connections</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Data sources that fill template placeholders via webhooks.
          </p>
        </div>
        <div className="flex gap-2">
          {types.map((t) => (
            <form key={t.id} action={createConnectionAction}>
              <input type="hidden" name="type" value={t.id} />
              <input type="hidden" name="name" value={t.name} />
              <Button type="submit" variant="outline">
                <Plug className="size-4" /> Add {t.name}
              </Button>
            </form>
          ))}
        </div>
      </div>

      {dbError ? (
        <div className="mt-6 rounded-lg border border-dashed p-6 text-sm">
          <p className="font-medium">Database not reachable</p>
          <p className="mt-1 text-muted-foreground">
            Set <code>DATABASE_URL</code> in <code>.env.local</code> and run{" "}
            <code>npm run db:migrate</code> to manage connections.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No connections yet. Add one above to get started.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {rows.map((c) => {
            const verified = Boolean(
              (c.config as Record<string, unknown>)?.verificationToken,
            );
            return (
              <Link key={c.id} href={`/connections/${c.id}`}>
                <Card className="h-full transition-colors hover:border-foreground/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{c.name}</span>
                      {verified ? (
                        <span className="flex items-center gap-1 text-xs font-normal text-green-600">
                          <CheckCircle2 className="size-4" /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-normal text-muted-foreground">
                          <AlertCircle className="size-4" /> Not verified
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription>{c.type}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
