/* =========================================================
   router.js — وسيط بسيط لقراءة معاملات الرابط
   (slug, type, q). يُستخدم في صفحتي المقال والتصنيف.
   ========================================================= */
(function (App) {
  App.router = {
    param(name) { return new URLSearchParams(location.search).get(name); }
  };
})(window.AtharOman = window.AtharOman || {});
