import { NextResponse } from "next/server";
import { createSession, registerUser } from "@/lib/server/cloud";
import { sessionCookie } from "@/lib/server/session";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const user = await registerUser(body.email ?? "", body.password ?? "");
    const token = await createSession(user.id);
    const res = NextResponse.json({ email: user.email, id: user.id });
    const cookie = sessionCookie(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (err) {
    const code = err instanceof Error ? err.message : "error";
    const status = code === "email_taken" ? 409 : code === "weak_password" || code === "invalid_email" ? 400 : 500;
    return NextResponse.json({ error: code }, { status });
  }
}
