import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { databaseUrl } from "@/lib/env";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let _db: Db | null = null;
let _client: ReturnType<typeof postgres> | null = null;

/**
 * Lazily-created Drizzle client (singleton). `prepare: false` keeps it compatible
 * with serverless connection poolers like Neon's pgbouncer endpoint.
 */
export function db(): Db {
  if (_db) return _db;
  _client = postgres(databaseUrl(), { prepare: false });
  _db = drizzle(_client, { schema });
  return _db;
}

export { schema };
