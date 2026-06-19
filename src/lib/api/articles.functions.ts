import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { verifyToken } from "../auth.server";
import fs from "node:fs/promises";
import path from "node:path";

// Define the article schema
const ArticleSchema = z.object({
  slug: z.string().min(1, "الرابط مطلوب"),
  title: z.string().min(1, "العنوان مطلوب"),
  category: z.enum(["personalities", "events", "battles", "states", "general"]),
  group: z.string().optional(),
  date: z.string().optional(),
  image: z.string().optional(),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  content: z.string().min(1, "المحتوى مطلوب"),
});

export type Article = z.infer<typeof ArticleSchema>;

const PUBLIC_DIR = path.join(process.cwd(), "public");
const ARTICLES_DIR = path.join(PUBLIC_DIR, "articles");
const INDEX_FILE = path.join(ARTICLES_DIR, "index.json");

/**
 * Get all articles
 */
export const getAllArticles = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const indexContent = await fs.readFile(INDEX_FILE, "utf-8");
      const articles = JSON.parse(indexContent);
      return {
        success: true,
        articles,
      };
    } catch (error) {
      return {
        success: false,
        message: "فشل تحميل المقالات",
        articles: [],
      };
    }
  }
);

/**
 * Get single article
 */
export const getArticle = createServerFn({ method: "POST" })
  .inputValidator(z.object({ slug: z.string() }))
  .handler(async ({ data }) => {
    try {
      const articlePath = path.join(ARTICLES_DIR, `${data.slug}.html`);
      const content = await fs.readFile(articlePath, "utf-8");

      return {
        success: true,
        content,
      };
    } catch (error) {
      return {
        success: false,
        message: "فشل تحميل المقال",
      };
    }
  });

/**
 * Save or update article (requires authentication)
 */
export const saveArticle = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string(),
      article: ArticleSchema,
    })
  )
  .handler(async ({ data }) => {
    // Verify authentication
    if (!verifyToken(data.token)) {
      return {
        success: false,
        message: "غير مصرح - يرجى تسجيل الدخول",
      };
    }

    try {
      // Validate article data
      const article = ArticleSchema.parse(data.article);

      // Create article HTML file
      const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="title" content="${article.title.replace(/"/g, "&quot;")}">
  <meta name="category" content="${article.category}">
  ${article.group ? `<meta name="group" content="${article.group}">` : ""}
  <meta name="date" content="${article.date || ""}">
  <meta name="image" content="${article.image || ""}">
  <meta name="excerpt" content="${(article.excerpt || "").replace(/"/g, "&quot;")}">
  ${article.tags?.length ? `<meta name="tags" content="${article.tags.join(", ")}">` : ""}
</head>
<body>
  <article>
    ${article.content}
  </article>
</body>
</html>`;

      // Write article file
      const articlePath = path.join(ARTICLES_DIR, `${article.slug}.html`);
      await fs.writeFile(articlePath, htmlContent, "utf-8");

      // Update index.json
      let index: any[] = [];
      try {
        const indexContent = await fs.readFile(INDEX_FILE, "utf-8");
        index = JSON.parse(indexContent);
      } catch {
        // Index doesn't exist yet
      }

      // Remove old entry if exists
      index = index.filter((a) => a.slug !== article.slug);

      // Add new entry
      index.unshift({
        slug: article.slug,
        title: article.title,
        category: article.category,
        group: article.group || null,
        date: article.date || new Date().toISOString().split("T")[0],
        image: article.image || null,
        excerpt: article.excerpt || null,
        tags: article.tags || [],
      });

      // Write updated index
      await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), "utf-8");

      return {
        success: true,
        message: "تم حفظ المقال بنجاح",
        slug: article.slug,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "فشل حفظ المقال",
      };
    }
  });

/**
 * Delete article (requires authentication)
 */
export const deleteArticle = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string(),
      slug: z.string(),
    })
  )
  .handler(async ({ data }) => {
    // Verify authentication
    if (!verifyToken(data.token)) {
      return {
        success: false,
        message: "غير مصرح - يرجى تسجيل الدخول",
      };
    }

    try {
      // Delete article file
      const articlePath = path.join(ARTICLES_DIR, `${data.slug}.html`);
      await fs.unlink(articlePath);

      // Update index.json
      let index: any[] = [];
      try {
        const indexContent = await fs.readFile(INDEX_FILE, "utf-8");
        index = JSON.parse(indexContent);
      } catch {
        // Index doesn't exist
      }

      // Remove entry
      index = index.filter((a) => a.slug !== data.slug);

      // Write updated index
      await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), "utf-8");

      return {
        success: true,
        message: "تم حذف المقال بنجاح",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "فشل حذف المقال",
      };
    }
  });
