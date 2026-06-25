import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api, getToken, transportLabel, type TransportType } from "@/lib/api";

export const Route = createFileRoute("/create")({
  head: () => ({ meta: [{ title: "Создать поездку — Waymate" }] }),
  component: CreatePage,
});

function CreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [transport, setTransport] = useState<TransportType>("car");
  const [seats, setSeats] = useState(4);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState<string>("");

  const swap = () => { setFrom(to); setTo(from); };
  const createMutation = useMutation({
    mutationFn: api.createTrip,
    onSuccess: async (trip) => {
      await queryClient.invalidateQueries({ queryKey: ["trips"] });
      navigate({ to: "/trip/$tripId", params: { tripId: trip.id } });
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!getToken()) {
      navigate({ to: "/auth" });
      return;
    }
    createMutation.mutate({
      from,
      to,
      startAt: new Date(`${startDate}T${startTime || "00:00"}`).toISOString(),
      endAt: new Date(`${endDate || startDate}T${endTime || startTime || "00:00"}`).toISOString(),
      transport,
      seats,
      budget: Number(budget) || 0,
      description: description.trim() || `${from} → ${to}`,
      info: description.trim(),
    });
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-2xl px-4 py-5 lg:py-8">
        <div className="rounded-[2rem] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)] sm:p-6 lg:p-7">
          {/* header */}
          <header className="mb-5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
              Создание поездки
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Заполните детали вашего маршрута
            </p>
          </header>


          <form
            onSubmit={submit}
            className="space-y-5"
          >
            {/* route — timeline with two minimal underline inputs */}
            <section className="flex items-stretch gap-3">
              <div className="flex flex-col items-center self-stretch py-4">
                <div className="h-2 w-2 shrink-0 rounded-full border-2 border-primary bg-card" />
                <div className="my-1 w-px flex-1 bg-border" />
                <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div>
                  <Label>Откуда</Label>
                  <input
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Город выезда"
                    className="w-full border-b-2 border-border bg-transparent py-1.5 text-base font-medium text-foreground outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-foreground"
                  />
                </div>
                <div>
                  <Label>Куда</Label>
                  <input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Город прибытия"
                    className="w-full border-b-2 border-border bg-transparent py-1.5 text-base font-medium text-foreground outline-none transition-colors placeholder:font-normal placeholder:text-muted-foreground/70 focus:border-foreground"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={swap}
                aria-label="Поменять местами"
                className="my-auto grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70 hover:text-foreground"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>

            </section>

            {/* dates */}
            <section className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              <div>
                <Label>Начало</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <SoftInput type="date" value={startDate} onChange={(v) => setStartDate(v)} />
                  <SoftInput type="time" value={startTime} onChange={(v) => setStartTime(v)} />
                </div>
              </div>
              <div>
                <Label>Окончание</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <SoftInput type="date" value={endDate} onChange={(v) => setEndDate(v)} />
                  <SoftInput type="time" value={endTime} onChange={(v) => setEndTime(v)} />
                </div>
              </div>
            </section>

            {/* transport + seats */}
            <section className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
              <div>
                <Label>Транспорт</Label>
                <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                  {(["car","train","bus","plane"] as TransportType[]).map((t) => {
                    const active = transport === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTransport(t)}
                        className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-secondary text-foreground/80 hover:bg-secondary/40 hover:text-foreground"
                        }`}

                      >
                        {transportLabel[t]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="flex items-end justify-between">
                  <Label>Свободных мест</Label>
                  <span className="text-sm font-semibold text-primary">{seats}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={seats}
                  onChange={(e) => setSeats(+e.target.value)}
                  className="mt-2.5 w-full accent-[color:var(--primary)]"
                />
                <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground">
                  <span>1</span><span>10</span>
                </div>
              </div>
            </section>

            {/* budget */}
            <section>
              <Label>Бюджет с человека</Label>
              <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 transition-colors focus-within:border-foreground/40 focus-within:bg-card">
                <span className="font-semibold text-foreground/70">₽</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="800"
                  className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/70"
                />
                <button
                  type="button"
                  onClick={() => setBudget("0")}
                  className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground/80 hover:text-foreground"
                >
                  Бесплатно
                </button>
              </div>

            </section>

            {/* description */}
            <section>
              <Label>Комментарий к поездке</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Где встречаемся, багаж, музыка…"
                className="mt-1.5 w-full resize-none rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/40 focus:bg-card"
              />
            </section>

            {/* action */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={createMutation.isPending || !from.trim() || !to.trim() || !startDate}
                className="w-full rounded-xl bg-[image:var(--gradient-hero)] py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-lift)] transition active:scale-[0.99] hover:opacity-95"
              >
                {createMutation.isPending ? "Публикуем..." : "Опубликовать поездку"}
              </button>
              {createMutation.isError && (
                <p className="mt-3 text-center text-xs text-destructive">
                  {createMutation.error.message}
                </p>
              )}
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                Нажимая кнопку, вы соглашаетесь с правилами сервиса Waymate
              </p>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-foreground">
      {children}
    </label>
  );
}

function SoftInput({
  type, value, onChange,
}: { type: "date" | "time"; value: string; onChange: (v: string) => void }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-secondary/40 px-2.5 py-2 text-sm font-medium text-foreground outline-none transition-colors focus:border-foreground/40 focus:bg-card"
    />
  );
}
