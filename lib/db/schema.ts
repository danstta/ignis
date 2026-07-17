import {
  pgTable,
  uuid,
  index,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { TemplateDoc } from "@/lib/editor/types";
import type { BrandColor, BrandFont } from "@/lib/brand/types";
import type {
  WorkflowGraph,
  NodeOutputs,
  NodeRunState,
  RunLogEntry,
} from "@/lib/workflows/types";

/**
 * A tenant. Every domain row belongs to exactly one workspace; queries are always
 * scoped to the caller's active workspace (see lib/workspaces).
 */
export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/** A user's membership in a workspace. user_id is text — auth providers own the id. */
export const workspaceMembers = pgTable(
  "workspace_members",
  {
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "member"] })
      .notNull()
      .default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.workspaceId, table.userId] }),
    // Serves the "workspaces I belong to" lookup on every request.
    index("workspace_members_user_id_idx").on(table.userId),
  ],
);

/** Brand identities: reusable palettes (+ scaffolded fonts/logo) surfaced in the editor. */
export const brands = pgTable("brands", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  /** Named brand colors shown as swatches in every editor color picker. */
  colors: jsonb("colors").$type<BrandColor[]>().notNull().default([]),
  /** Brand font families (scaffold; see lib/render/fonts.ts for the Inter lock). */
  fonts: jsonb("fonts").$type<BrandFont[]>().notNull().default([]),
  /** Logo image URL, insertable from the editor's Add menu. */
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("brands_workspace_created_at_idx").on(
    table.workspaceId,
    table.createdAt.desc(),
  ),
]);

/** Sidebar/list folders. Kind keeps designs and workflows in separate spaces. */
export const folders = pgTable("folders", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  kind: text("kind", { enum: ["design", "workflow"] }).notNull(),
  name: text("name").notNull(),
  iconAssetId: uuid("icon_asset_id").references(() => assets.id, {
    onDelete: "set null",
  }),
  iconUrl: text("icon_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("folders_workspace_kind_name_idx").on(
    table.workspaceId,
    table.kind,
    table.name,
  ),
]);

/** Design templates authored in the editor. */
export const templates = pgTable("templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  folderId: uuid("folder_id").references(() => folders.id, {
    onDelete: "set null",
  }),
  width: integer("width").notNull().default(1080),
  height: integer("height").notNull().default(1080),
  doc: jsonb("doc").$type<TemplateDoc>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("templates_folder_id_idx").on(table.folderId),
  index("templates_workspace_updated_at_idx").on(
    table.workspaceId,
    table.updatedAt.desc(),
  ),
]);

/**
 * A connected account: a configured instance of a connection provider (e.g. a
 * Notion integration token, or a Google Drive OAuth grant). Credentials/tokens
 * live in `config`. Action nodes reference one of these to call external APIs.
 */
export const connections = pgTable("connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  /** Provider id from the registry, e.g. "notion" or "google-drive". */
  type: text("type").notNull(),
  name: text("name").notNull(),
  /** Per-account credentials: API keys/tokens, or OAuth tokens. Encrypt before storing. */
  config: jsonb("config")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("connections_workspace_created_at_idx").on(
    table.workspaceId,
    table.createdAt.desc(),
  ),
]);

/** One render produced by a webhook trigger (or manual test). */
export const renderJobs = pgTable("render_jobs", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Direct column (not derived): both parent FKs below are nullable SET NULL, so
  // tenancy would silently vanish when a template/connection is deleted.
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  templateId: uuid("template_id").references(() => templates.id, {
    onDelete: "set null",
  }),
  connectionId: uuid("connection_id").references(() => connections.id, {
    onDelete: "set null",
  }),
  /** Resolved placeholder values used for this render. */
  input: jsonb("input").$type<Record<string, string>>().notNull().default({}),
  outputUrl: text("output_url"),
  status: text("status", { enum: ["pending", "success", "error"] })
    .notNull()
    .default("pending"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("render_jobs_workspace_created_at_idx").on(
    table.workspaceId,
    table.createdAt.desc(),
  ),
]);

/** Stored binary assets: editor uploads, re-hosted connection images, render outputs. */
export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  kind: text("kind", { enum: ["upload", "source", "render"] }).notNull(),
  /** Display/file name shown in the Assets library. */
  name: text("name").notNull().default(""),
  url: text("url").notNull(),
  /**
   * Object path within the storage backend (e.g. "assets/<uuid>.svg"). Kept so the
   * underlying file can be deleted when the asset row is removed.
   */
  storageKey: text("storage_key"),
  /** MIME type, e.g. "image/svg+xml" or "image/png". */
  contentType: text("content_type"),
  /** File size in bytes. */
  bytes: integer("bytes"),
  meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("assets_workspace_kind_created_at_idx").on(
    table.workspaceId,
    table.kind,
    table.createdAt.desc(),
  ),
]);

/** A visual automation authored on the workflow canvas. */
export const workflows = pgTable("workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  folderId: uuid("folder_id").references(() => folders.id, {
    onDelete: "set null",
  }),
  /** Only active workflows are started when their trigger connection fires. */
  active: boolean("active").notNull().default(false),
  /** Nodes + edges; round-tripped to the @xyflow/react canvas. */
  graph: jsonb("graph")
    .$type<WorkflowGraph>()
    .notNull()
    .default({ nodes: [], edges: [] }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  index("workflows_folder_id_idx").on(table.folderId),
  index("workflows_workspace_updated_at_idx").on(
    table.workspaceId,
    table.updatedAt.desc(),
  ),
]);

