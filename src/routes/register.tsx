import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Compass, Eye, EyeOff, Check, User, Mail, Lock } from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Регистрация — Waymate" }] }),
  component: RegisterPage,
});



function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showPwd, setShowPwd] = useState(false);
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const pwdStrength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-ZА-Я]/.test(p) && /[a-zа-я]/.test(p)) s++;
    if (/\d/.test(p) || /[^a-zA-Zа-яА-Я0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["Слишком короткий", "Слабый", "Нормальный", "Хороший", "Сильный"][pwdStrength];
  const strengthColor = ["bg-border", "bg-destructive", "bg-amber-400", "bg-emerald-400", "bg-emerald-500"][pwdStrength];

  const isEmailOrPhone = (v: string) => {
    const s = v.trim();
    return /.+@.+\..+/.test(s) || /^\+?[\d\s\-()]{10,}$/.test(s);
  };

  const valid =
    form.firstName.trim().length >= 2 &&
    isEmailOrPhone(form.email) &&
    form.password.length >= 6 &&
    form.password === form.confirm &&
    agree;

  const registerMutation = useMutation({
    mutationFn: () => api.register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      navigate({ to: "/" });
    },
  });


  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* left visual */}
      <div className="hidden bg-gradient-hero p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><Compass className="h-5 w-5" /></span>
          <span className="font-display text-2xl font-semibold">waymate</span>
        </div>
        <div>
          <h1 className="font-display text-5xl font-semibold leading-tight">Присоединяйся к<br />сообществу путешественников.</h1>
          <p className="mt-4 max-w-md text-sm opacity-90">Найди попутчиков, дели расходы и открывай новые маршруты вместе.</p>
          <ul className="mt-8 space-y-3 text-sm opacity-95">
            {["Создавай поездки и собирай команду", "Общайся в чатах поездок", "Безопасный профиль и отзывы"].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-white/20"><Check className="h-3.5 w-3.5" /></span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs opacity-70">© 2026 Waymate</p>
      </div>

      {/* right form */}
      <div className="flex min-h-screen flex-col px-6 py-10 lg:min-h-0 lg:justify-center lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground"><Compass className="h-5 w-5" /></span>
            <span className="font-display text-xl font-semibold">waymate</span>
          </div>

          <h2 className="font-display text-3xl font-semibold">Создать аккаунт</h2>
          <p className="mt-1 text-sm text-muted-foreground">Регистрация займёт меньше минуты.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (valid) registerMutation.mutate();
            }}
            className="mt-7 space-y-4"
          >
            <Field icon={<User className="h-4 w-4" />} placeholder="Имя" value={form.firstName} onChange={set("firstName")} required />
            <Field icon={<User className="h-4 w-4" />} placeholder="Фамилия" value={form.lastName} onChange={set("lastName")} />

            
            <Field icon={<Mail className="h-4 w-4" />} type="text" inputMode="email" autoComplete="email" placeholder="Email или телефон" value={form.email} onChange={set("email")} required />



            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><Lock className="h-4 w-4" /></span>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Пароль (мин. 6 символов)"
                value={form.password}
                onChange={set("password")}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-primary"
                required
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-secondary">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {form.password.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="flex h-1.5 flex-1 gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`flex-1 rounded-full ${i < pwdStrength ? strengthColor : "bg-border"}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{strengthLabel}</span>
              </div>
            )}

            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"><Lock className="h-4 w-4" /></span>
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Повторите пароль"
                value={form.confirm}
                onChange={set("confirm")}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 pl-10 text-sm outline-none transition focus:border-primary"
                required
              />
              {form.confirm.length > 0 && form.confirm !== form.password && (
                <p className="mt-1.5 px-1 text-xs text-destructive">Пароли не совпадают</p>
              )}
            </div>

            <label className="flex items-start gap-3 pt-1 text-xs text-muted-foreground">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[color:var(--clay)]" />
              <span>
                Я принимаю <a className="text-primary hover:underline" href="#">условия использования</a> и <a className="text-primary hover:underline" href="#">политику конфиденциальности</a>.
              </span>
            </label>

            <button
              disabled={!valid || registerMutation.isPending}
              className="w-full rounded-full bg-[image:var(--gradient-hero)] py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {registerMutation.isPending ? "Создаём..." : "Создать аккаунт"}
            </button>
            {registerMutation.isError && (
              <p className="text-center text-xs text-destructive">{registerMutation.error.message}</p>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{" "}
            <Link to="/auth" className="font-semibold text-primary hover:underline">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 pl-10 text-sm outline-none transition focus:border-primary"
      />
    </div>
  );
}
