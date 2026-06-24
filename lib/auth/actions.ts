"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, createToken, verifyToken } from "./session";
import { adminPassword, sessionSecret } from "@/lib/env";

export type LoginState = { error: string | null };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (password !== adminPassword()) {
    return { error: "Incorrect password." };
  }

  const token = await createToken(sessionSecret());
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });

  redirect(next.startsWith("/") ? next : "/");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  redirect("/login");
}

/** Read-side helper for server components that want to confirm the session. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(sessionSecret(), store.get(COOKIE_NAME)?.value);
}
