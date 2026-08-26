import { NextResponse } from "next/server";
import { createSession, verifyUser } from "@/lib/server/cloud";
import { sessionCookie } from "@/lib/server/session";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };
  const user = await verifyUser(body.email ?? "", body.password ?? "");
  if (!user) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }
  const token = await createSession(user.id);
  const res = NextResponse.json({ email: user.email, id: user.id });
  const cookie = sessionCookie(token);
  res.cookies.set(cookie.name, cookie.value, cookie);
  return res;
}
