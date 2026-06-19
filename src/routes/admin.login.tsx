import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginUser } from "../lib/api/auth.functions";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — أثر عُمان" },
      { name: "description", content: "لوحة تحكم أثر عُمان" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser({ data: { username, password } });

      if (result.success && result.token) {
        // Store token in localStorage
        localStorage.setItem("admin_token", result.token);
        // Redirect to admin dashboard
        navigate({ to: "/admin/dashboard" });
      } else {
        setError(result.message || "فشل تسجيل الدخول");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      lang="ar"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0b3d2e 0%, #1a5c47 100%)",
        fontFamily: "Tajawal, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "2rem",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              color: "#0b3d2e",
              margin: "0 0 0.5rem 0",
              fontSize: "1.75rem",
            }}
          >
            أثر عُمان
          </h1>
          <p style={{ color: "#666", margin: 0 }}>لوحة التحكم</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#333",
                fontWeight: 500,
              }}
            >
              اسم المستخدم
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل اسم المستخدم"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "1rem",
                boxSizing: "border-box",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0b3d2e")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "0.5rem",
                color: "#333",
                fontWeight: 500,
              }}
            >
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "2px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "1rem",
                boxSizing: "border-box",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0b3d2e")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              disabled={loading}
            />
          </div>

          {error && (
            <div
              style={{
                background: "#fee",
                color: "#c33",
                padding: "0.75rem",
                borderRadius: "6px",
                marginBottom: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: loading ? "#ccc" : "#0b3d2e",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.target as HTMLButtonElement).style.background =
                "#1a5c47";
            }}
            onMouseLeave={(e) => {
              if (!loading) (e.target as HTMLButtonElement).style.background =
                "#0b3d2e";
            }}
          >
            {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            color: "#999",
            fontSize: "0.9rem",
          }}
        >
          لوحة التحكم محمية بكلمة مرور
        </p>
      </div>
    </div>
  );
}
