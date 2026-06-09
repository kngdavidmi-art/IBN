import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.use(requireAuth);

router.get("/admin/engagement", async (_req, res) => {
  const allArticles = await db
    .select({
      id: articlesTable.id,
      title: articlesTable.title,
      category: articlesTable.category,
      author: articlesTable.author,
      viewCount: articlesTable.viewCount,
      publishedAt: articlesTable.publishedAt,
    })
    .from(articlesTable)
    .orderBy(desc(articlesTable.viewCount));

  const totalViews = allArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
  const topArticles = allArticles.slice(0, 10);

  const viewsByCategory: Record<string, number> = {};
  for (const a of allArticles) {
    viewsByCategory[a.category] = (viewsByCategory[a.category] || 0) + (a.viewCount || 0);
  }

  res.json({
    totalViews,
    topArticles,
    viewsByCategory: Object.entries(viewsByCategory)
      .map(([category, views]) => ({ category, views }))
      .sort((a, b) => b.views - a.views),
  });
});

export default router;
