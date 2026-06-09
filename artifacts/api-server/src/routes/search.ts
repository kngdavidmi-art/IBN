import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { ilike, or, and, eq } from "drizzle-orm";
import { desc } from "drizzle-orm";

const router = Router();

router.get("/articles/search", async (req, res) => {
  const { q, category, limit = "20", offset = "0" } = req.query as Record<string, string>;

  const conditions: ReturnType<typeof ilike>[] = [];

  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    conditions.push(
      or(
        ilike(articlesTable.title, term),
        ilike(articlesTable.subtitle, term),
        ilike(articlesTable.content, term),
        ilike(articlesTable.author, term),
      )!,
    );
  }

  if (category && category !== "All") {
    conditions.push(eq(articlesTable.category, category) as any);
  }

  const whereClause =
    conditions.length === 0
      ? undefined
      : conditions.length === 1
        ? conditions[0]
        : and(...conditions);

  const rows = await db
    .select()
    .from(articlesTable)
    .where(whereClause)
    .orderBy(desc(articlesTable.publishedAt))
    .limit(Number(limit))
    .offset(Number(offset));

  const total = rows.length;

  res.json({ results: rows, total, query: q || "", category: category || "" });
});

export default router;
