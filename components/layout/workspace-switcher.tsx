"use client";

import { useState, useTransition } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import {
  createWorkspaceAction,
  switchWorkspaceAction,
} from "@/app/(admin)/workspaces/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export type WorkspaceOption = { id: string; name: string };

/**
 * Sidebar-header workspace menu: shows the active workspace, switches between
 * memberships, and creates a new workspace. Switch/create are server actions
 * that set the workspace cookie and redirect, so every scoped list remounts.
 */
export function WorkspaceSwitcher({
  workspace,
  memberships,
}: {
  workspace: WorkspaceOption;
  memberships: WorkspaceOption[];
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex min-w-0 flex-1 items-center gap-1 rounded-md px-1 py-0.5 text-sm font-semibold tracking-wide text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          title="Switch workspace"
        >
          <span className="min-w-0 flex-1 truncate text-left">
            {workspace.name}
          </span>
          <ChevronsUpDown className="size-3.5 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {memberships.map((m) => (
            <DropdownMenuItem
              key={m.id}
              disabled={pending}
              onClick={() => {
                if (m.id === workspace.id) return;
                startTransition(() => switchWorkspaceAction(m.id));
              }}
            >
              <span className="min-w-0 flex-1 truncate">{m.name}</span>
              {m.id === workspace.id ? <Check className="size-4" /> : null}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={pending} onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            New workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New workspace</DialogTitle>
            <DialogDescription>
              A separate space with its own designs, workflows, assets and
              connections.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim() || pending) return;
              startTransition(() => createWorkspaceAction(name));
            }}
            className="flex flex-col gap-4"
          >
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Workspace name"
              maxLength={80}
              autoFocus
            />
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCreating(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending || !name.trim()}>
                {pending ? "Creating…" : "Create workspace"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
