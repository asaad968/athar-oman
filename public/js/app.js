/* =========================================================
   app.js — السلوك العام: القائمة الجانبية، الإحصاءات،
   مقال اليوم، أحدث المقالات، صفحة التصنيف، صفحة المقال.
   ========================================================= */

// حماية: تأكد من وجود الـ namespace حتى لو تحمّل app.js أولاً
window.AtharOman = window.AtharOman || {};

(function (App) {
  /* ===== Theme toggle (dark/light) ===== */
  const savedTheme = localStorage.getItem("ao-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  function injectThemeBtn(){
    const headerInner = document.querySelector(".header-inner");
    if(!headerInner || document.getElementById("themeBtn")) return;
    const btn = document.createElement("button");
    btn.id = "themeBtn";
    btn.className = "theme-btn";
    btn.setAttribute("aria-label","تبديل الوضع");
    const setIcon = () => {
      btn.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";
    };
    setIcon();
    btn.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", cur);
      localStorage.setItem("ao-theme", cur);
      setIcon();
    });
    headerInner.appendChild(btn);
  }
  // تحقّق من أن DOM جاهز قبل حقن الزر
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectThemeBtn);
  } else {
    injectThemeBtn();
  }

  /* ===== Side menu ===== */
  const menuBtn = document.getElementById("menuBtn");
  const sideMenu = document.getElementById("sideMenu");
  const overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("closeMenuBtn");
  function openMenu() { sideMenu?.classList.add("open"); overlay?.classList.add("show"); }
  function closeMenu() { sideMenu?.classList.remove("open"); overlay?.classList.remove("show"); }
  menuBtn?.addEventListener("click", openMenu);
  closeBtn?.addEventListener("click", closeMenu);
  overlay?.addEventListener("click", closeMenu);

  /* ===== Helpers ===== */
  function articleCard(a) {
    const img = a.image || App.buildPath("/assets/placeholder.svg");
    const catName = catLabel(a.category);
    return `
      <a class="article-card" href="${App.buildPath('/article.html')}?slug=${encodeURIComponent(a.slug)}">
        <img class="thumb" loading="lazy" src="${img}" alt="${a.title}" onerror="this.src='${App.buildPath('/assets/placeholder.svg')}'"/>
        <div class="body">
          <span class="cat-tag">${catName}</span>
          <h3>${a.title}</h3>
          <p>${a.excerpt || ""}</p>
          <div class="meta-row"><span>${a.date || ""}</span></div>
          <span class="read-btn">قراءة المقال</span>
        </div>
      </a>`;
  }
  function catLabel(c){
    return ({personalities:"شخصيات",events:"أحداث",battles:"معارك",states:"دول"})[c] || "مقال";
  }
  App.articleCard = articleCard;
  App.catLabel = catLabel;

  /* ===== Stats + Home sections ===== */
  async function initHome() {
    const stats = document.getElementById("stats");
    if (!stats) return;
    try {
      const list = await App.loadIndex();
      const counts = { all: list.length };
      stats.querySelectorAll("[data-stat]").forEach(el => {
        const k = el.dataset.stat;
        animateNumber(el, counts[k] || 0);
      });

      // مقال اليوم: عشوائي مستقر يومياً
      const daily = pickDaily(list);
      const dailyBox = document.getElementById("dailyArticle");
      if (dailyBox && daily) {
        dailyBox.innerHTML = `
          <img src="${daily.image || App.buildPath('/assets/placeholder.svg')}" alt="${daily.title}" loading="lazy" onerror="this.src='${App.buildPath('/assets/placeholder.svg')}'"/>
          <div>
            <span class="cat-tag">${catLabel(daily.category)}</span>
            <h3>${daily.title}</h3>
            <p>${daily.excerpt || ""}</p>
            <a class="read-btn" style="display:inline-block;margin-top:.5rem;background:var(--gold-dark);color:#fff;padding:.5rem 1rem;border-radius:999px;font-weight:700"
               href="${App.buildPath('/article.html')}?slug=${encodeURIComponent(daily.slug)}">اقرأ مقال اليوم</a>
          </div>`;
      }

      // أحدث المقالات
      const latest = document.getElementById("latestArticles");
      if (latest) {
        const top = list.slice(0, 8);
        latest.innerHTML = top.length ? top.map(articleCard).join("") : `<p class="empty">لا توجد مقالات بعد.</p>`;
      }
    } catch (e) {
      console.error(e);
    }
  }

  function animateNumber(el, target) {
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(t); }
      el.textContent = cur;
    }, 30);
  }

  function pickDaily(list){
    if(!list.length) return null;
    const d = new Date();
    const seed = d.getFullYear()*1000 + (d.getMonth()+1)*50 + d.getDate();
    return list[seed % list.length];
  }

  /* ===== Category page ===== */
  async function initCategory() {
    const groupsBox = document.getElementById("catGroups");
    const articlesBox = document.getElementById("catArticles");
    const titleEl = document.getElementById("catTitle");
    if (!articlesBox && !groupsBox) return;

    const params = new URLSearchParams(location.search);
    const type = params.get("type") || "all";
    const titles = { all:"جميع المقالات", personalities:"الشخصيات", events:"الأحداث", battles:"المعارك", states:"الدول" };
    if (titleEl) titleEl.textContent = titles[type] || "التصنيف";
    document.title = `${titles[type] || "التصنيف"} — أثر عُمان`;

    const list = await App.loadIndex();
    const filtered = App.byType(list, type);

    // إذا التصنيف أحداث/معارك → اعرضها مجمّعة حسب الدولة (group)
    if (type === "events" || type === "battles") {
      const groupsOrder = [
        ["pre-malik", type === "events" ? "أحداث قبل مالك بن فهم" : "معارك ما قبل الدولة"],
        ["malik", type === "events" ? "أحداث دولة مالك بن فهم" : "معارك دولة مالك بن فهم"],
        ["abd-azz", type === "events" ? "أحداث دولة عبد عز بن شمس" : "معارك دولة عبد عز بن شمس"],
        ["aimma", type === "events" ? "أحداث دولة أئمة عمان الأوائل" : "معارك الأئمة"],
        ["nabhani", type === "events" ? "أحداث دولة النباهنة" : "معارك النباهنة"],
        ["yaaruba", type === "events" ? "أحداث دولة اليعاربة" : "معارك اليعاربة"],
        ["busaid", type === "events" ? "أحداث دولة البوسعيد" : "معارك البوسعيد"],
      ];
      let html = "";
      groupsOrder.forEach(([key,label]) => {
        const arr = filtered.filter(a => a.group === key);
        if (!arr.length) return;
        html += `<div class="group-block"><h2>${label}</h2><div class="articles-grid">${arr.map(articleCard).join("")}</div></div>`;
      });
      // متبقي بدون مجموعة
      const rest = filtered.filter(a => !a.group);
      if (rest.length) html += `<div class="group-block"><h2>أخرى</h2><div class="articles-grid">${rest.map(articleCard).join("")}</div></div>`;
      groupsBox.innerHTML = html || `<p class="empty">لا توجد مقالات في هذا التصنيف بعد.</p>`;
      articlesBox.innerHTML = "";
    } else {
      groupsBox.innerHTML = "";
      articlesBox.innerHTML = filtered.length
        ? filtered.map(articleCard).join("")
        : `<p class="empty">لا توجد مقالات في هذا التصنيف بعد.</p>`;
    }
  }

  /* ===== Article page ===== */
  async function initArticle() {
    const box = document.getElementById("articleContent");
    if (!box) return;
    const params = new URLSearchParams(location.search);
    const slug = params.get("slug");
    if (!slug) { box.innerHTML = `<p class="empty">المقال غير محدد.</p>`; return; }

    try {
      const art = await App.loadArticle(slug);
      document.title = `${art.title} — أثر عُمان`;
      document.getElementById("metaDesc")?.setAttribute("content", art.excerpt || art.title);
      document.getElementById("ogTitle")?.setAttribute("content", art.title);
      document.getElementById("ogDesc")?.setAttribute("content", art.excerpt || art.title);

      // ===== تتبع عدد المشاهدات (محلي عبر localStorage) =====
      let views = 0;
      try {
        const key = "ao-views";
        const store = JSON.parse(localStorage.getItem(key) || "{}");
        store[slug] = (store[slug] || 0) + 1;
        views = store[slug];
        localStorage.setItem(key, JSON.stringify(store));
      } catch(_) {}

      box.innerHTML = `
        <h1>${art.title}</h1>
        <div class="article-meta">
          <span>📅 ${art.date || ""}</span>
          <span>📂 ${catLabel(art.category)}</span>
          <span>👁️ ${views} مشاهدة</span>
        </div>
        ${art.image && !art.image.startsWith('http') ? `<img class="featured" src="${App.buildPath(art.image)}" alt="${art.title}" loading="lazy" onerror="this.style.display='none'"/>` : (art.image ? `<img class="featured" src="${art.image}" alt="${art.title}" loading="lazy" onerror="this.style.display='none'"/>` : "")}
        <div class="content">${art.content}</div>
        ${art.tags?.length ? `<div class="tags">${art.tags.map(t=>`<span class="tag">#${t}</span>`).join("")}</div>` : ""}
      `;

      // التنقل بين المقالات
      const list = await App.loadIndex();
      const sameCat = list.filter(a => a.category === art.category);
      const idx = sameCat.findIndex(a => a.slug === slug);
      const prev = idx > 0 ? sameCat[idx-1] : null;
      const next = idx >= 0 && idx < sameCat.length-1 ? sameCat[idx+1] : null;
      const nav = document.getElementById("articleNav");
      if (nav) {
        nav.innerHTML = `
          ${prev ? `<a href="${App.buildPath('/article.html')}?slug=${prev.slug}"><span class="label">السابق</span><span class="title">${prev.title}</span></a>` : `<span></span>`}
          ${next ? `<a href="${App.buildPath('/article.html')}?slug=${next.slug}" style="text-align:left"><span class="label">التالي</span><span class="title">${next.title}</span></a>` : `<span></span>`}
        `;
      }
    } catch (e) {
      box.innerHTML = `<p class="empty">تعذّر تحميل المقال.</p>`;
      console.error(e);
    }
  }

  /* ===== boot ===== */
  document.addEventListener("DOMContentLoaded", () => {
    const path = location.pathname;
    if (path.endsWith("/home.html") || path === "/" || path === "") initHome();
    if (path.endsWith("/category.html")) initCategory();
    if (path.endsWith("/article.html")) initArticle();
  });
})(window.AtharOman);