/** One execution of a workflow. Holds enough state to pause and resume. */
export const workflowRuns = pgTable("workflow_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  /** "waiting" = paused on a Manual Review node for human selection. */
  status: text("status", {
    enum: ["running", "waiting", "success", "error", "stopped"],
  })
    .notNull()
    .default("running"),
  /** Normalized trigger payload (e.g. Notion { recordId, fields }). */
  trigger: jsonb("trigger")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  /** node id -> resolved outputs, so a resumed run never recomputes a done node. */
  nodeOutputs: jsonb("node_outputs")
    .$type<Record<string, NodeOutputs>>()
    .notNull()
    .default({}),
  /** node id -> lifecycle state, for the run-detail UI. */
  nodeStates: jsonb("node_states")
    .$type<Record<string, NodeRunState>>()
    .notNull()
    .default({}),
  /** node id -> structured log entries emitted while the run executes. */
  nodeLogs: jsonb("node_logs")
    .$type<Record<string, RunLogEntry[]>>()
    .notNull()
    .default({}),
  /** The Manual Review node currently paused, if status is "waiting". */
  waitingNodeId: text("waiting_node_id"),
  /** Random token the resume request must present. */
  resumeToken: text("resume_token"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  // Serves the per-workflow runs list (filter + newest-first sort).
  index("workflow_runs_workflow_id_created_at_idx").on(
    table.workflowId,
    table.createdAt.desc(),
  ),
  // Serves the global runs list/poll.
  index("workflow_runs_created_at_idx").on(table.createdAt.desc()),
  // Serves the status filter and the stale-run reaper.
  index("workflow_runs_status_idx").on(table.status),
]);

/**
 * Append-only run log. Replay-idempotent: the engine derives (visit, seq)
 * deterministically, so a replayed Inngest execution re-inserts the same keys
 * and ON CONFLICT DO NOTHING makes the write a no-op. Never UPDATE this table.
 */
export const workflowRunLogs = pgTable(
  "workflow_run_logs",
  {
    runId: uuid("run_id")
      .notNull()
      .references(() => workflowRuns.id, { onDelete: "cascade" }),
    nodeId: text("node_id").notNull(),
    /** Engine visit number for the node (redoPrevious re-runs increment it). */
    visit: integer("visit").notNull().default(1),
    /** Per-(node, visit) monotonically increasing entry number. */
    seq: integer("seq").notNull(),
    level: text("level", { enum: ["info", "warn", "error"] })
      .notNull()
      .default("info"),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.runId, table.nodeId, table.visit, table.seq],
    }),
  ],
);

/** On/off state for a registry plugin. The row id IS the plugin id. */
export const plugins = pgTable("plugins", {
  id: text("id").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Buffer of inbound payloads received by a Webhook trigger node, keyed by
 * (workflowId, nodeId). The editor reads the latest row to "capture a sample
 * event" and expose its fields to downstream nodes.
 */
export const webhookEvents = pgTable("webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id")
    .notNull()
    .references(() => workflows.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull(),
  /** Normalized request payload: { body, headers, query }. */
  payload: jsonb("payload")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => [
  // Serves the "latest captured sample event" lookup.
  index("webhook_events_workflow_node_created_at_idx").on(
    table.workflowId,
    table.nodeId,
    table.createdAt.desc(),
  ),
]);

// --- Auth (better-auth) -------------------------------------------------------
// Generated with `bunx @better-auth/cli generate` and merged here. Table/column
// names follow better-auth's defaults; the drizzle adapter in
// lib/auth/impl/better-auth.ts maps its models onto these tables.

/** An account holder. Text PK so the id can come from any auth provider. */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/** A signed-in device/browser session. */
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

/**
 * A credential attached to a user: the email/password hash lives here
 * (providerId "credential"), as do linked OAuth identities (google, github).
 */
export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

/** Short-lived verification artifacts (email verification, password reset). */
export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

/** Emails captured by the public landing-page waitlist form. */
export const waitlistSignups = pgTable("waitlist_signups", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  /** Where the signup came from, e.g. "landing". */
  source: text("source"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Workspace = typeof workspaces.$inferSelect;
export type NewWorkspace = typeof workspaces.$inferInsert;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type NewWorkspaceMember = typeof workspaceMembers.$inferInsert;
export type BrandRow = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;
export type RenderJob = typeof renderJobs.$inferSelect;
export type Asset = typeof assets.$inferSelect;
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;
export type WorkflowRun = typeof workflowRuns.$inferSelect;
export type NewWorkflowRun = typeof workflowRuns.$inferInsert;
export type WorkflowRunLog = typeof workflowRunLogs.$inferSelect;
export type PluginRow = typeof plugins.$inferSelect;
export type NewPluginRow = typeof plugins.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
export type NewWaitlistSignup = typeof waitlistSignups.$inferInsert;
export type UserRow = typeof user.$inferSelect;
export type SessionRow = typeof session.$inferSelect;
