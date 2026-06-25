import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, Plus, MessageCircle, User, Compass } from "lucide-react";
import type { ReactNode } from "react";
import { api, getToken } from "@/lib/api";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hideChrome = pathname === "/onboarding" || pathname === "/auth" || pathname === "/register";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!hideChrome && <TopNav />}
      <main className={hideChrome ? "" : "pb-24 lg:pb-0"}>{children}</main>
      {!hideChrome && <BottomNav />}
    </div>
  );
}

function TopNav() {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
    enabled: Boolean(getToken()),
    retry: false,
  });
  const initial = meQuery.data?.firstName?.[0] ?? "A";
  const links = [
    { to: "/", label: "Поездки" },
    { to: "/chats", label: "Чаты" },
    { to: "/profile", label: "Профиль" },
  ] as const;
  return (
    <header className="sticky top-0 z-30 hidden border-b border-border/60 bg-background/85 backdrop-blur lg:block">
      <div className="mx-auto flex h-16 max-w-[1300px] items-center gap-8 px-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
            <Compass className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-semibold">waymate</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-hero)] px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-lift)] transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" /> Создать поездку
          </Link>
          <Link to={getToken() ? "/profile" : "/auth"} className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold">
            {initial}
          </Link>
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const items: Array<{ to: "/" | "/create" | "/chats" | "/profile"; label: string; icon: typeof Home; exact?: boolean }> = [
    { to: "/", label: "Главная", icon: Home, exact: true },
    { to: "/create", label: "Создать", icon: Plus },
    { to: "/chats", label: "Чаты", icon: MessageCircle },
    { to: "/profile", label: "Профиль", icon: User },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background/95 backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ to, label, icon: Icon, exact }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact }}
              className="flex flex-col items-center gap-1 px-2 py-3 text-[11px] text-muted-foreground transition"
              activeProps={{ className: "text-primary" }}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
