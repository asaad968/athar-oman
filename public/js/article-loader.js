/* =========================================================
   article-loader.js
   مسؤول عن تحميل مُفهرس المقالات (articles/index.json)
   ثم تحميل كل مقال HTML على حدة وقراءة بياناته الوصفية
   من وسوم <meta> في رأس الملف.
   ========================================================= */

window.AtharOman = window.AtharOman || {};

(function (App) {
  const INDEX_URL = App.buildPath("/articles/index.json");
  let cache = null;

  /** يقرأ data attribute أو meta من نص HTML */
  function parseMetaFromHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const get = (name) =>
      doc.querySelector(`meta[name="${name}"]`)?.getAttribute("content") || "";
    const content = doc.querySelector("article, .content, body")?.innerHTML || "";
    return {
      title: get("title") || doc.querySelector("h1")?.textContent || "",
      category: get("category"),
      group: get("group"), // مثلا: yaaruba, nabhani...
      image: get("image"),
      date: get("date"),
      excerpt: get("excerpt"),
      tags: (get("tags") || "").split(",").map(s => s.trim()).filter(Boolean),
      content,
    };
  }

  async function loadIndex() {
    if (cache) return cache;
    const res = await fetch(INDEX_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error("تعذّر تحميل قائمة المقالات");
    const list = await res.json();
    // فرز حسب التاريخ تنازليًا
    list.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    cache = list;
    return cache;
  }

  async function loadArticle(slug) {
    const list = await loadIndex();
    const meta = list.find(a => a.slug === slug);
    if (!meta) throw new Error("المقال غير موجود");
    const res = await fetch(App.buildPath(`/articles/${slug}.html`), { cache: "no-cache" });
    if (!res.ok) throw new Error("تعذّر تحميل المقال");
    const html = await res.text();
    const parsed = parseMetaFromHtml(html);
    return { ...meta, ...parsed };
  }

  function byType(list, type) {
    if (!type || type === "all") return list;
    return list.filter(a => a.category === type);
  }

  App.loadIndex = loadIndex;
  App.loadArticle = loadArticle;
  App.byType = byType;
})(window.AtharOman);
