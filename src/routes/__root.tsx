import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  useNavigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Shell } from "@/components/vms/Shell";
import { Toaster } from "@/components/ui/sonner";
import { useVMS } from "@/lib/vms-data";

function NotFoundComponent() {
  return (
    <Shell>
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-foreground">404</h1>
          <p className="mt-3 text-muted-foreground">The page you're looking for doesn't exist.</p>
          <a href="/" className="inline-flex mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">Back to Dashboard</a>
        </div>
      </div>
    </Shell>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium">Try again</button>
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
      { title: "Sentinel VMS — Enterprise Visitor Management" },
      { name: "description", content: "Enterprise-grade Visitor Management System with approvals, vehicle tracking, and real-time analytics." },
      { property: "og:title", content: "Sentinel VMS — Enterprise Visitor Management" },
      { property: "og:description", content: "Enterprise-grade Visitor Management with approvals, vehicles, and analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}

function AuthGate() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAuthed = useVMS((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const isLogin = pathname === "/login";

  useEffect(() => {
    if (!isAuthed && !isLogin) navigate({ to: "/login", replace: true });
    if (isAuthed && isLogin) navigate({ to: "/", replace: true });
  }, [isAuthed, isLogin, navigate]);

  if (isLogin || !isAuthed) return <Outlet />;
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}

