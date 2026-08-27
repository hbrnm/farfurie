import { cookies } from "next/headers";
import { destroySession, userFromToken, type CloudUser } from "@/lib/server/cloud";

export const COOKIE = "farfurie_sid";

export async function readSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE)?.value;
}

export async function currentUser(): Promise<CloudUser | null> {
  const token = await readSessionToken();
  return userFromToken(token);
}

export async function requireUser(): Promise<CloudUser> {
  const user = await currentUser();
  if (!user) {
    throw new Error("unauthorized");
  }
  return user;
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: process.env.NODE_ENV === "production",
  };
}

export async function clearSessionCookie() {
  const token = await readSessionToken();
  await destroySession(token);
  const cookieStore = await cookies();
  cookieStore.set({
    name: COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
}
