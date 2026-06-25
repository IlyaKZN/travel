import { Link } from "@tanstack/react-router";
import { ArrowRight, Car, Train, Bus, Plane } from "lucide-react";
import type { Trip, TransportType } from "@/lib/api";
import { formatDate, formatTime, formatBudget } from "@/lib/format";

const transportMeta: Record<
  TransportType,
  { icon: typeof Car; tint: string; ring: string }
> = {
  car: { icon: Car, tint: "bg-orange-50 text-orange-700", ring: "ring-orange-100" },
  train: { icon: Train, tint: "bg-amber-50 text-amber-700", ring: "ring-amber-100" },
  bus: { icon: Bus, tint: "bg-rose-50 text-rose-700", ring: "ring-rose-100" },
  plane: { icon: Plane, tint: "bg-yellow-50 text-yellow-800", ring: "ring-yellow-100" },
};

export function TripCard({ trip }: { trip: Trip }) {
  const meta = transportMeta[trip.transport];
  const Icon = meta.icon;
  const organizer = trip.organizer ?? trip.participants?.find((user) => user.id === trip.organizerId);
  const seatsLeft = Math.max(0, trip.seats - trip.taken);
  const seatsFresh = seatsLeft >= 2;

  return (
    <Link
      to="/trip/$tripId"
      params={{ tripId: trip.id }}
      className="group block rounded-[1.75rem] border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift lg:p-6"
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-lg font-bold tracking-tight text-foreground lg:text-xl">
              {trip.from}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40" strokeWidth={2.5} />
            <span className="truncate text-lg font-bold tracking-tight text-foreground lg:text-xl">
              {trip.to}
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {formatDate(trip.startAt)} · {formatTime(trip.startAt)}
          </p>
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 ${meta.tint}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <div
            className="grid shrink-0 place-items-center rounded-full text-sm font-bold text-white ring-4 ring-background"
            style={{ backgroundColor: organizer?.avatarColor ?? "#94a3b8", height: "2.5rem", width: "2.5rem" }}
          >
            {organizer?.firstName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">
              {organizer?.firstName} {organizer?.lastName}
            </p>
            <p className="truncate text-xs font-medium text-muted-foreground">Организатор</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="rounded-full bg-secondary px-3 py-1.5">
            <span className="whitespace-nowrap text-[11px] font-bold tracking-wide text-foreground">
              ≈ {formatBudget(trip.budget)}
            </span>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
              seatsFresh ? "bg-orange-50" : "bg-secondary"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                seatsFresh ? "animate-pulse bg-[oklch(0.62_0.17_38)]" : "bg-muted-foreground/40"
              }`}
            />
            <span
              className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-wider ${
                seatsFresh ? "text-[oklch(0.45_0.17_35)]" : "text-muted-foreground"
              }`}
            >
              {seatsLeft} {seatsLeft === 1 ? "место" : "места"}
            </span>
          </div>
        </div>

      </div>

    </Link>
  );
}

