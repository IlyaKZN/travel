import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  Wallet,
  Info,
  Car,
  Train,
  Bus,
  Plane,
  MessageCircle,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TripAvatar } from "@/components/trip-avatar";
import { api, getToken, transportLabel, type TransportType } from "@/lib/api";
import { formatDateTime, formatBudget } from "@/lib/format";

export const Route = createFileRoute("/trip/$tripId")({
  head: () => ({
    meta: [
      { title: "Поездка — Waymate" },
      { name: "description", content: "Детали поездки" },
    ],
  }),
  component: TripDetail,
});

const transportMeta: Record<
  TransportType,
  { icon: typeof Car; tint: string }
> = {
  car: { icon: Car, tint: "bg-orange-50 text-orange-700" },
  train: { icon: Train, tint: "bg-amber-50 text-amber-700" },
  bus: { icon: Bus, tint: "bg-rose-50 text-rose-700" },
  plane: { icon: Plane, tint: "bg-yellow-50 text-yellow-800" },
};

function TripDetail() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tripQuery = useQuery({ queryKey: ["trip", tripId], queryFn: () => api.trip(tripId) });
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
    enabled: Boolean(getToken()),
    retry: false,
  });
  const joinMutation = useMutation({
    mutationFn: () => api.joinTrip(tripId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["trips"] }),
        queryClient.invalidateQueries({ queryKey: ["trip", tripId] }),
        queryClient.invalidateQueries({ queryKey: ["chats"] }),
      ]);
      const chat = await api.tripChat(tripId);
      navigate({ to: "/chat/$chatId", params: { chatId: chat.id } });
    },
  });
  const openTripChatMutation = useMutation({
    mutationFn: () => api.tripChat(tripId),
    onSuccess: (chat) => navigate({ to: "/chat/$chatId", params: { chatId: chat.id } }),
  });

  if (tripQuery.isLoading) {
    return (
      <AppShell>
        <div className="p-10 text-center text-muted-foreground">Загружаем поездку...</div>
      </AppShell>
    );
  }

  const trip = tripQuery.data;
  if (!trip) {
    return (
      <AppShell>
        <div className="p-10 text-center text-muted-foreground">Поездка не найдена</div>
      </AppShell>
    );
  }
  const organizer = trip.organizer ?? trip.participants?.find((p) => p.id === trip.organizerId);
  const participants = trip.participants?.filter((p) => p.id !== trip.organizerId) ?? [];
  const isMember = meQuery.data ? trip.participantIds.includes(meQuery.data.id) : false;
  const seatsLeft = Math.max(0, trip.seats - trip.taken);
  const seatsFresh = seatsLeft >= 2;
  const tMeta = transportMeta[trip.transport];
  const TIcon = tMeta.icon;

  return (
    <AppShell>
      {/* hero */}
      <section className="relative overflow-hidden bg-[image:var(--gradient-hero)] text-primary-foreground">
        {/* ambient glows */}
        <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />

        <div className="relative mx-auto w-full max-w-[1300px] px-5 pb-6 pt-4 lg:pb-8 lg:pt-5">
          <button
            onClick={() => history.back()}
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/25"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Назад
          </button>


          <div className="mt-4 flex items-center gap-4">
            <div className="shrink-0 rounded-2xl bg-white/15 p-1.5 backdrop-blur-sm ring-1 ring-white/20">
              <TripAvatar from={trip.from} to={trip.to} size={56} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold leading-[1.1] tracking-tight sm:text-3xl lg:text-4xl">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>{trip.from}</span>
                  <ArrowRight className="h-5 w-5 shrink-0 text-white/80" strokeWidth={2.25} />
                  <span className="text-white/85">{trip.to}</span>
                </span>
              </h1>
              <p className="mt-1.5 text-sm font-medium text-white/85">
                {formatDateTime(trip.startAt)}
              </p>
            </div>
          </div>
        </div>


      </section>

      <div className="mx-auto w-full max-w-[1300px] space-y-4 px-5 py-6 lg:py-8">
        {/* quick stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Stat icon={Calendar} tint="bg-orange-50 text-orange-700" label="Начало" value={formatDateTime(trip.startAt)} />
          <Stat icon={Clock} tint="bg-rose-50 text-rose-700" label="Окончание" value={formatDateTime(trip.endAt)} />
          <Stat icon={TIcon} tint={tMeta.tint} label="Транспорт" value={transportLabel[trip.transport]} />
          <Stat icon={Users} tint="bg-amber-50 text-amber-700" label="Места" value={`${trip.taken} / ${trip.seats}`} />
          <Stat icon={Wallet} tint="bg-yellow-50 text-yellow-800" label="Бюджет" value={`≈ ${formatBudget(trip.budget)}`} />
        </div>

        {/* people */}
        <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft lg:p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-lg font-bold tracking-tight">
              Участники
            </h3>
            <span className="text-xs font-semibold text-muted-foreground">
              {1 + participants.length} из {trip.seats}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* organizer card */}
            <Link
              to="/profile/$userId"
              params={{ userId: organizer?.id ?? trip.organizerId }}
              className="group relative flex items-center gap-3 rounded-2xl border-2 border-primary/30 bg-[image:var(--gradient-hero)]/5 p-3 transition hover:border-primary/60 hover:shadow-soft"
              style={{ background: `color-mix(in oklab, var(--primary) 6%, var(--card))` }}
            >
              <span
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-bold text-white ring-2 ring-white/60"
                style={{ background: organizer?.avatarColor ?? "#94a3b8" }}
              >
                {organizer?.firstName[0] ?? "?"}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Организатор
                  </span>
                </div>
                <div className="mt-1 truncate text-sm font-bold text-foreground">
                  {organizer?.firstName ?? "Организатор"} {organizer?.lastName ?? ""}
                </div>
              </div>
            </Link>

            {/* traveler cards */}
            {participants.map((p) => (
              <Link
                key={p.id}
                to="/profile/$userId"
                params={{ userId: p.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-3 transition hover:border-primary/40 hover:bg-secondary/60 hover:shadow-soft"
              >
                <span
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-lg font-bold text-white ring-2 ring-white/60"
                  style={{ background: p.avatarColor }}
                >
                  {p.firstName[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-foreground">
                    {p.firstName} {p.lastName}
                  </div>
                </div>
              </Link>
            ))}

            {/* empty seats */}
            {Array.from({ length: Math.max(0, trip.seats - 1 - participants.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background/30 p-3"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-secondary/60 text-2xl font-light text-muted-foreground/60">
                  +
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-muted-foreground">
                    Свободно
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* description */}
        <div className="rounded-[1.75rem] border border-border bg-card p-5 shadow-soft lg:p-6">
          <h3 className="font-display text-lg font-bold tracking-tight">О поездке</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">
            {trip.description}
          </p>
        </div>




        {/* spacer for mobile sticky CTA */}
        <div className="h-2 lg:hidden" />
      </div>

      {/* CTA — sticky on mobile, inline on desktop */}
      <div className="sticky bottom-20 z-20 mx-auto w-full max-w-[1300px] px-5 pb-4 lg:static lg:bottom-auto lg:pb-10">
        <div className="rounded-2xl border border-border bg-card/90 p-2 shadow-lift backdrop-blur lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
          <button
            disabled={joinMutation.isPending || openTripChatMutation.isPending}
            onClick={() => {
              if (!getToken()) {
                navigate({ to: "/auth" });
                return;
              }
              if (isMember) {
                openTripChatMutation.mutate();
              } else {
                joinMutation.mutate();
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-hero)] py-3.5 text-base font-bold text-primary-foreground shadow-[var(--shadow-lift)] transition active:scale-[0.99] hover:opacity-95"
          >
            {joinMutation.isPending || openTripChatMutation.isPending ? (
              "Подождите..."
            ) : isMember ? (
              <>
                <MessageCircle className="h-4 w-4" strokeWidth={2.5} />
                Открыть чат поездки
              </>
            ) : (
              <>Хочу поехать!</>
            )}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  tint,
  label,
  value,
}: {
  icon: typeof Calendar;
  tint: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 shadow-soft">
      <div className="flex items-center gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${tint}`}>
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-0.5 text-sm font-bold text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
}
