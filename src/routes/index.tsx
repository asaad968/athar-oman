import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "أثر عُمان — موسوعة التاريخ العُماني" },
      { name: "description", content: "موسوعة شاملة للتاريخ العُماني — شخصيات، أحداث، معارك، ودول." },
      { property: "og:title", content: "أثر عُمان" },
      { property: "og:description", content: "موسوعة التاريخ العُماني" },
      { httpEquiv: "refresh", content: "0; url=./home.html" },
    ],
    links: [{ rel: "canonical", href: "./home.html" }],
  }),
  component: Index,
});

function Index() {
  // إعادة توجيه فورية على العميل أيضاً (احتياط لو فشل meta refresh)
  if (typeof window !== "undefined") {
    window.location.replace("./home.html");
  }
  return (
    <div dir="rtl" lang="ar" style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#0b3d2e",color:"#e8c870",fontFamily:"Tajawal, system-ui, sans-serif"}}>
      <a href="./home.html" style={{color:"#e8c870",fontSize:"1.25rem",textDecoration:"none"}}>
        الانتقال إلى أثر عُمان...
      </a>
    </div>
  );
}
