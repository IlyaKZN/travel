import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Compass, Send } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Вход — Waymate" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authMutation = useMutation({
    mutationFn: () =>
      mode === "login"
        ? api.login({ email, password, remember })
        : api.register({ firstName: nickname || email.split("@")[0], lastName: "", email, password }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate({ to: "/" });
    },
  });

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden bg-gradient-hero p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15"><Compass className="h-5 w-5" /></span>
          <span className="font-display text-2xl font-semibold">waymate</span>
        </div>
        <div>
          <h1 className="font-display text-5xl font-semibold leading-tight">Открой дорогу,<br />поезжай вместе.</h1>
          <p className="mt-4 max-w-md text-sm opacity-90">Сообщество путешественников. Маршруты, попутчики, чаты — в одном приложении.</p>
        </div>
        <p className="text-xs opacity-70">© 2026 Waymate</p>
      </div>

      <div className="flex min-h-screen flex-col px-6 py-10 lg:min-h-0 lg:justify-center lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Compass className="h-5 w-5" /></span>
            <span className="font-display text-xl font-semibold">waymate</span>
          </div>

          <h2 className="font-display text-3xl font-semibold">
            {mode === "login" ? "С возвращением" : "Создать аккаунт"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Войди, чтобы продолжить путешествие." : "Регистрация займёт минуту."}
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              authMutation.mutate();
            }}
            className="mt-8 space-y-3"
          >
            {mode === "register" && (
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Никнейм" className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email или телефон" className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Пароль (мин. 6 символов)" className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary" />

            {mode === "login" && (
              <div className="flex items-center justify-between text-xs">
                <label className="inline-flex items-center gap-2 text-muted-foreground">
                  <input checked={remember} onChange={(e) => setRemember(e.target.checked)} type="checkbox" className="accent-[color:var(--clay)]" /> Запомнить меня
                </label>
                <button type="button" className="text-primary hover:underline">Забыли пароль?</button>
              </div>
            )}

            <button disabled={authMutation.isPending || !email || !password} className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {authMutation.isPending ? "Подождите..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
            </button>
            {authMutation.isError && (
              <p className="text-center text-xs text-destructive">{authMutation.error.message}</p>
            )}
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> или <div className="h-px flex-1 bg-border" />
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-medium transition hover:bg-secondary">
            <Send className="h-4 w-4 text-[color:var(--clay)]" /> Войти через Telegram
          </button>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {mode === "login" ? "Нет аккаунта? " : "Уже есть аккаунт? "}
            {mode === "login" ? (
              <Link to="/register" className="font-semibold text-primary hover:underline">Регистрация</Link>
            ) : (
              <button onClick={() => setMode("login")} className="font-semibold text-primary hover:underline">Войти</button>
            )}
          </p>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/onboarding" className="hover:underline">Посмотреть онбординг</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
