import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم — أثر عُمان" },
    ],
    links: [{ rel: "canonical", href: "/admin/login" }],
  }),
  component: AdminIndex,
});

function AdminIndex() {
  if (typeof window !== "undefined") {
    window.location.replace("/admin/login");
  }
  return (
    <div dir="rtl" lang="ar" style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#0b3d2e",color:"#e8c870",fontFamily:"Tajawal, system-ui, sans-serif"}}>
      <a href="/admin/login" style={{color:"#e8c870",fontSize:"1.25rem",textDecoration:"none"}}>
        الانتقال إلى لوحة التحكم...
      </a>
    </div>
  );
}
