import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div dir="rtl" lang="ar" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#0b3d2e",color:"#e8c870",fontFamily:"Tajawal, system-ui, sans-serif",padding:"1rem"}}>
      <div style={{maxWidth:"28rem",textAlign:"center"}}>
        <h1 style={{fontSize:"5rem",fontWeight:700,margin:0}}>404</h1>
        <h2 style={{marginTop:"1rem",fontSize:"1.25rem",fontWeight:600}}>الصفحة غير موجودة</h2>
        <p style={{marginTop:".5rem",fontSize:".95rem",opacity:.85}}>
          الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
        </p>
        <div style={{marginTop:"1.5rem"}}>
          <a
            href="./home.html"
            style={{display:"inline-flex",alignItems:"center",justifyContent:"center",borderRadius:".5rem",background:"#e8c870",padding:".55rem 1.1rem",fontSize:".95rem",fontWeight:700,color:"#0b3d2e",textDecoration:"none"}}
          >
            العودة إلى الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "أثر عُمان — موسوعة التاريخ العُماني" },
      { name: "description", content: "موسوعة شاملة للتاريخ العُماني — شخصيات، أحداث، معارك، ودول." },
      { name: "author", content: "أثر عُمان" },
      { property: "og:title", content: "أثر عُمان — موسوعة التاريخ العُماني" },
      { property: "og:description", content: "موسوعة شاملة للتاريخ العُماني." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ar_AR" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
