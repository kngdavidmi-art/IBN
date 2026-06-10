import { Router } from "express";
import { db } from "@workspace/db";
import { adminsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { createHash } from "crypto";
import { requireAuth } from "./auth";
import { isApprovedAdminEmail } from "../adminEmails";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "ibn-salt").digest("hex");
}

function requireAdmin(req: any, res: any, next: any) {
  if (req.adminUser?.role !== "admin") {
    res.status(403).json({ error: "Admin role required" });
    return;
  }
  next();
}

router.use(requireAuth);
router.use(requireAdmin);

router.get("/admin/editors", async (_req, res) => {
  const editors = await db
    .select({
      id: adminsTable.id,
      username: adminsTable.username,
      email: adminsTable.email,
      role: adminsTable.role,
      lastLoginAt: adminsTable.lastLoginAt,
      createdAt: adminsTable.createdAt,
    })
    .from(adminsTable)
    .orderBy(adminsTable.createdAt);
  res.json(editors);
});

router.post("/admin/editors", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !password || !email) {
    res.status(400).json({ error: "username, email and password are required" });
    return;
  }
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await db
    .select({ id: adminsTable.id })
    .from(adminsTable)
    .where(eq(adminsTable.username, username))
    .limit(1);
  if (existingUser.length > 0) {
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

  // Role is always determined by email — cannot be overridden
  const role = isApprovedAdminEmail(normalizedEmail) ? "admin" : "editor";

  const [created] = await db
    .insert(adminsTable)
    .values({ username, email: normalizedEmail, passwordHash: hashPassword(password), role })
    .returning({
      id: adminsTable.id,
      username: adminsTable.username,
      email: adminsTable.email,
      role: adminsTable.role,
      lastLoginAt: adminsTable.lastLoginAt,
      createdAt: adminsTable.createdAt,
    });
  res.status(201).json(created);
});

router.patch("/admin/editors/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { password } = req.body;
  // Note: role cannot be changed manually — it is always derived from email

  const [existing] = await db.select().from(adminsTable).where(eq(adminsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  if (!password) {
    res.status(400).json({ error: "Nothing to update" });
    return;
  }

  const [updated] = await db
    .update(adminsTable)
    .set({ passwordHash: hashPassword(password) })
    .where(eq(adminsTable.id, id))
    .returning({
      id: adminsTable.id,
      username: adminsTable.username,
      email: adminsTable.email,
      role: adminsTable.role,
      lastLoginAt: adminsTable.lastLoginAt,
      createdAt: adminsTable.createdAt,
    });
  res.json(updated);
});

router.delete("/admin/editors/:id", async (req, res) => {
  const id = Number(req.params.id);
  const requesterId = (req as any).adminUser?.id;

  if (id === requesterId) {
    res.status(403).json({ error: "Cannot delete your own account" });
    return;
  }
  const [existing] = await db.select().from(adminsTable).where(eq(adminsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(adminsTable).where(eq(adminsTable.id, id));
  res.status(204).send();
});

export default router;
