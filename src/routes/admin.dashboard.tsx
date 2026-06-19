import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { verifySession, logoutUser } from "../lib/api/auth.functions";
import { getAllArticles, saveArticle, deleteArticle } from "../lib/api/articles.functions";
import type { Article } from "../lib/api/articles.functions";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — أثر عُمان" },
      { name: "description", content: "لوحة تحكم إدارة المقالات" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>({
    slug: "",
    title: "",
    category: "general",
    date: new Date().toISOString().split("T")[0],
    excerpt: "",
    content: "",
    tags: [],
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("admin_token");

      if (!storedToken) {
        navigate({ to: "/admin/login" });
        return;
      }

      const result = await verifySession({ data: { token: storedToken } });

      if (!result.valid) {
        localStorage.removeItem("admin_token");
        navigate({ to: "/admin/login" });
        return;
      }

      setToken(storedToken);
      loadArticles(storedToken);
    };

    checkAuth();
  }, []);

  const loadArticles = async (authToken: string) => {
    try {
      setLoading(true);
      const result = await getAllArticles();

      if (result.success) {
        setArticles(result.articles || []);
      }
    } catch (error) {
      setMessage("فشل تحميل المقالات");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!token) return;

    try {
      await logoutUser({ data: { token } });
      localStorage.removeItem("admin_token");
      navigate({ to: "/admin/login" });
    } catch (error) {
      setMessage("فشل تسجيل الخروج");
      setMessageType("error");
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !formData.slug || !formData.title || !formData.content) {
      setMessage("جميع الحقول المطلوبة يجب ملؤها");
      setMessageType("error");
      return;
    }

    try {
      const result = await saveArticle({
        data: {
          token,
          article: formData as Article,
        },
      });

      if (result.success) {
        setMessage("تم حفظ المقال بنجاح");
        setMessageType("success");
        setShowForm(false);
        setEditingArticle(null);
        setFormData({
          slug: "",
          title: "",
          category: "general",
          date: new Date().toISOString().split("T")[0],
          excerpt: "",
          content: "",
          tags: [],
        });
        loadArticles(token);
      } else {
        setMessage(result.message || "فشل حفظ المقال");
        setMessageType("error");
      }
    } catch (error: any) {
      setMessage(error.message || "حدث خطأ");
      setMessageType("error");
    }
  };

  const handleDeleteArticle = async (slug: string) => {
    if (!token || !window.confirm("هل أنت متأكد من حذف هذا المقال؟")) return;

    try {
      const result = await deleteArticle({
        data: { token, slug },
      });

      if (result.success) {
        setMessage("تم حذف المقال بنجاح");
        setMessageType("success");
        loadArticles(token);
      } else {
        setMessage(result.message || "فشل حذف المقال");
        setMessageType("error");
      }
    } catch (error: any) {
      setMessage(error.message || "حدث خطأ");
      setMessageType("error");
    }
  };

  const handleEditArticle = (article: any) => {
    setEditingArticle(article);
    setFormData(article);
    setShowForm(true);
  };

  const handleNewArticle = () => {
    setEditingArticle(null);
    setFormData({
      slug: "",
      title: "",
      category: "general",
      date: new Date().toISOString().split("T")[0],
      excerpt: "",
      content: "",
      tags: [],
    });
    setShowForm(true);
  };

  if (!token) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#0b3d2e",
          color: "#e8c870",
          fontFamily: "Tajawal, system-ui, sans-serif",
        }}
      >
        جارٍ التحقق من الصلاحيات...
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        fontFamily: "Tajawal, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#0b3d2e",
          color: "white",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>لوحة التحكم</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: "0.5rem 1rem",
            background: "#e8c870",
            color: "#0b3d2e",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          تسجيل الخروج
        </button>
      </header>

      {/* Messages */}
      {message && (
        <div
          style={{
            margin: "1rem 2rem",
            padding: "1rem",
            background: messageType === "success" ? "#efe" : "#fee",
            color: messageType === "success" ? "#3c3" : "#c33",
            borderRadius: "4px",
            borderRight: `4px solid ${messageType === "success" ? "#3c3" : "#c33"}`,
          }}
        >
          {message}
        </div>
      )}

      <div style={{ padding: "2rem" }}>
        {/* Main Content */}
        {!showForm ? (
          <>
            {/* Articles List */}
            <div
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h2 style={{ margin: 0, color: "#0b3d2e" }}>المقالات</h2>
                <button
                  onClick={handleNewArticle}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#0b3d2e",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "1rem",
                  }}
                >
                  + مقال جديد
                </button>
              </div>

              {loading ? (
                <p>جارٍ تحميل المقالات...</p>
              ) : articles.length === 0 ? (
                <p style={{ color: "#999" }}>لا توجد مقالات حتى الآن</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.95rem",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f0f0f0", borderBottom: "2px solid #ddd" }}>
                        <th style={{ padding: "1rem", textAlign: "right" }}>العنوان</th>
                        <th style={{ padding: "1rem", textAlign: "right" }}>التصنيف</th>
                        <th style={{ padding: "1rem", textAlign: "right" }}>التاريخ</th>
                        <th style={{ padding: "1rem", textAlign: "center" }}>الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((article) => (
                        <tr
                          key={article.slug}
                          style={{
                            borderBottom: "1px solid #eee",
                            "&:hover": { background: "#f9f9f9" },
                          }}
                        >
                          <td style={{ padding: "1rem" }}>{article.title}</td>
                          <td style={{ padding: "1rem" }}>
                            <span
                              style={{
                                background: "#e8c870",
                                color: "#0b3d2e",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "12px",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              {article.category}
                            </span>
                          </td>
                          <td style={{ padding: "1rem" }}>{article.date}</td>
                          <td
                            style={{
                              padding: "1rem",
                              textAlign: "center",
                              display: "flex",
                              gap: "0.5rem",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              onClick={() => handleEditArticle(article)}
                              style={{
                                padding: "0.5rem 1rem",
                                background: "#0b3d2e",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                              }}
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(article.slug)}
                              style={{
                                padding: "0.5rem 1rem",
                                background: "#c33",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.9rem",
                              }}
                            >
                              حذف
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Article Form */
          <div
            style={{
              background: "white",
              borderRadius: "8px",
              padding: "2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              maxWidth: "900px",
            }}
          >
            <h2 style={{ margin: "0 0 1.5rem 0", color: "#0b3d2e" }}>
              {editingArticle ? "تعديل المقال" : "مقال جديد"}
            </h2>

            <form onSubmit={handleSaveArticle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    الرابط (Slug) *
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    placeholder="article-slug"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      boxSizing: "border-box",
                    }}
                    disabled={!!editingArticle}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    العنوان *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="عنوان المقال"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    التصنيف
                  </label>
                  <select
                    value={formData.category || "general"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as any,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="personalities">شخصيات</option>
                    <option value="events">أحداث</option>
                    <option value="battles">معارك</option>
                    <option value="states">دول</option>
                    <option value="general">عام</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                    التاريخ
                  </label>
                  <input
                    type="date"
                    value={formData.date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  الوصف القصير
                </label>
                <textarea
                  value={formData.excerpt || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="وصف قصير للمقال"
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
                  المحتوى *
                </label>
                <textarea
                  value={formData.content || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="محتوى المقال (يمكن استخدام HTML)"
                  rows={10}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#ddd",
                    color: "#333",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#0b3d2e",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  حفظ المقال
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
