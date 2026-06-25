import { tripAvatarColors, tripInitials } from "@/lib/format";

export function TripAvatar({
  from, to, size = 56,
}: { from: string; to: string; size?: number }) {
  const { bg, fg } = tripAvatarColors(from, to);
  return (
    <div
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-full font-display font-semibold"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${fg})`, color: "white", fontSize: size * 0.36 }}
    >
      {tripInitials(from, to)}
    </div>
  );
}
