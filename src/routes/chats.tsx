import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api, getToken } from "@/lib/api";
import { TripAvatar } from "@/components/trip-avatar";
import { formatTime } from "@/lib/format";

export const Route = createFileRoute("/chats")({
  head: () => ({ meta: [{ title: "Чаты — Waymate" }] }),
  component: ChatsPage,
});

function ChatsPage() {
  const chatsQuery = useQuery({
    queryKey: ["chats"],
    queryFn: api.chats,
    enabled: Boolean(getToken()),
    retry: false,
  });
  const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: api.trips });
  const [tab, setTab] = useState<"trips" | "dm">("trips");
  const chats = chatsQuery.data ?? [];
  const trips = tripsQuery.data ?? [];
  const list = chats.filter((c) => (tab === "trips" ? c.kind === "group" : c.kind === "dm"));

  if (!getToken()) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold">Войдите, чтобы открыть чаты</h1>
          <p className="mt-2 text-sm text-muted-foreground">Чаты доступны участникам поездок и личных диалогов.</p>
          <Link to="/auth" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Войти
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-5 py-6 lg:py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold">Чаты</h1>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-soft">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Поиск" className="flex-1 bg-transparent text-sm outline-none" />
        </div>

        <div className="mt-5 inline-flex rounded-full bg-secondary p-1 text-sm">
          {(["trips","dm"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-full px-4 py-1.5 transition ${tab === k ? "bg-card shadow-soft" : "text-muted-foreground"}`}
            >
              {k === "trips" ? "Поездки" : "Личные"}
            </button>
          ))}
        </div>

        <ul className="mt-5 divide-y divide-border/60 overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft">
          {list.map((c) => {
            const trip = c.tripId ? trips.find((t) => t.id === c.tripId) : null;
            const other = c.otherUser;
            return (
              <li key={c.id}>
                <Link to="/chat/$chatId" params={{ chatId: c.id }} className="flex items-center gap-3 px-4 py-3 transition hover:bg-secondary/60">
                  {trip ? (
                    <TripAvatar from={trip.from} to={trip.to} size={48} />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-full font-display font-semibold text-white" style={{ background: other?.avatarColor ?? "#888" }}>
                      {other?.firstName[0] ?? "?"}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{c.title}</h3>
                    <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[11px] text-muted-foreground">{formatTime(c.lastAt)}</span>
                    {c.unread > 0 ? (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                        {c.unread}
                      </span>
                    ) : (
                      <span className="h-5" />
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
          {chatsQuery.isLoading && (
            <li className="p-8 text-center text-sm text-muted-foreground">Загружаем чаты...</li>
          )}
          {list.length === 0 && (
            <li className="p-8 text-center text-sm text-muted-foreground">Нет чатов в этой вкладке.</li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}
