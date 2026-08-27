import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { eq, lt } from "drizzle-orm";
import { db } from "./db/client";
import { sessions, snapshots, users } from "./db/schema";
import type { FarfurieSnapshot } from "@/lib/snapshot";

const scrypt = promisify(scryptCb);

export type CloudUser = {
  id: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: string;
};

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function registerUser(emailRaw: string, password: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("invalid_email");
  }
  if (password.length < 8) throw new Error("weak_password");

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) throw new Error("email_taken");

  const salt = randomBytes(16);
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  const user: CloudUser = {
    id: randomBytes(8).toString("hex"),
    email,
    salt: salt.toString("hex"),
    hash: hash.toString("hex"),
    createdAt: new Date().toISOString(),
  };
  await db.insert(users).values({
    ...user,
    createdAt: new Date(user.createdAt),
  });
  return user;
}

export async function verifyUser(emailRaw: string, password: string) {
  const email = emailRaw.trim().toLowerCase();
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) return null;
  const hash = (await scrypt(password, Buffer.from(user.salt, "hex"), 32)) as Buffer;
  const stored = Buffer.from(user.hash, "hex");
  if (hash.length !== stored.length || !timingSafeEqual(hash, stored)) return null;
  return {
    id: user.id,
    email: user.email,
    salt: user.salt,
    hash: user.hash,
    createdAt: user.createdAt.toISOString(),
  } as CloudUser;
}

export async function createSession(userId: string) {
  const token = randomBytes(24).toString("hex");
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  await db.insert(sessions).values({
    tokenHash: tokenHash(token),
    userId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  });
  return token;
}

export async function userFromToken(token: string | undefined) {
  if (!token) return null;
  const hashed = tokenHash(token);
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.tokenHash, hashed),
  });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    salt: user.salt,
    hash: user.hash,
    createdAt: user.createdAt.toISOString(),
  } as CloudUser;
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash(token)));
}

export async function getSnapshot(userId: string) {
  const row = await db.query.snapshots.findFirst({ where: eq(snapshots.userId, userId) });
  return (row?.data as FarfurieSnapshot) ?? null;
}

export async function putSnapshot(userId: string, snapshot: FarfurieSnapshot) {
  await db
    .insert(snapshots)
    .values({ userId, data: snapshot, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: snapshots.userId,
      set: { data: snapshot, updatedAt: new Date() },
    });
  return snapshot;
}
