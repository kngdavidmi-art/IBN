import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";

const router = Router();

// Public routes — only return published articles
router.get("/articles", async (req, res) => {
  const { category, limit = "20", offset = "0" } = req.query as Record<string, string>;
  const conditions = [eq(articlesTable.status, "published")];
  if (category) conditions.push(eq(articlesTable.category, category));

  const rows = await db
    .select()
    .from(articlesTable)
    .where(and(...conditions))
    .orderBy(desc(articlesTable.publishedAt))
    .limit(Number(limit))
    .offset(Number(offset));

  res.json(rows);
});

router.get("/articles/trending", async (req, res) => {
  const { limit = "5" } = req.query as Record<string, string>;
  const rows = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.status, "published"))
    .orderBy(desc(articlesTable.viewCount))
    .limit(Number(limit));
  res.json(rows);
});

router.get("/articles/featured", async (_req, res) => {
  const rows = await db
    .select()
    .from(articlesTable)
    .where(and(eq(articlesTable.isFeatured, true), eq(articlesTable.status, "published")))
    .orderBy(desc(articlesTable.publishedAt))
    .limit(5);
  res.json(rows);
});

router.get("/articles/summary", async (_req, res) => {
  const all = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.status, "published"));
  const byCategory: Record<string, number> = {};
  let breaking = 0;
  let featured = 0;
  for (const a of all) {
    byCategory[a.category] = (byCategory[a.category] || 0) + 1;
    if (a.isBreaking) breaking++;
    if (a.isFeatured) featured++;
  }
  res.json({
    total: all.length,
    breaking,
    featured,
    byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
  });
});

router.get("/articles/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [article] = await db
    .select()
    .from(articlesTable)
    .where(and(eq(articlesTable.id, id), eq(articlesTable.status, "published")))
    .limit(1);
  if (!article) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  // Increment view count asynchronously — don't block the response
  db.update(articlesTable)
    .set({ viewCount: sql`${articlesTable.viewCount} + 1` })
    .where(eq(articlesTable.id, id))
    .catch(() => {});

  res.json(article);
});

export default router;
