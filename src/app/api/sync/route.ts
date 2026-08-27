import { NextResponse } from "next/server";
import { getSnapshot, putSnapshot } from "@/lib/server/cloud";
import { isSnapshot } from "@/lib/snapshot";
import { currentUser } from "@/lib/server/session";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const snapshot = await getSnapshot(user.id);
  return NextResponse.json({ snapshot });
}

export async function PUT(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const snapshot = body?.snapshot ?? body;
  if (!isSnapshot(snapshot)) {
    return NextResponse.json({ error: "invalid_snapshot" }, { status: 400 });
  }
  snapshot.updatedAt = new Date().toISOString();
  await putSnapshot(user.id, snapshot);
  return NextResponse.json({ snapshot });
}
