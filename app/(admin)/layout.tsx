import { cookies } from "next/headers";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/command/command-palette";
import { listAssets } from "@/lib/assets/service";
import { listFolders } from "@/lib/folders/service";
import {
  parseSidebarPrefs,
  SIDEBAR_PREFS_COOKIE,
} from "@/lib/sidebar-prefs";
import { listTemplates } from "@/lib/templates/service";
import { listWorkflows } from "@/lib/workflows/service";
import { requireWorkspace } from "@/lib/workspaces";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Real session check (the proxy is cookie-presence only) + active workspace.
  // Deliberately OUTSIDE the try/catch fallbacks below: an unresolvable
  // workspace must surface (redirect/error), not render an empty shell.
  const ctx = await requireWorkspace();
  const workspaceId = ctx.workspace.id;

  // The sidebar lists templates and workflows. Fall back to empty lists when
  // the database isn't reachable so the shell still renders (pages surface the
  // detailed "database not reachable" hint).
  let templates: Awaited<ReturnType<typeof listTemplates>> = [];
  let workflows: Awaited<ReturnType<typeof listWorkflows>> = [];
  let designFolders: Awaited<ReturnType<typeof listFolders>> = [];
  let workflowFolders: Awaited<ReturnType<typeof listFolders>> = [];
  let assets: Awaited<ReturnType<typeof listAssets>> = [];
  try {
    templates = await listTemplates(workspaceId);
  } catch {}
  try {
    workflows = await listWorkflows(workspaceId);
  } catch {}
  try {
    designFolders = await listFolders(workspaceId, "design");
  } catch {}
  try {
    workflowFolders = await listFolders(workspaceId, "workflow");
  } catch {}
  try {
    assets = await listAssets(workspaceId);
  } catch {}

  // Server-render the sidebar in its persisted state (collapsed rail, open
  // sections) so there is no flash of the default layout before hydration.
  const cookieStore = await cookies();
  const sidebarPrefs = parseSidebarPrefs(
    cookieStore.get(SIDEBAR_PREFS_COOKIE)?.value,
  );

  return (
    <div className="flex h-svh overflow-hidden">
      <AppSidebar
        templates={templates.map((t) => ({
          id: t.id,
          name: t.name,
          folderId: t.folderId,
        }))}
        workflows={workflows.map((w) => ({
          id: w.id,
          name: w.name,
          folderId: w.folderId,
          active: w.active,
        }))}
        designFolders={designFolders.map((f) => ({
          id: f.id,
          kind: f.kind,
          name: f.name,
          iconUrl: f.iconUrl,
        }))}
        workflowFolders={workflowFolders.map((f) => ({
          id: f.id,
          kind: f.kind,
          name: f.name,
          iconUrl: f.iconUrl,
        }))}
        assets={assets}
        initialPrefs={sidebarPrefs}
        workspace={{ id: ctx.workspace.id, name: ctx.workspace.name }}
        memberships={ctx.memberships.map((m) => ({ id: m.id, name: m.name }))}
      />
      <main className="flex-1 overflow-auto p-8 max-md:pb-28">{children}</main>
      <MobileNav />
      <CommandPalette
        templates={templates.map((t) => ({ id: t.id, name: t.name }))}
        workflows={workflows.map((w) => ({ id: w.id, name: w.name }))}
      />
    </div>
  );
}
