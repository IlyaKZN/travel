import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Camera, Check, Eye, EyeOff, Lock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api, getToken } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Редактирование профиля — Waymate" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: api.me,
    enabled: Boolean(getToken()),
    retry: false,
  });
  const u = meQuery.data;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");


  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const pwdMismatch = confirmPwd.length > 0 && newPwd !== confirmPwd;
  const profileMutation = useMutation({
    mutationFn: () => api.updateMe({ firstName, lastName, bio, location, email, phone, age }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
  const passwordMutation = useMutation({
    mutationFn: () => api.changePassword({ currentPassword: currentPwd, newPassword: newPwd }),
    onSuccess: () => {
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    },
  });

  useEffect(() => {
    if (!u) return;
    setFirstName(u.firstName);
    setLastName(u.lastName);
    setBio(u.bio);
    setLocation(u.location);
    setEmail(u.email ?? "");
  }, [u]);

  if (!getToken()) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <h1 className="font-display text-2xl font-semibold">Нужен вход</h1>
          <p className="mt-2 text-sm text-muted-foreground">Настройки доступны после авторизации.</p>
          <Link to="/auth" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Войти
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!u) {
    return <AppShell><div className="p-10 text-center text-muted-foreground">Загружаем настройки...</div></AppShell>;
  }

  return (
    <AppShell>
      {/* hero */}
      <section className="relative overflow-hidden bg-[image:var(--gradient-hero)] text-primary-foreground">
        <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="relative mx-auto flex w-full max-w-[1300px] flex-wrap items-start justify-between gap-4 px-5 pb-6 pt-4 lg:pb-8 lg:pt-5">
          <div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/25"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={2.5} /> Назад
            </Link>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Редактирование профиля
            </h1>
            <p className="mt-1 text-sm text-white/85">
              Обновите личные данные и пароль
            </p>
          </div>
        </div>


      </section>

      <div className="relative z-10 mx-auto mt-6 grid max-w-[820px] gap-5 px-5 pb-16 lg:mt-8 lg:px-10">
        {/* profile */}
        <Section>
          <div className="flex items-center gap-4">
            <div className="relative">
              <span
                className="grid h-20 w-20 place-items-center rounded-full font-display text-2xl font-semibold text-white ring-4 ring-card"
                style={{ background: u.avatarColor }}
              >
                {u.firstName[0]}
              </span>
              <button className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft transition hover:scale-105">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-muted-foreground">
              <div className="font-semibold text-foreground">Фото профиля</div>
              <div>PNG или JPG, до 5 МБ</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Имя">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Field>
            <Field label="Фамилия">
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Field>
            <Field label="Город">
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </Field>
            <Field label="Возраст">
              <Input type="number" min={14} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label="Телефон">
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>

          </div>

          <Field label="О себе">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={200}
              className="w-full resize-none rounded-3xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:bg-card"
            />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">
              {bio.length}/200
            </div>
          </Field>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => profileMutation.mutate()}
              disabled={profileMutation.isPending}
              className="rounded-full bg-[image:var(--gradient-hero)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-lift)] transition hover:opacity-95 disabled:opacity-50"
            >
              {profileMutation.isPending ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
          {profileMutation.isError && <p className="text-right text-xs text-destructive">{profileMutation.error.message}</p>}
        </Section>

        {/* password */}
        <Section>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">Сменить пароль</h2>
              <p className="text-xs text-muted-foreground">Минимум 6 символов</p>
            </div>
          </div>

          <Field label="Текущий пароль">
            <PasswordInput
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              show={showPwd}
              onToggle={() => setShowPwd((v) => !v)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Новый пароль">
              <PasswordInput
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                show={showPwd}
                onToggle={() => setShowPwd((v) => !v)}
              />
            </Field>
            <Field label="Повторите пароль">
              <PasswordInput
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                show={showPwd}
                onToggle={() => setShowPwd((v) => !v)}
              />
              {pwdMismatch && (
                <p className="mt-1.5 px-1 text-xs text-destructive">Пароли не совпадают</p>
              )}
            </Field>
          </div>

          <div className="flex justify-end pt-2">
            <button
              disabled={pwdMismatch || !newPwd || !currentPwd}
              onClick={() => passwordMutation.mutate()}
              className="rounded-full bg-[image:var(--gradient-hero)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-lift)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {passwordMutation.isPending ? "Сохраняем..." : "Сохранить"}
            </button>
          </div>
          {passwordMutation.isError && <p className="text-right text-xs text-destructive">{passwordMutation.error.message}</p>}
          {passwordMutation.isSuccess && <p className="text-right text-xs text-emerald-600">Пароль обновлён</p>}
        </Section>

      </div>
    </AppShell>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft lg:p-7">
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-full border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:bg-card ${className}`}
    />
  );
}

function PasswordInput({
  show,
  onToggle,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        {...props}
        className="w-full rounded-full border border-border bg-secondary/40 px-4 py-3 pr-11 text-sm text-foreground outline-none transition focus:border-primary focus:bg-card"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
