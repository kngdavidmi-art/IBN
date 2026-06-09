import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

router.get("/articles", async (req, res) => {
  const { category, limit = "20", offset = "0" } = req.query as Record<string, string>;
  const conditions = [];
  if (category) conditions.push(eq(articlesTable.category, category));

  const rows = await db
    .select()
    .from(articlesTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(articlesTable.publishedAt))
    .limit(Number(limit))
    .offset(Number(offset));

  res.json(rows);
});

router.get("/articles/featured", async (_req, res) => {
  const rows = await db
    .select()
    .from(articlesTable)
    .where(eq(articlesTable.isFeatured, true))
    .orderBy(desc(articlesTable.publishedAt))
    .limit(5);
  res.json(rows);
});

router.get("/articles/summary", async (_req, res) => {
  const all = await db.select().from(articlesTable);
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
  const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
  if (!article) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(article);
});

export default router;
