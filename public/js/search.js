/* =========================================================
   search.js — البحث الفوري داخل العنوان، المقتطف، الوسوم،
   وأيضاً محتوى المقال الكامل (يُحمَّل عند الحاجة ويُخزَّن مؤقتاً).
   ========================================================= */

window.AtharOman = window.AtharOman || {};

(function (App) {
  const input = document.getElementById("liveSearch");
  const top = document.getElementById("topSearch");
  const info = document.getElementById("searchInfo");
  const out = document.getElementById("searchResults");
  if (!out) return;

  const params = new URLSearchParams(location.search);
  const initialQ = params.get("q") || "";
  if (input) input.value = initialQ;
  if (top) top.value = initialQ;

  let allArticles = [];
  const contentCache = new Map(); // slug -> نص خام

  App.loadIndex().then(list => {
    allArticles = list;
    if (initialQ) run(initialQ);
    else render([]);
  }).catch(err => {
    console.error("خطأ في تحميل الفهرس:", err);
    render([]);
  });

  /** يجلب محتوى مقال نصياً ويخزّنه */
  async function fetchContent(slug) {
    if (contentCache.has(slug)) return contentCache.get(slug);
    try {
      const res = await fetch(App.buildPath(`/articles/${slug}.html`), { cache: "force-cache" });
      if (!res.ok) throw new Error();
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const text = (doc.querySelector("article, .content, body")?.textContent || "")
        .replace(/\s+/g, " ").trim().toLowerCase();
      contentCache.set(slug, text);
      return text;
    } catch {
      contentCache.set(slug, "");
      return "";
    }
  }

  function quickScore(a, q) {
    q = q.toLowerCase();
    let s = 0;
    if ((a.title||"").toLowerCase().includes(q)) s += 5;
    if ((a.excerpt||"").toLowerCase().includes(q)) s += 2;
    if ((a.tags||[]).some(t => t.toLowerCase().includes(q))) s += 3;
    if ((a.category||"").toLowerCase().includes(q)) s += 1;
    return s;
  }

  /** البحث: أولاً نتائج فورية من البيانات الوصفية، ثم نُكمل بالمحتوى */
  async function run(q) {
    q = (q || "").trim();
    if (!q) { render([]); return; }

    // 1) نتائج سريعة من العناوين/الوسوم
    const quick = allArticles
      .map(a => ({ a, s: quickScore(a, q) }))
      .filter(x => x.s > 0);
    render(quick.sort((a,b) => b.s - a.s).map(x => x.a), q, true);

    // 2) بحث في المحتوى الكامل (موازي)
    const ql = q.toLowerCase();
    const contentHits = await Promise.all(
      allArticles.map(async a => {
        const text = await fetchContent(a.slug);
        return text.includes(ql) ? a : null;
      })
    );

    // دمج: ترتيب حسب النقاط، مع إعطاء مَن لم يَظهر في quick نقطة محتوى
    const merged = new Map();
    quick.forEach(({a,s}) => merged.set(a.slug, { a, s }));
    contentHits.forEach(a => {
      if (!a) return;
      if (merged.has(a.slug)) merged.get(a.slug).s += 2;
      else merged.set(a.slug, { a, s: 1 });
    });

    const results = [...merged.values()].sort((x,y) => y.s - x.s).map(x => x.a);
    render(results, q, false);
  }

  function render(results, q, partial) {
    if (info) {
      info.textContent = q
        ? `${results.length} نتيجة عن: "${q}"${partial ? " (جارٍ البحث في المحتوى…)" : ""}`
        : `اكتب كلمة للبحث.`;
    }
    out.innerHTML = results.length
      ? results.map(App.articleCard).join("")
      : (q ? `<p class="empty">لا توجد نتائج.</p>` : "");
  }

  let t;
  input?.addEventListener("input", e => {
    clearTimeout(t);
    t = setTimeout(() => run(e.target.value), 180);
  });
  top?.addEventListener("input", e => {
    clearTimeout(t);
    t = setTimeout(() => run(e.target.value), 180);
  });
})(window.AtharOman);
