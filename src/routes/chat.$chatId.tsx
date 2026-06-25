import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api, getToken } from "@/lib/api";
import { TripAvatar } from "@/components/trip-avatar";
import { formatTime, formatDay } from "@/lib/format";

export const Route = createFileRoute("/chat/$chatId")({
  head: () => ({ meta: [{ title: "Чат — Waymate" }] }),
  component: ChatRoom,
});

function ChatRoom() {
  const { chatId } = Route.useParams();
  const queryClient = useQueryClient();
  const chatQuery = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => api.chat(chatId),
    enabled: Boolean(getToken()),
    retry: false,
  });
  const messagesQuery = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => api.messages(chatId),
    enabled: Boolean(getToken()),
    retry: false,
  });
  const tripsQuery = useQuery({ queryKey: ["trips"], queryFn: api.trips });
  const usersQuery = useQuery({ queryKey: ["users"], queryFn: api.users });
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
    enabled: Boolean(getToken()),
    retry: false,
  });
  const chat = chatQuery.data;
  const trip = chat?.tripId ? tripsQuery.data?.find((t) => t.id === chat.tripId) : null;
  const other = chat?.otherUser;
  const list = messagesQuery.data ?? [];
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const sendMutation = useMutation({
    mutationFn: (message: string) => api.sendMessage(chatId, message),
    onSuccess: async () => {
      setText("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["messages", chatId] }),
        queryClient.invalidateQueries({ queryKey: ["chats"] }),
        queryClient.invalidateQueries({ queryKey: ["chat", chatId] }),
      ]);
    },
  });

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [list.length]);

  if (!getToken()) {
    return <AppShell><div className="p-10 text-center text-muted-foreground">Войдите, чтобы открыть чат.</div></AppShell>;
  }

  if (chatQuery.isLoading || messagesQuery.isLoading) {
    return <AppShell><div className="p-10 text-center text-muted-foreground">Загружаем чат...</div></AppShell>;
  }

  if (!chat) return <AppShell><div className="p-10 text-center text-muted-foreground">Чат не найден</div></AppShell>;

  const send = () => {
    const t = text.trim();
    if (!t) return;
    sendMutation.mutate(t);
  };

  // group by date
  const groups: { day: string; items: typeof list }[] = [];
  for (const m of list) {
    const day = formatDay(m.at);
    const g = groups[groups.length - 1];
    if (g && g.day === day) g.items.push(m); else groups.push({ day, items: [m] });
  }

  return (
    <AppShell>
      {/* hero header matching app gradient */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="relative mx-auto max-w-[1300px] px-5 pb-6 pt-6 lg:px-10 lg:pb-8 lg:pt-8">
          <div className="flex items-center gap-4">
            <Link to="/chats" className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/25">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {trip ? (
              <TripAvatar from={trip.from} to={trip.to} size={56} />
            ) : (
              <span className="grid h-14 w-14 place-items-center rounded-full font-display text-lg font-semibold text-white ring-2 ring-white/30" style={{ background: other?.avatarColor }}>
                {other?.firstName[0]}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-xl font-bold text-white lg:text-2xl">{chat.title}</h1>
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-white/80">
                {chat.kind === "group" ? (
                  <><Users className="h-3.5 w-3.5" /> {chat.participantIds.length} участников</>
                ) : "в сети недавно"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1300px] px-5 py-6 lg:px-10 lg:py-8">
        <div className="flex h-[calc(100vh-19rem)] min-h-[420px] flex-col overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-soft">
          {/* messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 lg:px-8">
            {groups.map((g) => (
              <div key={g.day} className="space-y-3">
                <div className="mx-auto w-fit rounded-full bg-secondary/70 px-3 py-1 text-[11px] font-medium text-muted-foreground">{g.day}</div>
                {g.items.map((m) => {
                  const mine = m.authorId === meQuery.data?.id;
                  const author = usersQuery.data?.find((u) => u.id === m.authorId) ?? meQuery.data;
                  return (
                    <div key={m.id} className={`flex items-end gap-2 ${mine ? "justify-end" : ""}`}>
                      {!mine && (
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold text-white" style={{ background: author?.avatarColor ?? "#94a3b8" }}>
                          {author?.firstName[0] ?? "?"}
                        </span>
                      )}
                      <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-soft ${mine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary/60 text-foreground rounded-bl-md"}`}>
                        {!mine && <div className="mb-0.5 text-[11px] font-semibold text-primary">{author?.firstName}</div>}
                        <p className="whitespace-pre-wrap leading-snug">{m.text}</p>
                        <div className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/75" : "text-muted-foreground"}`}>{formatTime(m.at)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* composer */}
          <div className="border-t border-border/60 bg-card px-4 py-4 lg:px-6">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
              <input
                value={text} onChange={(e) => setText(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 rounded-full border border-border bg-secondary/40 px-5 py-3 text-sm outline-none transition focus:border-primary focus:bg-background"
              />
              <button disabled={sendMutation.isPending} type="submit" className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
