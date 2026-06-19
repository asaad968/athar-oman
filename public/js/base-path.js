/* =========================================================
   base-path.js — دالة مساعدة لحساب المسار الأساسي
   تدعم النشر على أي استضافة (GitHub Pages, Vercel, إلخ)
   ========================================================= */

window.AtharOman = window.AtharOman || {};

(function (App) {
  /**
   * حساب المسار الأساسي (Base Path)
   * يعمل على النطاق الرئيسي وفي المجلدات الفرعية
   */
  function getBasePath() {
    // في بيئة التطوير أو الإنتاج، نستخدم document.currentScript أو location
    const currentPath = window.location.pathname;
    
    // إذا كان الملف في جذر الموقع (/ أو /index.html)
    if (currentPath === "/" || currentPath === "/index.html") {
      return "";
    }
    
    // إذا كان في مجلد فرعي (مثل /repo-name/page.html)
    // نحسب المسار حتى آخر /
    const parts = currentPath.split("/").filter(Boolean);
    
    // إذا كان هناك ملف HTML في النهاية (مثل page.html)
    if (parts[parts.length - 1]?.includes(".html")) {
      parts.pop();
    }
    
    // إذا كان هناك query string، نتجاهله
    if (parts.length === 0) {
      return "";
    }
    
    return "/" + parts.join("/");
  }

  /**
   * بناء رابط كامل مع دعم المسار الأساسي
   * @param {string} path - المسار النسبي (مثل /articles/index.json)
   * @returns {string} - المسار الكامل
   */
  function buildPath(path) {
    const basePath = getBasePath();
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    return basePath + path;
  }

  App.getBasePath = getBasePath;
  App.buildPath = buildPath;
})(window.AtharOman);
