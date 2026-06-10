import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.use(requireAuth);

router.get("/admin/articles", async (_req, res) => {
  const rows = await db.select().from(articlesTable).orderBy(desc(articlesTable.createdAt));
  res.json(rows);
});

router.get("/admin/articles/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [article] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
  if (!article) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(article);
});

router.post("/admin/articles", async (req, res) => {
  const { title, subtitle, category, content, author, imageUrl, videoUrl, isFeatured, isBreaking, status } = req.body;
  const adminUser = (req as any).adminUser;

  if (!title || !category || !content || !author) {
    res.status(400).json({ error: "title, category, content, author are required" });
    return;
  }

  // Admins can publish directly; editors always start as draft
  let articleStatus: string;
  if (adminUser.role === "admin") {
    articleStatus = status === "draft" ? "draft" : "published";
  } else {
    articleStatus = "draft";
  }

  const [created] = await db
    .insert(articlesTable)
    .values({
      title,
      subtitle: subtitle || null,
      category,
      content,
      author,
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      isFeatured: isFeatured ?? false,
      isBreaking: isBreaking ?? false,
      status: articleStatus,
      publishedAt: articleStatus === "published" ? new Date() : new Date(),
    })
    .returning();
  res.status(201).json(created);
});

router.patch("/admin/articles/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { title, subtitle, category, content, author, imageUrl, videoUrl, isFeatured, isBreaking } = req.body;
  const [existing] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [updated] = await db
    .update(articlesTable)
    .set({
      ...(title !== undefined && { title }),
      ...(subtitle !== undefined && { subtitle }),
      ...(category !== undefined && { category }),
      ...(content !== undefined && { content }),
      ...(author !== undefined && { author }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(videoUrl !== undefined && { videoUrl }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(isBreaking !== undefined && { isBreaking }),
    })
    .where(eq(articlesTable.id, id))
    .returning();
  res.json(updated);
});

router.delete("/admin/articles/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  await db.delete(articlesTable).where(eq(articlesTable.id, id));
  res.status(204).send();
});

// Submit for review — editor action
router.post("/admin/articles/:id/submit", async (req, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (existing.status === "published") {
    res.status(400).json({ error: "Article is already published" });
    return;
  }
  const [updated] = await db
    .update(articlesTable)
    .set({ status: "pending_review" })
    .where(eq(articlesTable.id, id))
    .returning();
  res.json(updated);
});

// Publish — admin-only action
router.post("/admin/articles/:id/publish", async (req, res) => {
  const adminUser = (req as any).adminUser;
  if (adminUser.role !== "admin") {
    res.status(403).json({ error: "Admin role required to publish" });
    return;
  }
  const id = Number(req.params.id);
  const [existing] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [updated] = await db
    .update(articlesTable)
    .set({ status: "published", publishedAt: new Date() })
    .where(eq(articlesTable.id, id))
    .returning();
  res.json(updated);
});

// Unpublish / send back to draft — admin-only action
router.post("/admin/articles/:id/unpublish", async (req, res) => {
  const adminUser = (req as any).adminUser;
  if (adminUser.role !== "admin") {
    res.status(403).json({ error: "Admin role required to unpublish" });
    return;
  }
  const id = Number(req.params.id);
  const [existing] = await db.select().from(articlesTable).where(eq(articlesTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const [updated] = await db
    .update(articlesTable)
    .set({ status: "draft" })
    .where(eq(articlesTable.id, id))
    .returning();
  res.json(updated);
});

// Pending review count — for dashboard badge
router.get("/admin/pending-count", async (_req, res) => {
  const rows = await db
    .select({ id: articlesTable.id })
    .from(articlesTable)
    .where(eq(articlesTable.status, "pending_review"));
  res.json({ count: rows.length });
});

export default router;
