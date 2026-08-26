import { createHash, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { FarfurieSnapshot } from "@/lib/snapshot";

const scrypt = promisify(scryptCb);

export type CloudUser = {
  id: string;
  email: string;
  salt: string;
  hash: string;
  createdAt: string;
};

type Session = {
  token: string;
  userId: string;
  expiresAt: number;
};

type FileDb = {
  users: CloudUser[];
  sessions: Session[];
  snapshots: Record<string, FarfurieSnapshot>;
};

const DATA_DIR = process.env.FARFURIE_DATA_DIR ?? path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "cloud.json");

let mem: FileDb | null = null;
let writeQueue: Promise<void> = Promise.resolve();

async function load(): Promise<FileDb> {
  if (mem) return mem;
  try {
    const raw = await readFile(DB_PATH, "utf8");
    mem = JSON.parse(raw) as FileDb;
    mem.users ??= [];
    mem.sessions ??= [];
    mem.snapshots ??= {};
    return mem;
  } catch {
    mem = { users: [], sessions: [], snapshots: {} };
    return mem;
  }
}

function enqueueWrite(db: FileDb) {
  writeQueue = writeQueue.then(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DB_PATH}.${randomBytes(4).toString("hex")}.tmp`;
    await writeFile(tmp, JSON.stringify(db), "utf8");
    await rename(tmp, DB_PATH);
  });
  return writeQueue;
}

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function registerUser(emailRaw: string, password: string) {
  const email = emailRaw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("invalid_email");
  }
  if (password.length < 8) throw new Error("weak_password");
  const db = await load();
  if (db.users.some((u) => u.email === email)) throw new Error("email_taken");
  const salt = randomBytes(16);
  const hash = (await scrypt(password, salt, 32)) as Buffer;
  const user: CloudUser = {
    id: randomBytes(8).toString("hex"),
    email,
    salt: salt.toString("hex"),
    hash: hash.toString("hex"),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  await enqueueWrite(db);
  return user;
}

export async function verifyUser(emailRaw: string, password: string) {
  const email = emailRaw.trim().toLowerCase();
  const db = await load();
  const user = db.users.find((u) => u.email === email);
  if (!user) return null;
  const hash = (await scrypt(password, Buffer.from(user.salt, "hex"), 32)) as Buffer;
  const stored = Buffer.from(user.hash, "hex");
  if (hash.length !== stored.length || !timingSafeEqual(hash, stored)) return null;
  return user;
}

export async function createSession(userId: string) {
  const db = await load();
  const token = randomBytes(24).toString("hex");
  db.sessions = db.sessions.filter((s) => s.expiresAt > Date.now());
  db.sessions.push({
    token: tokenHash(token),
    userId,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30,
  });
  await enqueueWrite(db);
  return token;
}

export async function userFromToken(token: string | undefined) {
  if (!token) return null;
  const db = await load();
  const session = db.sessions.find(
    (s) => s.token === tokenHash(token) && s.expiresAt > Date.now(),
  );
  if (!session) return null;
  return db.users.find((u) => u.id === session.userId) ?? null;
}

export async function destroySession(token: string | undefined) {
  if (!token) return;
  const db = await load();
  const hashed = tokenHash(token);
  db.sessions = db.sessions.filter((s) => s.token !== hashed);
  await enqueueWrite(db);
}

export async function getSnapshot(userId: string) {
  const db = await load();
  return db.snapshots[userId] ?? null;
}

export async function putSnapshot(userId: string, snapshot: FarfurieSnapshot) {
  const db = await load();
  db.snapshots[userId] = snapshot;
  await enqueueWrite(db);
  return snapshot;
}
