import { Router } from "express";
import { db } from "@workspace/db";
import { commentsTable, articlesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/articles/:id/comments", async (req, res) => {
  const articleId = Number(req.params.id);
  const rows = await db
    .select()
    .from(commentsTable)
    .where(and(eq(commentsTable.articleId, articleId), eq(commentsTable.approved, true)))
    .orderBy(desc(commentsTable.createdAt));
  res.json(rows);
});

router.post("/articles/:id/comments", async (req, res) => {
  const articleId = Number(req.params.id);
  const { name, email, content } = req.body;
  if (!name || !content) {
    res.status(400).json({ error: "name and content are required" });
    return;
  }
  if (content.length > 2000) {
    res.status(400).json({ error: "Comment too long (max 2000 characters)" });
    return;
  }
  const [article] = await db.select({ id: articlesTable.id }).from(articlesTable).where(eq(articlesTable.id, articleId)).limit(1);
  if (!article) {
    res.status(404).json({ error: "Article not found" });
    return;
  }
  const [comment] = await db.insert(commentsTable).values({
    articleId,
    name: name.trim(),
    email: email?.trim() || null,
    content: content.trim(),
    approved: false,
  }).returning();
  res.status(201).json({ message: "Comment submitted for review", id: comment.id });
});

router.get("/admin/comments", requireAuth, async (_req, res) => {
  const rows = await db.select().from(commentsTable).orderBy(desc(commentsTable.createdAt));
  res.json(rows);
});

router.patch("/admin/comments/:id/approve", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [comment] = await db.update(commentsTable).set({ approved: true }).where(eq(commentsTable.id, id)).returning();
  if (!comment) { res.status(404).json({ error: "Not found" }); return; }
  res.json(comment);
});

router.patch("/admin/comments/:id/reject", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [comment] = await db.update(commentsTable).set({ approved: false }).where(eq(commentsTable.id, id)).returning();
  if (!comment) { res.status(404).json({ error: "Not found" }); return; }
  res.json(comment);
});

router.delete("/admin/comments/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(commentsTable).where(eq(commentsTable.id, id));
  res.status(204).end();
});

router.get("/admin/comments/count", requireAuth, async (_req, res) => {
  const rows = await db.select().from(commentsTable).where(eq(commentsTable.approved, false));
  res.json({ count: rows.length });
});

export default router;
