import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.use(requireAuth);

router.get("/admin/articles", async (_req, res) => {
  const rows = await db.select().from(articlesTable).orderBy(articlesTable.id);
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
  const { title, subtitle, category, content, author, imageUrl, videoUrl, isFeatured, isBreaking } = req.body;
  if (!title || !category || !content || !author) {
    res.status(400).json({ error: "title, category, content, author are required" });
    return;
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
      publishedAt: new Date(),
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

export default router;
