import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/sitemap.xml", async (_req, res) => {
  const articles = await db
    .select({ id: articlesTable.id, publishedAt: articlesTable.publishedAt, createdAt: articlesTable.createdAt })
    .from(articlesTable)
    .where(eq(articlesTable.status, "published"))
    .orderBy(desc(articlesTable.publishedAt));

  const baseUrl = process.env.REPLIT_DOMAINS
    ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
    : "https://ibn-news.replit.app";

  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "hourly" },
    { loc: "/category/world", priority: "0.8", changefreq: "daily" },
    { loc: "/category/politics", priority: "0.8", changefreq: "daily" },
    { loc: "/category/business", priority: "0.8", changefreq: "daily" },
    { loc: "/category/technology", priority: "0.8", changefreq: "daily" },
    { loc: "/category/sports", priority: "0.8", changefreq: "daily" },
    { loc: "/category/entertainment", priority: "0.8", changefreq: "daily" },
    { loc: "/category/health", priority: "0.8", changefreq: "daily" },
    { loc: "/category/science", priority: "0.7", changefreq: "daily" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
${articles.map(a => `  <url>
    <loc>${baseUrl}/article/${a.id}</loc>
    <lastmod>${new Date(a.publishedAt || a.createdAt).toISOString().split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n")}
</urlset>`;

  res.set("Content-Type", "application/xml");
  res.send(xml);
});

export default router;
