import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, MapPin, MessageCircle, Send, Flag, Car, Train, Bus, Plane } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { api, getToken, transportLabel, type TransportType } from "@/lib/api";
import { TripAvatar } from "@/components/trip-avatar";
import { formatDate } from "@/lib/format";

const transportMeta: Record<TransportType, { icon: typeof Car; tint: string }> = {
  car: { icon: Car, tint: "bg-orange-50 text-orange-700" },
  train: { icon: Train, tint: "bg-amber-50 text-amber-700" },
  bus: { icon: Bus, tint: "bg-rose-50 text-rose-700" },
  plane: { icon: Plane, tint: "bg-yellow-50 text-yellow-800" },
};

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Профиль — Waymate" }] }),
  component: () => <ProfileView owner />,
});

export function ProfileView({ userId, owner }: { userId?: string; owner?: boolean }) {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
    enabled: Boolean(getToken()),
    retry: false,
  });
  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => api.user(userId!),
    enabled: Boolean(userId) && !owner,
  });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: api.users });
  const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: api.trips });
  const u = owner ? meQuery.data : userQuery.data;
  const reviewsQuery = useQuery({
    queryKey: ["reviews", u?.id],
    queryFn: () => api.reviews(u!.id),
    enabled: Boolean(u?.id),
  });
  const [reviewText, setReviewText] = useState("");
  const [showAllTrips, setShowAllTrips] = useState(false);
  const reviewMutation = useMutation({
    mutationFn: () => api.createReview(u!.id, reviewText.trim()),
    onSuccess: async () => {
      setReviewText("");
      await queryClient.invalidateQueries({ queryKey: ["reviews", u?.id] });
    },
  });

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim() || !u) return;
    reviewMutation.mutate();
  };

  if (owner && !getToken()) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold">Войдите в профиль</h1>
          <p className="mt-2 text-sm text-muted-foreground">Профиль, настройки и чаты доступны после входа.</p>
          <Link to="/auth" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Войти
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!u) {
    return (
      <AppShell>
        <div className="p-10 text-center text-muted-foreground">Загружаем профиль...</div>
      </AppShell>
    );
  }

  const pastTrips = (tripsQuery.data ?? []).filter((trip) =>
    trip.participantIds.includes(u.id) && new Date(trip.startAt) < new Date()
  );
  const users = usersQuery.data ?? [];
  const reviews = reviewsQuery.data ?? [];

  return (
    <AppShell>
      {/* cover */}
      <div className="relative h-44 bg-gradient-hero lg:h-56">
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4), transparent 50%)" }} />
      </div>

      <div className="relative z-10 mx-auto -mt-16 max-w-[1300px] px-5 pb-10 lg:-mt-20 lg:px-10">
        <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft lg:p-7">
          <div className="grid grid-cols-[auto_1fr_auto] items-start gap-4 sm:flex sm:items-start sm:gap-5">
            <span
              className="grid h-20 w-20 shrink-0 place-items-center rounded-full ring-4 ring-card font-display text-2xl font-semibold text-white lg:h-24 lg:w-24"
              style={{ background: u.avatarColor }}
            >
              {u.firstName[0]}
            </span>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-semibold sm:text-3xl">{u.firstName} {u.lastName}</h1>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {u.location}</span>
              </div>
            </div>
            {owner ? (
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Link to="/settings" className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs font-medium hover:bg-secondary/70">
                  <Edit3 className="h-3.5 w-3.5" /> Редактировать
                </Link>
              </div>
            ) : (
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <Link
                  to={getToken() ? "/chats" : "/auth"}
                  className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-hero)] px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-lift)] hover:opacity-95"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Написать
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary/70"
                >
                  <Flag className="h-3.5 w-3.5" /> Пожаловаться
                </button>
              </div>
            )}
          </div>


          <p className="mt-5 text-sm leading-relaxed text-foreground/80">{u.bio}</p>

        </div>

        {/* past trips */}
        <section className="mt-6">
          <h2 className="px-1 font-display text-xl font-semibold">Прошлые поездки</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(showAllTrips ? pastTrips : pastTrips.slice(0, 4)).map((t) => {
              const meta = transportMeta[t.transport];
              const TIcon = meta.icon;
              return (
              <div key={t.id} className="flex items-center gap-3 rounded-3xl border border-border/70 bg-card p-4 shadow-soft">
                <TripAvatar from={t.from} to={t.to} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${meta.tint}`}>
                      <TIcon className="h-3.5 w-3.5" />
                    </span>
                    <span>{transportLabel[t.transport]}</span>
                  </div>
                  <h3 className="truncate text-sm font-semibold">{t.from} → {t.to}</h3>
                  <p className="text-xs text-muted-foreground">{formatDate(t.startAt)}</p>
                </div>
              </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAllTrips((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium hover:bg-secondary/70"
            >
              {showAllTrips ? "Свернуть" : `Показать все (${pastTrips.length})`}
            </button>
          </div>
        </section>


        {/* reviews */}
        <section className="mt-6">
          <h2 className="px-1 font-display text-xl font-semibold">Отзывы попутчиков</h2>

          {!owner && (
            <form
              onSubmit={submitReview}
              className="mt-3 rounded-3xl border border-border/70 bg-card p-5 shadow-soft"
            >
              <h3 className="font-display text-base font-semibold">Оставить отзыв</h3>
              <p className="text-xs text-muted-foreground">Поделись впечатлением о поездке с {u.firstName}</p>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Как прошла поездка? Что понравилось?"
                rows={3}
                className="mt-4 w-full resize-none rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={!reviewText.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-hero)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-lift)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" /> Отправить
                </button>
              </div>
            </form>
          )}

          <div className="mt-3 space-y-3">
            {reviews.map((r) => {
              const a = users.find((user) => user.id === r.authorId) ?? meQuery.data ?? u;
              return (
                <div key={r.id} className="rounded-3xl border border-border/70 bg-card p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full font-semibold text-white" style={{ background: a.avatarColor }}>
                      {a.firstName[0]}
                    </span>
                    <div className="text-sm font-semibold">{a.firstName} {a.lastName}</div>
                  </div>
                  <p className="mt-3 text-sm text-foreground/80">{r.text}</p>
                </div>
              );
            })}
            {reviews.length === 0 && (
              <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Отзывов пока нет.
              </div>
            )}
          </div>
        </section>

      </div>
    </AppShell>
  );
}
