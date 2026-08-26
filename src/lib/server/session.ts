import { cookies } from "next/headers";
import { destroySession, userFromToken } from "@/lib/server/cloud";

export const COOKIE = "farfurie_sid";

export async function readSessionToken() {
  return (await cookies()).get(COOKIE)?.value;
}

export async function currentUser() {
  return userFromToken(await readSessionToken());
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function clearSessionCookie() {
  const token = await readSessionToken();
  await destroySession(token);
  (await cookies()).set({
    name: COOKIE,
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
}
