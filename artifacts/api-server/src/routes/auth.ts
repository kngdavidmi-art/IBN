import { Router } from "express";
import { db } from "@workspace/db";
import { adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import type express from "express";
import { isApprovedAdminEmail } from "../adminEmails";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "ibn-salt").digest("hex");
}

function signToken(adminId: number, username: string, role: string): string {
  const payload = JSON.stringify({ id: adminId, username, role, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  return Buffer.from(payload).toString("base64");
}

function verifyToken(token: string): { id: number; username: string; role: string; exp: number } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const token = req.cookies?.["ibn_token"];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  (req as any).adminUser = payload;
  next();
}

router.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username)).limit(1);
  if (!admin || admin.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Re-evaluate role only for accounts that have an email set
  // Accounts with no email retain their existing DB role
  if (admin.email) {
    const correctRole = isApprovedAdminEmail(admin.email) ? "admin" : "editor";
    if (admin.role !== correctRole) {
      await db.update(adminsTable).set({ role: correctRole }).where(eq(adminsTable.id, admin.id));
      admin.role = correctRole;
    }
  }

  await db.update(adminsTable).set({ lastLoginAt: new Date() }).where(eq(adminsTable.id, admin.id));

  const token = signToken(admin.id, admin.username, admin.role);
  res.cookie("ibn_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });
  res.json({ user: { id: admin.id, username: admin.username, role: admin.role } });
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("ibn_token");
  res.json({ ok: true });
});

router.get("/auth/me", requireAuth, (req, res) => {
  const user = (req as any).adminUser;
  res.json({ id: user.id, username: user.username, role: user.role });
});

router.post("/auth/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !password || !email) {
    res.status(400).json({ error: "Username, email and password are required" });
    return;
  }
  if (username.length < 3) {
    res.status(400).json({ error: "Username must be at least 3 characters" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await db
    .select({ id: adminsTable.id })
    .from(adminsTable)
    .where(eq(adminsTable.username, username))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const existingEmail = await db
    .select({ id: adminsTable.id })
    .from(adminsTable)
    .where(eq(adminsTable.email, normalizedEmail))
    .limit(1);
  if (existingEmail.length > 0) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  // Only the two approved emails get admin role — everyone else is editor
  const role = isApprovedAdminEmail(normalizedEmail) ? "admin" : "editor";

  const [created] = await db
    .insert(adminsTable)
    .values({ username, email: normalizedEmail, passwordHash: hashPassword(password), role })
    .returning({ id: adminsTable.id, username: adminsTable.username, role: adminsTable.role });
  res.status(201).json(created);
});

export default router;
