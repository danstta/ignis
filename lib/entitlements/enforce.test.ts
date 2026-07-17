import { beforeEach, describe, expect, mock, test } from "bun:test";
import type { Entitlements } from ".";

/**
 * The impl and the DB are swapped for fakes: `plan` drives what the seam
 * returns, `usageRows` is what any usage query resolves to, and `dbCalls`
 * counts queries so the unlimited fast path can prove it never touches the DB.
 */
let plan: Entitlements;
let usageRows: Record<string, unknown>[];
let dbCalls = 0;

mock.module("./impl/self-hosted", () => ({
  getWorkspaceEntitlements: async () => plan,
}));

mock.module("@/lib/db", () => ({
  db: () => ({
    select: () => {
      dbCalls++;
      const resolve = async () => usageRows;
      const step = { where: resolve, innerJoin: () => ({ where: resolve }) };
      return { from: () => step };
    },
  }),
}));

const { EntitlementLimitError, assertRunQuota, assertStorageQuota, assertSeatQuota } =
  await import("./enforce");

function planWith(overrides: Partial<Entitlements>): Entitlements {
  return {
    plan: "test",
    maxRunsPerMonth: null,
    maxStorageBytes: null,
    maxSeats: null,
    ...overrides,
  };
}

beforeEach(() => {
  plan = planWith({});
  usageRows = [];
  dbCalls = 0;
});

describe("unlimited plan", () => {
  test("all asserts pass without querying usage", async () => {
    await assertRunQuota("ws-1");
    await assertStorageQuota("ws-1", 10_000_000);
    await assertSeatQuota("ws-1");
    expect(dbCalls).toBe(0);
  });
});

describe("assertRunQuota", () => {
  test("passes under the monthly limit", async () => {
    plan = planWith({ maxRunsPerMonth: 100 });
    usageRows = [{ n: 99 }];
    await assertRunQuota("ws-1");
  });

  test("throws at the monthly limit", async () => {
    plan = planWith({ maxRunsPerMonth: 100 });
    usageRows = [{ n: 100 }];
    const err = await assertRunQuota("ws-1").catch((e) => e);
    expect(err).toBeInstanceOf(EntitlementLimitError);
    expect(err.limit).toBe("runs");
  });
});

describe("assertStorageQuota", () => {
  test("passes when the upload still fits", async () => {
    plan = planWith({ maxStorageBytes: 1000 });
    usageRows = [{ used: "600" }];
    await assertStorageQuota("ws-1", 400);
  });

  test("throws when the upload would exceed the limit", async () => {
    plan = planWith({ maxStorageBytes: 1000 });
    usageRows = [{ used: "600" }];
    const err = await assertStorageQuota("ws-1", 401).catch((e) => e);
    expect(err).toBeInstanceOf(EntitlementLimitError);
    expect(err.limit).toBe("storage");
  });

  test("treats an empty workspace (null sum) as zero usage", async () => {
    plan = planWith({ maxStorageBytes: 1000 });
    usageRows = [{ used: null }];
    await assertStorageQuota("ws-1", 1000);
  });
});

describe("assertSeatQuota", () => {
  test("throws when every seat is taken", async () => {
    plan = planWith({ maxSeats: 3 });
    usageRows = [{ n: 3 }];
    const err = await assertSeatQuota("ws-1").catch((e) => e);
    expect(err).toBeInstanceOf(EntitlementLimitError);
    expect(err.limit).toBe("seats");
  });

  test("passes with a free seat", async () => {
    plan = planWith({ maxSeats: 3 });
    usageRows = [{ n: 2 }];
    await assertSeatQuota("ws-1");
  });
});
