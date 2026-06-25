import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Car, Train, Bus, Plane, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TripCard } from "@/components/trip-card";
import { api, transportLabel, type TransportType } from "@/lib/api";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Waymate — Найди попутчиков" },
      { name: "description", content: "Ищи поездки по маршруту, дате и транспорту. Создавай свои." },
      { property: "og:title", content: "Waymate — Найди попутчиков" },
      { property: "og:description", content: "Ищи поездки по маршруту, дате и транспорту." },
    ],
  }),
  component: HomePage,
});

const transports: { key: TransportType | "all"; label: string; Icon: typeof Car; tint: string }[] = [
  { key: "all", label: "Все", Icon: Sparkles, tint: "bg-secondary text-primary" },
  { key: "car", label: "Авто", Icon: Car, tint: "bg-orange-50 text-orange-700" },
  { key: "train", label: "Поезд", Icon: Train, tint: "bg-amber-50 text-amber-700" },
  { key: "bus", label: "Автобус", Icon: Bus, tint: "bg-rose-50 text-rose-700" },
  { key: "plane", label: "Самолёт", Icon: Plane, tint: "bg-yellow-50 text-yellow-800" },
];


function HomePage() {
  const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: api.trips });
  const [filter, setFilter] = useState<TransportType | "all">("all");
  const [multi, setMulti] = useState<Set<TransportType>>(new Set());
  const [minSeats, setMinSeats] = useState(1);
  const [query, setQuery] = useState("");
  const trips = tripsQuery.data ?? [];

  const filtered = useMemo(() => {
    return trips.filter((t) => {
      if (filter !== "all" && t.transport !== filter) return false;
      if (multi.size > 0 && !multi.has(t.transport)) return false;
      if (t.seats - t.taken < minSeats) return false;
      if (query && !`${t.from} ${t.to}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [filter, multi, minSeats, query, trips]);

  return (
    <AppShell>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-rose-500/30 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="relative mx-auto max-w-[1300px] px-5 pb-10 pt-8 lg:px-10 lg:pb-14 lg:pt-12">
          <div className="flex items-center justify-between lg:hidden">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">waymate</p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white">Поезжай вместе</h1>
            </div>
            <Link to="/profile" className="grid h-12 w-12 place-items-center rounded-full bg-white/20 backdrop-blur text-base font-bold text-white ring-1 ring-white/30">A</Link>
          </div>
          <div className="hidden max-w-3xl lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">Найти попутчиков</p>
            <h1 className="mt-3 text-5xl font-extrabold leading-[1.05] tracking-tight text-white">
              Открой дорогу,{" "}
              <span className="bg-gradient-to-r from-amber-100 to-orange-50 bg-clip-text text-transparent">поезжай вместе.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-white/85">
              Поезд, машина, автобус или самолёт — Waymate собирает тех, кому по пути.
            </p>
          </div>

          {/* search */}
          <div className="group relative mt-6 lg:mt-8 lg:max-w-2xl">

            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-rose-400 opacity-60 blur-lg transition group-focus-within:opacity-90" />
            <div className="relative flex items-center gap-2 rounded-full bg-card/95 p-2 shadow-lift ring-1 ring-white/40 backdrop-blur">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-primary">
                <Search className="h-5 w-5" strokeWidth={2.5} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Откуда — куда (напр. Москва)"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <button className="rounded-full bg-gradient-to-br from-[oklch(0.62_0.17_38)] to-[oklch(0.55_0.2_28)] px-6 py-3 text-base font-bold text-white shadow-[0_8px_20px_-6px_oklch(0.55_0.2_28/0.6)] transition hover:brightness-110">
                Искать
              </button>
            </div>
          </div>
        </div>
      </section>



      <div className="mx-auto max-w-[1300px] px-5 py-6 lg:px-10 lg:py-10">
        <div className="flex items-end justify-between gap-3 pb-5">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl lg:text-4xl">Ближайшие поездки</h2>
          <span className="shrink-0 text-sm text-muted-foreground">{filtered.length} найдено</span>
        </div>

        {/* horizontal filter bar */}
        <div className="-mx-5 mb-6 flex items-center gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:gap-3 lg:px-0">
          {transports.map((t) => {
            const active = filter === t.key;
            const Icon = t.Icon;
            return (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition lg:px-5 lg:py-2.5 lg:text-base ${active ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-card text-foreground hover:border-primary/40"}`}
              >
                <span className={`grid h-7 w-7 place-items-center rounded-lg ${active ? "bg-white/20 text-primary-foreground" : t.tint}`}>
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                {t.label}
              </button>
            );
          })}


          <div className="mx-1 hidden h-7 w-px bg-border lg:block" />

          <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 lg:flex">
            <span className="text-sm text-muted-foreground">Мест ≥</span>
            <input
              type="range"
              min={1}
              max={8}
              value={minSeats}
              onChange={(e) => setMinSeats(+e.target.value)}
              className="w-28 accent-[color:var(--clay)]"
            />
            <span className="w-4 text-sm font-semibold text-foreground">{minSeats}</span>
          </div>

          {(filter !== "all" || minSeats > 1 || multi.size > 0 || query) && (
            <button
              onClick={() => { setMulti(new Set()); setMinSeats(1); setFilter("all"); setQuery(""); }}
              className="ml-auto shrink-0 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-secondary"
            >
              Сбросить
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:gap-5">
          {tripsQuery.isLoading && (
            <div className="col-span-full rounded-3xl border border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
              Загружаем поездки...
            </div>
          )}
          {tripsQuery.isError && (
            <div className="col-span-full rounded-3xl border border-destructive/30 bg-card p-10 text-center text-sm text-destructive">
              Не удалось загрузить поездки.
            </div>
          )}
          {!tripsQuery.isLoading && filtered.map((t) => <TripCard key={t.id} trip={t} />)}
          {!tripsQuery.isLoading && filtered.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-border bg-card/40 p-12 text-center">
              <p className="text-base text-muted-foreground">Ничего не нашли по фильтрам.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
