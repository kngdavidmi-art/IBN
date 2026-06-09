import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function excerpt(content: string, maxWords = 50): string {
  const words = content.split(/\s+/).slice(0, maxWords);
  return words.join(" ") + (content.split(/\s+/).length > maxWords ? "…" : "");
}

router.get("/rss", async (req, res) => {
  const { category } = req.query as { category?: string };

  const conditions = category ? [eq(articlesTable.category, category)] : [];

  const articles = await db
    .select()
    .from(articlesTable)
    .where(conditions.length ? conditions[0] : undefined)
    .orderBy(desc(articlesTable.publishedAt))
    .limit(50);

  const siteUrl = (() => {
    const domains = process.env.REPLIT_DOMAINS;
    if (domains) return `https://${domains.split(",")[0]}`;
    return "https://ibn.news";
  })();

  const channelTitle = category ? `IBN News — ${category}` : "IBN News";
  const channelDesc = category
    ? `Latest ${category} news from IBN — your world news source.`
    : "IBN News — Breaking News, World News, Business, Tech, Sports and more.";

  const items = articles
    .map(
      (a) => `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${siteUrl}/news/${a.id}</link>
      <guid isPermaLink="true">${siteUrl}/news/${a.id}</guid>
      <description>${escapeXml(a.subtitle || excerpt(a.content))}</description>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <author>${escapeXml(a.author)}</author>
      <category>${escapeXml(a.category)}</category>
      ${a.imageUrl ? `<enclosure url="${escapeXml(a.imageUrl)}" type="image/jpeg" length="0" />` : ""}
      ${a.isBreaking ? "<ibn:breaking>true</ibn:breaking>" : ""}
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:ibn="https://ibn.news/rss/1.0/">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(channelDesc)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/api/rss${category ? `?category=${encodeURIComponent(category)}` : ""}" rel="self" type="application/rss+xml" />
    <image>
      <url>${siteUrl}/favicon.ico</url>
      <title>${escapeXml(channelTitle)}</title>
      <link>${siteUrl}</link>
    </image>
    <ttl>10</ttl>
    ${items}
  </channel>
</rss>`;

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=300");
  res.send(xml);
});

export default router;
