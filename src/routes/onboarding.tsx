import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Compass, Users, MessageCircle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Добро пожаловать — Waymate" }] }),
  component: Onboarding,
});

const slides = [
  { icon: Compass, title: "Открой дорогу", text: "Поезд, машина, автобус или самолёт — найди поездку под себя." },
  { icon: Users, title: "Поезжай вместе", text: "Знакомься с попутчиками заранее и едь компанией." },
  { icon: MessageCircle, title: "Будь на связи", text: "Группой чат поездки и личные сообщения в одном месте." },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("waymate.onboarded")) {
      navigate({ to: "/" });
    }
  }, [navigate]);

  const done = () => {
    if (typeof window !== "undefined") localStorage.setItem("waymate.onboarded", "1");
    navigate({ to: "/" });
  };

  const S = slides[step];
  const Icon = S.icon;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-hero text-primary-foreground">
      <div className="flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"><Compass className="h-5 w-5" /></span>
          <span className="font-display text-xl font-semibold">waymate</span>
        </div>
        <button onClick={done} className="text-sm opacity-90 hover:opacity-100">Пропустить</button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="grid h-28 w-28 place-items-center rounded-[2rem] bg-white/15 backdrop-blur-md">
          <Icon className="h-12 w-12" />
        </div>
        <h1 className="mt-8 font-display text-4xl font-semibold leading-tight">{S.title}</h1>
        <p className="mt-3 max-w-sm text-base opacity-90">{S.text}</p>

        <div className="mt-8 flex items-center gap-2">
          {slides.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-white" : "w-2 bg-white/40"}`} />
          ))}
        </div>
      </div>

      <div className="space-y-3 px-6 pb-10">
        <button
          onClick={() => (step < slides.length - 1 ? setStep(step + 1) : done())}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-base font-semibold text-primary shadow-soft"
        >
          {step < slides.length - 1 ? "Дальше" : "Начать"} <ArrowRight className="h-4 w-4" />
        </button>
        <Link to="/auth" className="block text-center text-sm opacity-90 underline-offset-4 hover:underline">
          У меня уже есть аккаунт
        </Link>
      </div>
    </div>
  );
}
