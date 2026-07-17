"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { setPluginEnabled } from "@/lib/plugins/service";

/**
 * Plugin enablement stays INSTANCE-GLOBAL by design (Phase B decision): in the
 * self-hosted repo the operator is the user; per-workspace enablement belongs
 * to the cloud entitlements layer. Session is still verified for real.
 */
export async function setPluginEnabledAction(id: string, enabled: boolean) {
  await requireUser();
  await setPluginEnabled(id, enabled);
  revalidatePath("/plugins");
}
