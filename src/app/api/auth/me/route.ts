import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/session";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ email: null });
  return NextResponse.json({ email: user.email, id: user.id });
}
