import { Router } from "express";
import { db } from "@workspace/db";
import { subscribersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.post("/newsletter/subscribe", async (req, res) => {
  const { email, name } = req.body;
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "email is required" });
    return;
  }
  const emailLower = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLower)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }
  const existing = await db.select().from(subscribersTable).where(eq(subscribersTable.email, emailLower)).limit(1);
  if (existing.length > 0) {
    if (!existing[0].active) {
      await db.update(subscribersTable).set({ active: true }).where(eq(subscribersTable.email, emailLower));
      res.json({ message: "Subscription reactivated" });
    } else {
      res.json({ message: "Already subscribed" });
    }
    return;
  }
  const [subscriber] = await db.insert(subscribersTable).values({ email: emailLower, name: name?.trim() || null }).returning();
  res.status(201).json({ message: "Subscribed successfully", id: subscriber.id });
});

router.post("/newsletter/unsubscribe", async (req, res) => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: "email required" }); return; }
  await db.update(subscribersTable).set({ active: false }).where(eq(subscribersTable.email, email.trim().toLowerCase()));
  res.json({ message: "Unsubscribed" });
});

router.get("/admin/newsletter/subscribers", requireAuth, async (_req, res) => {
  const rows = await db.select().from(subscribersTable).orderBy(desc(subscribersTable.subscribedAt));
  res.json(rows);
});

router.delete("/admin/newsletter/subscribers/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(subscribersTable).where(eq(subscribersTable.id, id));
  res.status(204).end();
});

export default router;
