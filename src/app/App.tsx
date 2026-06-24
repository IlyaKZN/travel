import { useState, useEffect, useRef } from "react";
import {
  MapPin, ArrowRight, Car, Train, Bus, Plane,
  Calendar, Clock, Users, Star, Heart,
  ChevronLeft, ChevronRight, Search, Bell, Check, Send,
  Home, Compass, Plus, User, MessageSquare,
  Navigation, Shield, ArrowUpDown, Camera, Settings,
  Sparkles, Zap, X, Filter,
  TrendingUp, Globe,
} from "lucide-react";
import { TRIPS, MESSAGES, type Trip, type Message } from "../lib/mockData";
import {
  transportLabel,
  seatsLeftLabel,
  TRANSPORT_FILTERS,
  TRANSPORT_FORM_OPTIONS,
  DESKTOP_TRANSPORT_FILTERS,
  formatTime,
  openSeatsLabel,
} from "../lib/locale";

// ─── Types ───────────────────────────────────────────────────────────────────

type Screen = "onboarding" | "home" | "explore" | "detail" | "create" | "request" | "chat" | "profile";
type Tab = "home" | "explore" | "create" | "chat" | "profile";
type TransportType = "car" | "train" | "bus" | "plane";
const DESKTOP_BREAKPOINT = 1024;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth >= DESKTOP_BREAKPOINT : true,
  );
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${DESKTOP_BREAKPOINT}px)`);
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function TransportIcon({ type, size = 16 }: { type: string; size?: number }) {
  const props = { size, strokeWidth: 2 };
  if (type === "train") return <Train {...props} />;
  if (type === "bus") return <Bus {...props} />;
  if (type === "plane") return <Plane {...props} />;
  return <Car {...props} />;
}

// ════════════════════════════════════════════════════════════════════════════════
// MOBILE SCREENS
// ════════════════════════════════════════════════════════════════════════════════

function OnboardingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-[1.2] overflow-hidden rounded-b-[2.5rem] bg-orange-200">
        <img src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&h=700&fit=crop" alt="Друзья в дорожном путешествии" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <div className="absolute top-14 left-6 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg">
            <Navigation size={19} className="text-white" />
          </div>
          <span className="text-white font-extrabold text-xl tracking-tight">waymate</span>
        </div>
        <div className="absolute bottom-5 left-4 right-4 bg-white/90 backdrop-blur-md rounded-2xl p-3.5 flex items-center gap-3 shadow-xl">
          <div className="flex -space-x-2">
            {["photo-1494790108377-be9c29b29330", "photo-1507003211169-0a1dd7228f2d", "photo-1534528741775-53994a69daeb"].map((id, i) => (
              <img key={i} src={`https://images.unsplash.com/${id}?w=48&h=48&fit=crop`} className="w-8 h-8 rounded-full border-2 border-white" alt="" />
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800">2 400+ путешественников</p>
            <p className="text-xs text-gray-500">присоединились за неделю</p>
          </div>
          <div className="ml-auto flex items-center gap-1 bg-orange-50 px-2.5 py-1.5 rounded-xl">
            <Star size={13} className="fill-orange-400 text-orange-400" />
            <span className="text-xs font-bold text-gray-800">4.9</span>
          </div>
        </div>
      </div>
      <div className="px-6 pt-7 pb-8 bg-[#FFF8F4]">
        <h1 className="text-[1.65rem] font-extrabold text-gray-900 leading-tight mb-2.5">
          Найдите <span className="text-orange-500">компанию</span> для каждого путешествия
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">Знакомьтесь с попутчиками, делите поездки и превращайте каждую дорогу в яркое воспоминание.</p>
        <div className="space-y-2.5 mb-7">
          {[
            { icon: <Shield size={15} />, text: "Проверенные профили и рейтинги безопасности" },
            { icon: <Zap size={15} />, text: "Присоединяйтесь к поездке в 2 нажатия" },
            { icon: <MessageSquare size={15} />, text: "Групповой чат для каждой поездки" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center flex-shrink-0">{item.icon}</div>
              <span className="text-sm text-gray-700 font-medium">{item.text}</span>
            </div>
          ))}
        </div>
        <button onClick={onStart} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-base active:scale-95 transition-transform" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>
          Начать — бесплатно
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">Уже есть аккаунт? <span className="text-orange-500 font-semibold">Войти</span></p>
      </div>
    </div>
  );
}

function TripCard({ trip, onSelect }: { trip: Trip; onSelect: () => void; horizontal?: boolean }) {
  const [liked, setLiked] = useState(false);
  const seatsLeft = trip.seats - trip.takenSeats;
  return (
    <div onClick={onSelect} className="bg-white rounded-3xl overflow-hidden border border-orange-50 active:scale-[0.98] transition-transform cursor-pointer hover:shadow-md" style={{ boxShadow: "0 2px 16px rgba(249,115,22,0.08)" }}>
      <div className="relative h-36 bg-orange-100">
        <img src={trip.image} alt={`${trip.from} to ${trip.to}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5">
          <span className="text-orange-500"><TransportIcon type={trip.transport} size={13} /></span>
          <span className="text-xs font-bold text-gray-700">{transportLabel(trip.transport)}</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }} className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <Heart size={14} className={liked ? "fill-red-500 text-red-500" : "text-gray-500"} />
        </button>
        <div className={`absolute bottom-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold ${seatsLeft <= 1 ? "bg-red-500" : "bg-orange-500"} text-white`}>
          {seatsLeftLabel(seatsLeft)}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex flex-col items-center">
            <span className="text-base font-extrabold text-gray-900">{trip.fromShort}</span>
            <span className="text-[10px] text-gray-400">{trip.from}</span>
          </div>
          <div className="flex-1 flex items-center gap-1">
            <div className="flex-1 border-t-2 border-dashed border-orange-200" />
            <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center"><ArrowRight size={11} className="text-orange-400" /></div>
            <div className="flex-1 border-t-2 border-dashed border-orange-200" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-extrabold text-gray-900">{trip.toShort}</span>
            <span className="text-[10px] text-gray-400">{trip.to}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5"><Calendar size={12} className="text-orange-400" /><span className="text-xs font-semibold text-gray-600">{trip.date}</span></div>
          <div className="flex items-center gap-1.5"><Clock size={12} className="text-orange-400" /><span className="text-xs font-semibold text-gray-600">{trip.time}</span></div>
        </div>
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {trip.tags.map((tag) => <span key={tag} className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded-lg text-[11px] font-semibold">{tag}</span>)}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={trip.host.avatar} alt={trip.host.name} className="w-7 h-7 rounded-full object-cover" />
            <div>
              <p className="text-xs font-bold text-gray-800">{trip.host.name}</p>
              <div className="flex items-center gap-0.5"><Star size={10} className="fill-orange-400 text-orange-400" /><span className="text-[11px] text-gray-500">{trip.host.rating}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {trip.participants.slice(0, 3).map((p, i) => <img key={i} src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full border-2 border-white object-cover" />)}
            </div>
            <span className="text-[11px] text-gray-400">{trip.takenSeats} едут</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ onTripSelect }: { onTripSelect: (t: Trip) => void }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const filteredTrips = activeFilter === "all" ? TRIPS : TRIPS.filter((t) => { if (activeFilter === "flight") return t.transport === "plane"; return t.transport === activeFilter; });
  return (
    <div className="flex flex-col h-full bg-[#FFF8F4]">
      <div className="px-5 pt-14 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div><p className="text-xs text-gray-400 font-medium">Доброе утро,</p><h1 className="text-xl font-extrabold text-gray-900">Алексей Ч. 👋</h1></div>
          <button className="relative w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-orange-100" style={{ boxShadow: "0 2px 8px rgba(249,115,22,0.1)" }}>
            <Bell size={18} className="text-gray-600" /><div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full" />
          </button>
        </div>
        <div className="flex items-center gap-1 mt-1"><MapPin size={13} className="text-orange-400" /><span className="text-xs text-gray-500 font-medium">Москва</span><ChevronRight size={12} className="text-gray-400" /></div>
      </div>
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <Search size={17} className="text-gray-400" /><span className="text-gray-400 text-sm">Куда хотите поехать?</span>
        </div>
      </div>
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {TRANSPORT_FILTERS.map((f) => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === f.id ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-100"}`} style={activeFilter === f.id ? { boxShadow: "0 4px 12px rgba(249,115,22,0.3)" } : {}}>{f.label}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center justify-between mb-1"><h2 className="text-sm font-extrabold text-gray-900">Ближайшие поездки</h2><button className="text-orange-500 text-xs font-bold">Все</button></div>
        {filteredTrips.length === 0 ? (<div className="flex flex-col items-center py-12 text-gray-400"><Compass size={40} className="mb-3 text-orange-200" /><p className="text-sm font-medium">Поездок по этому фильтру не найдено</p></div>) : (filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} onSelect={() => onTripSelect(trip)} />))}
      </div>
    </div>
  );
}

function TripDetailScreen({ trip, onBack, onJoin }: { trip: Trip; onBack: () => void; onJoin: () => void }) {
  const seatsLeft = trip.seats - trip.takenSeats;
  return (
    <div className="flex flex-col h-full bg-[#FFF8F4]">
      <div className="relative h-60 bg-orange-200 flex-shrink-0">
        <img src={trip.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <button onClick={onBack} className="absolute top-14 left-4 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow"><ChevronLeft size={20} className="text-gray-800" /></button>
        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white text-2xl font-extrabold">{trip.fromShort}</span>
            <div className="flex-1 flex items-center gap-1"><div className="flex-1 border-t-2 border-white/30 border-dashed" /><div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center shadow-lg"><ArrowRight size={14} className="text-white" /></div><div className="flex-1 border-t-2 border-white/30 border-dashed" /></div>
            <span className="text-white text-2xl font-extrabold">{trip.toShort}</span>
          </div>
          <div className="flex justify-between"><span className="text-white/70 text-xs">{trip.from}</span><span className="text-white/70 text-xs">{trip.to}</span></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        <div className="bg-white rounded-t-[2rem] -mt-4 px-5 pt-5 pb-6">
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[
              { icon: <Calendar size={14} className="text-orange-500" />, label: trip.date.split(",")[0]?.trim() ?? trip.date, sub: trip.date.includes(",") ? trip.date.split(",").slice(1).join(",").trim() : "" },
              { icon: <Clock size={14} className="text-orange-500" />, label: trip.time, sub: "Отправление" },
              { icon: <TransportIcon type={trip.transport} size={14} />, label: transportLabel(trip.transport), sub: "Транспорт" },
              { icon: <Users size={14} className="text-orange-500" />, label: `${seatsLeft}`, sub: "Свободно" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1 bg-orange-50 rounded-2xl py-3 px-1">{item.icon}<span className="text-xs font-extrabold text-gray-800 text-center leading-tight">{item.label}</span><span className="text-[9px] text-gray-400 text-center">{item.sub}</span></div>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-5 p-3.5 bg-orange-50 rounded-2xl">
            <img src={trip.host.avatar} alt={trip.host.name} className="w-12 h-12 rounded-2xl object-cover" />
            <div>
              <p className="font-extrabold text-gray-900 text-sm">{trip.host.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5"><Star size={11} className="fill-orange-400 text-orange-400" /><span className="text-sm font-bold text-gray-700">{trip.host.rating}</span><span className="text-xs text-gray-400">· {trip.host.trips} поездок</span></div>
            </div>
            <button className="ml-auto px-3 py-1.5 border border-orange-200 text-orange-500 rounded-xl text-xs font-bold">Профиль</button>
          </div>
          <div className="mb-5"><h3 className="font-extrabold text-gray-900 mb-1.5 text-sm">О поездке</h3><p className="text-sm text-gray-600 leading-relaxed">{trip.description}</p></div>
          <div className="flex gap-2 mb-5 flex-wrap">{trip.tags.map((tag) => <span key={tag} className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold">{tag}</span>)}</div>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3"><h3 className="font-extrabold text-gray-900 text-sm">Участники ({trip.takenSeats + 1})</h3><span className="text-xs text-orange-500 font-bold">{seatsLeft} свободных мест</span></div>
            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex flex-col items-center gap-1"><img src={trip.host.avatar} alt={trip.host.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-orange-400 ring-offset-1" /><span className="text-[10px] text-orange-500 font-bold">Организатор</span></div>
              {trip.participants.map((p, i) => <div key={i} className="flex flex-col items-center gap-1"><img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-2xl object-cover" /><span className="text-[10px] text-gray-500 font-medium">{p.name}</span></div>)}
              {Array.from({ length: Math.min(seatsLeft, 2) }).map((_, i) => <div key={i} className="flex flex-col items-center gap-1"><div className="w-12 h-12 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 flex items-center justify-center"><Plus size={18} className="text-orange-300" /></div><span className="text-[10px] text-gray-400">Свободно</span></div>)}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">{[{ icon: <Shield size={12} />, label: "Проверен" }, { icon: <Star size={12} />, label: "Топ рейтинг" }, { icon: <Check size={12} />, label: "Документы" }].map((b, i) => <div key={i} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold">{b.icon}{b.label}</div>)}</div>
        </div>
      </div>
      <div className="px-5 pb-8 pt-3 bg-white border-t border-orange-50">
        <button onClick={onJoin} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>Запросить участие — бесплатно</button>
        <p className="text-center text-xs text-gray-400 mt-2">Организатор рассмотрит запрос в течение 24 часов</p>
      </div>
    </div>
  );
}

function CreateTripScreen({ onBack }: { onBack: () => void }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [transport, setTransport] = useState<TransportType>("car");
  const [seats, setSeats] = useState(3);
  const [desc, setDesc] = useState("");
  const transports: { type: TransportType; icon: React.ReactNode; label: string }[] = TRANSPORT_FORM_OPTIONS.map((t) => ({
    type: t.type,
    icon: t.type === "car" ? <Car size={20} /> : t.type === "train" ? <Train size={20} /> : t.type === "bus" ? <Bus size={20} /> : <Plane size={20} />,
    label: t.label,
  }));
  return (
    <div className="flex flex-col h-full bg-[#FFF8F4]">
      <div className="flex items-center gap-3 px-5 pt-14 pb-5 bg-[#FFF8F4]">
        <button onClick={onBack} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-orange-50 shadow-sm"><ChevronLeft size={20} className="text-gray-700" /></button>
        <h1 className="text-xl font-extrabold text-gray-900">Спланировать поездку</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-28 space-y-4" style={{ scrollbarWidth: "none" }}>
        <div className="bg-white rounded-3xl p-4 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Маршрут</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-[#FFF8F4] rounded-2xl px-4 py-3"><div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0"><MapPin size={15} className="text-orange-500" /></div><input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Город отправления" className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none font-medium" /></div>
            <div className="flex justify-center -my-0.5 relative z-10"><button className="w-8 h-8 rounded-xl bg-white border border-orange-100 flex items-center justify-center shadow-sm"><ArrowUpDown size={14} className="text-orange-500" /></button></div>
            <div className="flex items-center gap-3 bg-[#FFF8F4] rounded-2xl px-4 py-3"><div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0"><Navigation size={15} className="text-white" /></div><input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Город назначения" className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none font-medium" /></div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Дата и время</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-[#FFF8F4] rounded-2xl px-4 py-3"><Calendar size={15} className="text-orange-400 flex-shrink-0" /><input type="date" className="flex-1 bg-transparent text-xs text-gray-700 outline-none font-medium min-w-0" /></div>
            <div className="flex items-center gap-2 bg-[#FFF8F4] rounded-2xl px-4 py-3"><Clock size={15} className="text-orange-400 flex-shrink-0" /><input type="time" className="flex-1 bg-transparent text-xs text-gray-700 outline-none font-medium min-w-0" /></div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Тип транспорта</p>
          <div className="grid grid-cols-4 gap-2">{transports.map((t) => <button key={t.type} onClick={() => setTransport(t.type)} className={`flex flex-col items-center gap-1.5 py-3.5 rounded-2xl transition-all font-bold text-xs ${transport === t.type ? "bg-orange-500 text-white" : "bg-[#FFF8F4] text-gray-600"}`} style={transport === t.type ? { boxShadow: "0 4px 12px rgba(249,115,22,0.35)" } : {}}>{t.icon}<span>{t.label}</span></button>)}</div>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">Свободные места</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setSeats(Math.max(1, seats - 1))} className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-extrabold text-2xl">−</button>
            <div className="flex-1 text-center"><span className="text-4xl font-extrabold text-gray-900">{seats}</span><p className="text-xs text-gray-400 mt-0.5">мест для попутчиков</p></div>
            <button onClick={() => setSeats(Math.min(8, seats + 1))} className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-extrabold text-2xl" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}>+</button>
          </div>
          <div className="flex gap-1.5 mt-4 justify-center">{Array.from({ length: seats }).map((_, i) => <div key={i} className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center"><User size={14} className="text-orange-400" /></div>)}</div>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Описание</p>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Расскажите об атмосфере поездки, ожиданиях и что взять с собой..." rows={4} className="w-full bg-[#FFF8F4] rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none" />
          <p className="text-right text-xs text-gray-400 mt-1">{desc.length}/280</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-white border-t border-orange-50">
        <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>Создать поездку ✈︎</button>
      </div>
    </div>
  );
}

function RequestScreen({ trip, onBack, onChat }: { trip: Trip; onBack: () => void; onChat: () => void }) {
  const [status, setStatus] = useState<"pending" | "accepted">("pending");
  useEffect(() => { const t = setTimeout(() => setStatus("accepted"), 3000); return () => clearTimeout(t); }, []);
  if (status === "pending") {
    return (
      <div className="flex flex-col h-full bg-[#FFF8F4] items-center justify-center px-6">
        <div className="relative w-24 h-24 mb-7 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-orange-300 animate-ping opacity-30" />
          <div className="absolute inset-3 rounded-full bg-orange-400 animate-ping opacity-25" style={{ animationDelay: "0.3s" }} />
          <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center" style={{ boxShadow: "0 8px 32px rgba(249,115,22,0.45)" }}><Clock size={34} className="text-white" /></div>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Запрос отправлен!</h2>
        <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed max-w-xs">Ваш запрос на участие в поездке <span className="font-bold text-gray-700">{trip.host.name}</span> из <span className="font-bold text-gray-700">{trip.fromShort} → {trip.toShort}</span> ожидает подтверждения.</p>
        <div className="w-full bg-white rounded-3xl p-4 border border-orange-50 mb-8" style={{ boxShadow: "0 2px 16px rgba(249,115,22,0.08)" }}>
          <div className="flex items-center gap-3">
            <img src={trip.host.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" />
            <div><p className="font-extrabold text-gray-900 text-sm">{trip.fromShort} → {trip.toShort}</p><p className="text-xs text-gray-500 mt-0.5">{trip.date} · {trip.time}</p></div>
            <div className="ml-auto px-3 py-1.5 bg-orange-100 text-orange-600 rounded-xl text-xs font-extrabold">Ожидание…</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" /><div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0.15s" }} /><div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
          <span className="ml-1">Ждём ответа организатора</span>
        </div>
        <button onClick={onBack} className="text-gray-400 text-sm font-medium">Назад к поездкам</button>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full bg-[#FFF8F4] items-center justify-center px-6 relative overflow-hidden">
      {["top-16 left-8", "top-24 right-12", "top-32 left-20", "top-12 right-6"].map((pos, i) => <div key={i} className={`absolute ${pos} w-3 h-3 rounded-full opacity-60`} style={{ background: ["#F97316", "#FDBA74", "#FB923C", "#FED7AA"][i] }} />)}
      <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mb-7" style={{ boxShadow: "0 8px 32px rgba(16,185,129,0.4)" }}><Check size={42} className="text-white" strokeWidth={3} /></div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Вы в деле! 🎉</h2>
      <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed max-w-xs"><span className="font-bold text-gray-700">{trip.host.name}</span> подтвердил ваш запрос. Добро пожаловать в команду!</p>
      <div className="w-full bg-white rounded-3xl p-4 border border-emerald-100 mb-6" style={{ boxShadow: "0 2px 16px rgba(16,185,129,0.1)" }}>
        <div className="flex items-center gap-3 mb-3"><img src={trip.host.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" /><div><p className="font-extrabold text-gray-900 text-sm">{trip.fromShort} → {trip.toShort}</p><p className="text-xs text-gray-500 mt-0.5">{trip.date} · {trip.time}</p></div><div className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-xl text-xs font-extrabold"><Check size={11} /> Подтверждено</div></div>
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50"><div className="flex -space-x-2"><img src={trip.host.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />{trip.participants.map((p, i) => <img key={i} src={p.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />)}</div><span className="text-xs text-gray-500 ml-1">{trip.takenSeats + 2} путешественников</span></div>
      </div>
      <button onClick={onChat} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform mb-3" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>Открыть групповой чат 💬</button>
      <button onClick={onBack} className="text-gray-400 text-sm font-medium">Назад к поездкам</button>
    </div>
  );
}

function ChatScreen({ trip, onBack }: { trip: Trip; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, sender: "Я", avatar: "", text: input, time: formatTime(), isMe: true }]);
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };
  return (
    <div className="flex flex-col h-full bg-[#FFF8F4]">
      <div className="flex items-center gap-3 px-4 pt-14 pb-3.5 bg-white border-b border-orange-50 flex-shrink-0" style={{ boxShadow: "0 2px 8px rgba(249,115,22,0.06)" }}>
        <button onClick={onBack} className="w-9 h-9 bg-[#FFF8F4] rounded-xl flex items-center justify-center"><ChevronLeft size={20} className="text-gray-700" /></button>
        <div className="relative flex-shrink-0"><img src={trip.host.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover" /><div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" /></div>
        <div className="flex-1 min-w-0"><p className="font-extrabold text-gray-900 text-sm truncate">{trip.fromShort} → {trip.toShort}</p><p className="text-xs text-gray-400">{trip.takenSeats + 2} участников · {trip.date}</p></div>
        <div className="flex -space-x-2 flex-shrink-0">{[trip.host.avatar, ...trip.participants.slice(0, 2).map((p) => p.avatar)].map((av, i) => <img key={i} src={av} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />)}</div>
      </div>
      <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0"><div className="flex-1 h-px bg-orange-100" /><span className="text-[11px] text-gray-400 font-medium">{trip.date}</span><div className="flex-1 h-px bg-orange-100" /></div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3" style={{ scrollbarWidth: "none" }}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.isMe ? "flex-row-reverse" : ""}`}>
            {!msg.isMe && <img src={msg.avatar} alt="" className="w-7 h-7 rounded-full flex-shrink-0 mb-1 object-cover" />}
            <div className={`max-w-[76%] flex flex-col gap-0.5 ${msg.isMe ? "items-end" : "items-start"}`}>
              {!msg.isMe && <span className="text-[11px] text-gray-400 font-semibold ml-1">{msg.sender}</span>}
              <div className={`px-4 py-2.5 text-sm leading-relaxed font-medium ${msg.isMe ? "bg-orange-500 text-white rounded-2xl rounded-br-sm" : "bg-white text-gray-800 rounded-2xl rounded-bl-sm"}`} style={!msg.isMe ? { boxShadow: "0 1px 6px rgba(0,0,0,0.06)" } : {}}>{msg.text}</div>
              <span className="text-[10px] text-gray-400 mx-1">{msg.time}</span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 pb-8 pt-3 bg-white border-t border-orange-50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0"><Camera size={17} className="text-orange-400" /></button>
          <div className="flex-1 flex items-center gap-2 bg-[#FFF8F4] rounded-2xl px-4 py-2.5"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Сообщение для команды..." className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" /></div>
          <button onClick={sendMessage} className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.4)" }}><Send size={15} className="text-white" /></button>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen() {
  const pastTrips = [
    { from: "МСК", to: "СПБ", date: "14 июн", transport: "car", rating: 5 },
    { from: "Сочи", to: "Москва", date: "28 мая", transport: "train", rating: 5 },
    { from: "МСК", to: "Тула", date: "10 мая", transport: "bus", rating: 4 },
  ];
  const reviews = [
    { name: "Мария К.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", text: "Алексей очень дружелюбный и пунктуальный! Отличная поездка — и музыка супер.", rating: 5, date: "14 июн" },
    { name: "Дмитрий С.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", text: "Отличный попутчик. Уважительный, весёлый — дорога пролетела незаметно.", rating: 5, date: "28 мая" },
  ];
  return (
    <div className="flex flex-col h-full bg-[#FFF8F4]">
      <div className="relative flex-shrink-0">
        <div className="h-36 bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden"><img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=288&fit=crop" alt="Обложка профиля" className="w-full h-full object-cover opacity-50 mix-blend-overlay" /></div>
        <button className="absolute top-12 right-4 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow"><Settings size={17} className="text-gray-700" /></button>
        <div className="absolute bottom-0 left-5 translate-y-1/2"><div className="relative"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop" alt="Алексей Ч." className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-lg" /><div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-400 rounded-lg border-2 border-white flex items-center justify-center"><Check size={10} className="text-white" strokeWidth={3} /></div></div></div>
      </div>
      <div className="pt-14 px-5 pb-4 bg-white flex-shrink-0">
        <div className="flex items-start justify-between">
          <div><h2 className="text-xl font-extrabold text-gray-900">Алексей Ч.</h2><div className="flex items-center gap-1.5 mt-0.5"><MapPin size={12} className="text-orange-400" /><span className="text-xs text-gray-500">Москва · В сообществе с 2023</span></div></div>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-extrabold" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}>Редактировать</button>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">{[{ value: "12", label: "Поездок" }, { value: "4.9", label: "Рейтинг" }, { value: "48", label: "Отзывов" }, { value: "23", label: "Друзей" }].map((stat, i) => <div key={i} className="flex flex-col items-center py-3 bg-orange-50 rounded-2xl"><span className="text-base font-extrabold text-gray-900">{stat.value}</span><span className="text-[10px] text-gray-500 mt-0.5 font-medium">{stat.label}</span></div>)}</div>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">Любитель приключений и выходных поездок 🌍 Всегда готов в дорогу или в новый город. Хозяин собаки 🐕</p>
        <div className="flex gap-2 mt-3 flex-wrap">{["Документы", "Топ рейтинг", "Ранняя пташка", "Автопутешественник"].map((b) => <span key={b} className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg text-[11px] font-bold"><Sparkles size={9} />{b}</span>)}</div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-24" style={{ scrollbarWidth: "none" }}>
        <div className="pt-4 pb-2"><h3 className="font-extrabold text-gray-900 mb-3 text-sm">История поездок</h3><div className="space-y-2">{pastTrips.map((t, i) => <div key={i} className="bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}><div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0"><TransportIcon type={t.transport} size={15} /></div><div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-800 truncate">{t.from} → {t.to}</p><p className="text-xs text-gray-400">{t.date}</p></div><div className="flex items-center gap-0.5 flex-shrink-0">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={11} className="fill-orange-400 text-orange-400" />)}</div></div>)}</div></div>
        <div className="pt-4"><h3 className="font-extrabold text-gray-900 mb-3 text-sm">Отзывы (48)</h3><div className="space-y-3">{reviews.map((r, i) => <div key={i} className="bg-white rounded-2xl p-4 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}><div className="flex items-center gap-2.5 mb-2"><img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover" /><div className="flex-1"><p className="text-sm font-bold text-gray-800">{r.name}</p><p className="text-xs text-gray-400">{r.date}</p></div><div className="flex items-center gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={11} className="fill-orange-400 text-orange-400" />)}</div></div><p className="text-sm text-gray-600 leading-relaxed">{r.text}</p></div>)}</div></div>
      </div>
    </div>
  );
}

function BottomNav({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (t: Tab) => void }) {
  const tabs: { id: Tab; icon: React.ReactNode; label: string | null; isMain?: boolean }[] = [
    { id: "home", icon: <Home size={20} />, label: "Главная" },
    { id: "explore", icon: <Compass size={20} />, label: "Обзор" },
    { id: "create", icon: <Plus size={24} />, label: null, isMain: true },
    { id: "chat", icon: <MessageSquare size={20} />, label: "Чаты" },
    { id: "profile", icon: <User size={20} />, label: "Профиль" },
  ];
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-orange-50 pb-6 pt-2 flex items-center justify-around" style={{ boxShadow: "0 -4px 20px rgba(249,115,22,0.08)" }}>
      {tabs.map((tab) => (
        <button key={tab.id} onClick={() => onTabChange(tab.id)} className="flex flex-col items-center gap-0.5 relative">
          {tab.isMain ? (
            <div className="w-14 h-14 -mt-7 rounded-[1.1rem] bg-orange-500 flex items-center justify-center" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.5)" }}><div className="text-white">{tab.icon}</div></div>
          ) : (
            <><div className={`transition-colors ${activeTab === tab.id ? "text-orange-500" : "text-gray-400"}`}>{tab.icon}</div><span className={`text-[10px] font-bold transition-colors ${activeTab === tab.id ? "text-orange-500" : "text-gray-400"}`}>{tab.label}</span>{activeTab === tab.id && <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full" />}</>
          )}
        </button>
      ))}
    </div>
  );
}

function StatusBar() {
  return (
    <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-6 z-30 pointer-events-none">
      <span className="text-xs font-bold text-gray-800">9:41</span>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-3xl" />
      <div className="flex items-center gap-1.5">
        <div className="flex gap-[2px] items-end h-3.5">{[2, 3, 4, 5, 5].map((h, i) => <div key={i} className={`w-[3px] rounded-sm ${i < 4 ? "bg-gray-800" : "bg-gray-300"}`} style={{ height: `${h * 2.5}px` }} />)}</div>
        <span className="text-[11px] font-bold text-gray-800">5G</span>
        <div className="w-6 h-3.5 rounded-sm border-[1.5px] border-gray-700 flex items-center px-[2px] relative"><div className="w-4 h-2 bg-emerald-500 rounded-[2px]" /><div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[3px] h-2 bg-gray-700 rounded-r-sm" /></div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// DESKTOP COMPONENTS
// ════════════════════════════════════════════════════════════════════════════════

function DesktopNavbar({ activeScreen, onNavigate, onCreateClick }: {
  activeScreen: Screen; onNavigate: (s: Screen) => void; onCreateClick: () => void;
}) {
  return (
    <header className="bg-white border-b border-orange-50 px-6 h-16 flex items-center gap-4 flex-shrink-0 z-40" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center"><Navigation size={17} className="text-white" /></div>
        <span className="text-xl font-extrabold text-gray-900 tracking-tight">waymate</span>
      </div>

      <div className="flex-1 max-w-sm mx-4">
        <div className="flex items-center gap-3 bg-[#FFF8F4] rounded-2xl px-4 py-2.5 border border-orange-100">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input placeholder="Поиск направлений..." className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none min-w-0" />
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-1">
        {([
          { label: "Главная", screen: "home" as Screen, icon: <Home size={16} /> },
          { label: "Обзор", screen: "explore" as Screen, icon: <Compass size={16} /> },
          { label: "Чаты", screen: "chat" as Screen, icon: <MessageSquare size={16} /> },
          { label: "Профиль", screen: "profile" as Screen, icon: <User size={16} /> },
        ]).map((item) => (
          <button key={item.screen} onClick={() => onNavigate(item.screen)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${activeScreen === item.screen ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
            {item.icon}{item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        <button onClick={onCreateClick} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold flex-shrink-0" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}>
          <Plus size={16} />Спланировать поездку
        </button>
        <button className="relative w-9 h-9 bg-[#FFF8F4] rounded-xl flex items-center justify-center border border-orange-100 flex-shrink-0">
          <Bell size={17} className="text-gray-600" /><div className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
        </button>
        <button onClick={() => onNavigate("profile")} className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl transition-all flex-shrink-0 ${activeScreen === "profile" ? "bg-orange-50 border border-orange-100" : "hover:bg-gray-50"}`}>
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" alt="Алексей" className="w-8 h-8 rounded-xl object-cover" />
          <span className="text-sm font-bold text-gray-800 hidden xl:block">Алексей Ч.</span>
        </button>
      </div>
    </header>
  );
}

function DesktopHome({ onTripSelect }: { onTripSelect: (t: Trip) => void; onCreateClick: () => void }) {
  const [selectedTransports, setSelectedTransports] = useState<string[]>([]);
  const [minSeats, setMinSeats] = useState(1);
  const [activeChip, setActiveChip] = useState("all");

  const filteredTrips = TRIPS.filter((t) => {
    if (selectedTransports.length > 0 && !selectedTransports.includes(t.transport)) return false;
    if (t.seats - t.takenSeats < minSeats) return false;
    if (activeChip !== "all") { if (activeChip === "flight") return t.transport === "plane"; return t.transport === activeChip; }
    return true;
  });

  const toggleTransport = (type: string) => setSelectedTransports((prev) => prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-white border-r border-orange-50 overflow-y-auto p-5" style={{ scrollbarWidth: "none" }}>
        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Filter size={11} />Фильтры</h3>

        <div className="mb-5">
          <p className="text-sm font-extrabold text-gray-800 mb-3">Транспорт</p>
          <div className="space-y-1.5">
            {DESKTOP_TRANSPORT_FILTERS.map((t) => (
              <button key={t.type} onClick={() => toggleTransport(t.type)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedTransports.includes(t.type) ? "bg-orange-500 text-white" : "bg-[#FFF8F4] text-gray-600 hover:bg-orange-50"}`}>
                {t.type === "car" ? <Car size={14} /> : t.type === "train" ? <Train size={14} /> : t.type === "bus" ? <Bus size={14} /> : <Plane size={14} />}{t.label}{selectedTransports.includes(t.type) && <Check size={13} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm font-extrabold text-gray-800 mb-1">Мин. мест</p>
          <p className="text-xs text-gray-400 mb-3">{openSeatsLabel(minSeats)}</p>
          <input type="range" min={1} max={6} value={minSeats} onChange={(e) => setMinSeats(Number(e.target.value))} className="w-full accent-orange-500" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>6</span></div>
        </div>

        {(selectedTransports.length > 0 || minSeats > 1) && (
          <button onClick={() => { setSelectedTransports([]); setMinSeats(1); }} className="w-full py-2 text-xs font-bold text-orange-500 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors mb-5">
            Сбросить фильтры
          </button>
        )}

        <div className="pt-4 border-t border-orange-50">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><TrendingUp size={11} />Популярные маршруты</p>
          <div className="space-y-1">
            {[{ from: "МСК", to: "СОЧ", count: 12 }, { from: "СПБ", to: "КРЛ", count: 8 }, { from: "КЗН", to: "НН", count: 6 }, { from: "ЕКБ", to: "АЛТ", count: 4 }].map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600 py-1.5 px-2 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                <span className="font-bold text-gray-800 text-xs">{r.from}</span>
                <ArrowRight size={11} className="text-orange-400" />
                <span className="font-bold text-gray-800 text-xs">{r.to}</span>
                <span className="ml-auto text-[10px] text-gray-400 bg-orange-50 px-1.5 py-0.5 rounded-md">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-orange-50 mt-4">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Globe size={11} />Направления</p>
          {["Москва", "Санкт-Петербург", "Казань", "Краснодар", "Екатеринбург"].map((city) => (
            <div key={city} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
              <MapPin size={11} className="text-orange-400 flex-shrink-0" />
              <span className="text-xs text-gray-600 font-medium">{city}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        {/* Hero */}
        <div className="relative h-56 bg-orange-200 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&h=448&fit=crop" alt="Путешествие" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-700/75 via-orange-500/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-10">
            <p className="text-orange-200 text-sm font-semibold mb-1 uppercase tracking-widest">Найдите следующее приключение</p>
            <h1 className="text-4xl font-extrabold text-white mb-1 leading-tight">Ваша команда<br />уже ждёт вас</h1>
            <p className="text-white/70 text-sm mb-5">Более {TRIPS.length * 20} предстоящих поездок по России</p>
            <div className="flex items-center gap-0 bg-white rounded-2xl overflow-hidden max-w-2xl shadow-xl">
              <div className="flex items-center gap-2.5 px-5 py-3.5 flex-1">
                <MapPin size={16} className="text-orange-400 flex-shrink-0" />
                <input placeholder="Откуда..." className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none font-medium min-w-0" />
              </div>
              <div className="w-px h-8 bg-orange-100" />
              <div className="flex items-center gap-2.5 px-5 py-3.5 flex-1">
                <Navigation size={16} className="text-orange-400 flex-shrink-0" />
                <input placeholder="Куда..." className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none font-medium min-w-0" />
              </div>
              <div className="w-px h-8 bg-orange-100" />
              <div className="flex items-center gap-2.5 px-5 py-3.5 flex-1">
                <Calendar size={16} className="text-orange-400 flex-shrink-0" />
                <input type="date" className="flex-1 text-sm text-gray-600 outline-none font-medium min-w-0 bg-transparent" />
              </div>
              <button className="px-6 py-3.5 bg-orange-500 text-white text-sm font-extrabold hover:bg-orange-600 transition-colors" style={{ boxShadow: "none" }}>Найти</button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Chips + count */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {TRANSPORT_FILTERS.map((f) => (
              <button key={f.id} onClick={() => setActiveChip(f.id)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeChip === f.id ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-100 hover:border-orange-200"}`} style={activeChip === f.id ? { boxShadow: "0 4px 12px rgba(249,115,22,0.3)" } : {}}>
                {f.label}
              </button>
            ))}
            <div className="ml-auto text-sm text-gray-400 font-medium">
              <span className="font-extrabold text-gray-800">{filteredTrips.length}</span> поездок найдено
            </div>
          </div>

          {/* Grid */}
          {filteredTrips.length === 0 ? (
            <div className="flex flex-col items-center py-20"><Compass size={48} className="mb-4 text-orange-200" /><p className="text-base text-gray-400 font-medium">Нет поездок по вашим фильтрам</p><button onClick={() => { setSelectedTransports([]); setMinSeats(1); setActiveChip("all"); }} className="mt-3 text-orange-500 text-sm font-bold hover:underline">Сбросить все фильтры</button></div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} onSelect={() => onTripSelect(trip)} />)}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function DesktopTripDetail({ trip, onBack, onJoin }: { trip: Trip; onBack: () => void; onJoin: () => void }) {
  const seatsLeft = trip.seats - trip.takenSeats;
  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
      <div className="px-8 pt-5 pb-1">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 font-semibold hover:text-orange-500 transition-colors">
          <ChevronLeft size={16} />Назад к поездкам
        </button>
      </div>
      <div className="px-8 pb-12">
        <div className="grid grid-cols-3 gap-8 items-start">
          {/* Left: main content */}
          <div className="col-span-2 space-y-5">
            <div className="relative h-72 rounded-3xl overflow-hidden bg-orange-200">
              <img src={trip.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-white text-3xl font-extrabold">{trip.fromShort}</span>
                  <div className="flex-1 flex items-center gap-2"><div className="flex-1 border-t-2 border-white/30 border-dashed" /><div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center"><ArrowRight size={16} className="text-white" /></div><div className="flex-1 border-t-2 border-white/30 border-dashed" /></div>
                  <span className="text-white text-3xl font-extrabold">{trip.toShort}</span>
                </div>
                <div className="flex justify-between"><span className="text-white/70 text-sm">{trip.from}</span><span className="text-white/70 text-sm">{trip.to}</span></div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: <Calendar size={18} className="text-orange-500" />, label: trip.date, sub: "Дата" },
                { icon: <Clock size={18} className="text-orange-500" />, label: trip.time, sub: "Отправление" },
                { icon: <TransportIcon type={trip.transport} size={18} />, label: transportLabel(trip.transport), sub: "Транспорт" },
                { icon: <Users size={18} className="text-orange-500" />, label: `${seatsLeft}`, sub: "Мест" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 bg-orange-50 rounded-2xl py-4 px-3">
                  {item.icon}<span className="text-sm font-extrabold text-gray-800 text-center">{item.label}</span><span className="text-xs text-gray-400 text-center">{item.sub}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl p-5 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
              <h3 className="font-extrabold text-gray-900 text-base mb-4">Организатор</h3>
              <div className="flex items-center gap-4">
                <img src={trip.host.avatar} alt={trip.host.name} className="w-16 h-16 rounded-2xl object-cover" />
                <div>
                  <p className="font-extrabold text-gray-900 text-lg">{trip.host.name}</p>
                  <div className="flex items-center gap-2 mt-1"><Star size={14} className="fill-orange-400 text-orange-400" /><span className="font-bold text-gray-700">{trip.host.rating}</span><span className="text-gray-400">·</span><span className="text-gray-500 text-sm">{trip.host.trips} поездок</span></div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="px-4 py-2 border border-orange-200 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors">Профиль</button>
                  <button className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-100 transition-colors flex items-center gap-1.5"><MessageSquare size={14} />Написать</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
              <h3 className="font-extrabold text-gray-900 text-base mb-3">О поездке</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{trip.description}</p>
              <div className="flex gap-2 mt-4 flex-wrap">{trip.tags.map((tag) => <span key={tag} className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-sm font-bold">{tag}</span>)}</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-gray-900 text-base">Участники ({trip.takenSeats + 1})</h3>
                <span className="text-sm text-orange-500 font-bold">{seatsLeft} свободных мест</span>
              </div>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex flex-col items-center gap-1.5"><img src={trip.host.avatar} alt={trip.host.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-400 ring-offset-1" /><span className="text-xs text-orange-500 font-bold">Организатор</span></div>
                {trip.participants.map((p, i) => <div key={i} className="flex flex-col items-center gap-1.5"><img src={p.avatar} alt={p.name} className="w-14 h-14 rounded-2xl object-cover" /><span className="text-xs text-gray-500 font-medium">{p.name}</span></div>)}
                {Array.from({ length: Math.min(seatsLeft, 3) }).map((_, i) => <div key={i} className="flex flex-col items-center gap-1.5"><div className="w-14 h-14 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 flex items-center justify-center"><Plus size={20} className="text-orange-300" /></div><span className="text-xs text-gray-400">Свободно</span></div>)}
              </div>
            </div>
          </div>

          {/* Right: booking sidebar */}
          <div className="col-span-1">
            <div className="sticky top-4 bg-white rounded-3xl p-5 border border-orange-50 space-y-4" style={{ boxShadow: "0 4px 24px rgba(249,115,22,0.12)" }}>
              <div>
                <div className="text-2xl font-extrabold text-gray-900">Бесплатно</div>
                <p className="text-sm text-gray-400 mt-0.5">Делимся впечатлениями, а не расходами</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 space-y-2.5">
                {[
                  { icon: <MapPin size={13} className="text-orange-500" />, label: "Откуда", value: trip.from },
                  { icon: <Navigation size={13} className="text-orange-500" />, label: "Куда", value: trip.to },
                  { icon: <Calendar size={13} className="text-orange-500" />, label: "Дата", value: trip.date },
                  { icon: <Clock size={13} className="text-orange-500" />, label: "Время", value: trip.time },
                  { icon: <Users size={13} className="text-orange-500" />, label: "Свободно", value: `${seatsLeft} из ${trip.seats}` },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2">{row.icon}<span className="text-xs text-gray-400 w-16 flex-shrink-0">{row.label}</span><span className="text-sm font-bold text-gray-800 ml-auto text-right">{row.value}</span></div>
                ))}
              </div>
              <button onClick={onJoin} className="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>
                Запросить участие
              </button>
              <p className="text-center text-xs text-gray-400">Организатор рассмотрит запрос в течение 24 ч</p>
              <div className="border-t border-orange-50 pt-4 flex items-center gap-3">
                <img src={trip.host.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                <div><p className="text-sm font-bold text-gray-900">{trip.host.name}</p><div className="flex items-center gap-1"><Star size={11} className="fill-orange-400 text-orange-400" /><span className="text-xs font-semibold text-gray-600">{trip.host.rating}</span><span className="text-xs text-gray-400">· Проверен</span></div></div>
              </div>
              <div className="flex gap-2 flex-wrap pt-1">{[{ icon: <Shield size={11} />, label: "Проверен" }, { icon: <Star size={11} />, label: "Топ рейтинг" }, { icon: <Check size={11} />, label: "Документы" }].map((b, i) => <div key={i} className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-xs font-bold">{b.icon}{b.label}</div>)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopCreateModal({ onClose }: { onClose: () => void }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [transport, setTransport] = useState<TransportType>("car");
  const [seats, setSeats] = useState(3);
  const [desc, setDesc] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-8" onClick={onClose}>
      <div className="bg-[#FFF8F4] rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-orange-50">
          <h2 className="text-xl font-extrabold text-gray-900 flex-1">Новая поездка</h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={16} className="text-gray-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ scrollbarWidth: "thin" }}>
          <div className="grid grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Маршрут</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-[#FFF8F4] rounded-xl px-3 py-2.5"><div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0"><MapPin size={13} className="text-orange-500" /></div><input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Город отправления" className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" /></div>
                  <div className="flex justify-center"><button className="w-7 h-7 rounded-lg bg-white border border-orange-100 flex items-center justify-center shadow-sm"><ArrowUpDown size={12} className="text-orange-500" /></button></div>
                  <div className="flex items-center gap-3 bg-[#FFF8F4] rounded-xl px-3 py-2.5"><div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0"><Navigation size={13} className="text-white" /></div><input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Город назначения" className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" /></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Дата и время</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-[#FFF8F4] rounded-xl px-3 py-2.5"><Calendar size={13} className="text-orange-400 flex-shrink-0" /><input type="date" className="flex-1 bg-transparent text-xs text-gray-700 outline-none min-w-0" /></div>
                  <div className="flex items-center gap-2 bg-[#FFF8F4] rounded-xl px-3 py-2.5"><Clock size={13} className="text-orange-400 flex-shrink-0" /><input type="time" className="flex-1 bg-transparent text-xs text-gray-700 outline-none min-w-0" /></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Транспорт</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {TRANSPORT_FORM_OPTIONS.map((t) => (
                    <button key={t.type} onClick={() => setTransport(t.type)} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${transport === t.type ? "bg-orange-500 text-white" : "bg-[#FFF8F4] text-gray-600 hover:bg-orange-50"}`}>
                      {t.type === "car" ? <Car size={16} /> : t.type === "train" ? <Train size={16} /> : t.type === "bus" ? <Bus size={16} /> : <Plane size={16} />}<span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Свободные места</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSeats(Math.max(1, seats - 1))} className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-extrabold text-xl">−</button>
                  <div className="flex-1 text-center"><span className="text-3xl font-extrabold text-gray-900">{seats}</span><p className="text-xs text-gray-400">мест</p></div>
                  <button onClick={() => setSeats(Math.min(8, seats + 1))} className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-extrabold text-xl" style={{ boxShadow: "0 4px 8px rgba(249,115,22,0.35)" }}>+</button>
                </div>
                <div className="flex gap-1 mt-3 justify-center">{Array.from({ length: seats }).map((_, i) => <div key={i} className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center"><User size={12} className="text-orange-400" /></div>)}</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-orange-50 flex-1" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Описание</p>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Расскажите об атмосфере, ожиданиях и месте встречи..." rows={5} className="w-full bg-[#FFF8F4] rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none" />
                <p className="text-right text-xs text-gray-400 mt-1">{desc.length}/280</p>
              </div>

              {/* Preview card */}
              {(from || to) && (
                <div className="bg-orange-500 rounded-2xl p-4 text-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-70 mb-2">Превью</p>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg">{from.slice(0, 3).toUpperCase() || "???"}</span>
                    <ArrowRight size={16} className="opacity-70" />
                    <span className="font-extrabold text-lg">{to.slice(0, 3).toUpperCase() || "???"}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs opacity-80">
                    <span className="flex items-center gap-1"><TransportIcon type={transport} size={11} />{transportLabel(transport)}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{seats} мест</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-3 bg-white border-t border-orange-50">
          <button className="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>
            Опубликовать поездку ✈︎
          </button>
        </div>
      </div>
    </div>
  );
}

function DesktopChat({ trip }: { trip: Trip }) {
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatMsgsRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, sender: "Я", avatar: "", text: input, time: formatTime(), isMe: true }]);
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Conversations list */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-orange-50 flex flex-col">
        <div className="p-4 border-b border-orange-50">
          <h3 className="font-extrabold text-gray-900 text-sm mb-3">Чаты поездок</h3>
          <div className="flex items-center gap-2 bg-[#FFF8F4] rounded-xl px-3 py-2"><Search size={13} className="text-gray-400" /><input placeholder="Поиск чатов..." className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none" /></div>
        </div>
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {TRIPS.map((t, i) => (
            <button key={t.id} className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-orange-50 transition-colors text-left ${t.id === trip.id ? "bg-orange-50" : "hover:bg-[#FFF8F4]"}`}>
              <div className="relative flex-shrink-0">
                <img src={t.host.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover" />
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${i < 2 ? "bg-emerald-400" : "bg-gray-300"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{t.fromShort} → {t.toShort}</p>
                <p className="text-xs text-gray-400 truncate">{t.date}</p>
              </div>
              {i === 0 && <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-[9px] font-extrabold text-white">2</span></div>}
            </button>
          ))}
        </div>
      </aside>

      {/* Messages */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 bg-white border-b border-orange-50 flex-shrink-0">
          <div className="relative flex-shrink-0"><img src={trip.host.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover" /><div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" /></div>
          <div><p className="font-extrabold text-gray-900">{trip.fromShort} → {trip.toShort}</p><p className="text-xs text-gray-400">{trip.takenSeats + 2} участников · {trip.date}</p></div>
          <div className="ml-auto flex -space-x-2">{[trip.host.avatar, ...trip.participants.slice(0, 2).map((p) => p.avatar)].map((av, i) => <img key={i} src={av} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />)}</div>
        </div>

        <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0"><div className="flex-1 h-px bg-orange-100" /><span className="text-xs text-gray-400">{trip.date}</span><div className="flex-1 h-px bg-orange-100" /></div>

        <div ref={chatMsgsRef} className="flex-1 overflow-y-auto px-5 pb-4 space-y-3" style={{ scrollbarWidth: "thin" }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end gap-2 ${msg.isMe ? "flex-row-reverse" : ""}`}>
              {!msg.isMe && <img src={msg.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mb-1" />}
              <div className={`max-w-[65%] flex flex-col gap-0.5 ${msg.isMe ? "items-end" : "items-start"}`}>
                {!msg.isMe && <span className="text-xs text-gray-400 font-semibold ml-1">{msg.sender}</span>}
                <div className={`px-4 py-2.5 text-sm leading-relaxed font-medium ${msg.isMe ? "bg-orange-500 text-white rounded-2xl rounded-br-sm" : "bg-white text-gray-800 rounded-2xl rounded-bl-sm"}`} style={!msg.isMe ? { boxShadow: "0 1px 6px rgba(0,0,0,0.06)" } : {}}>{msg.text}</div>
                <span className="text-[10px] text-gray-400 mx-1">{msg.time}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="px-5 py-3.5 bg-white border-t border-orange-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0"><Camera size={16} className="text-orange-400" /></button>
            <div className="flex-1 flex items-center gap-2 bg-[#FFF8F4] rounded-2xl px-4 py-2.5 border border-orange-50">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Сообщение для команды..." className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
            </div>
            <button onClick={sendMessage} className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.4)" }}><Send size={15} className="text-white" /></button>
          </div>
        </div>
      </div>

      {/* Trip info panel */}
      <aside className="w-72 flex-shrink-0 bg-white border-l border-orange-50 overflow-y-auto p-5" style={{ scrollbarWidth: "none" }}>
        <h3 className="font-extrabold text-gray-900 mb-4">Детали поездки</h3>
        <div className="relative h-28 rounded-2xl overflow-hidden mb-4 bg-orange-200">
          <img src={trip.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between"><span className="text-white font-extrabold text-lg">{trip.fromShort}</span><ArrowRight size={16} className="text-orange-300" /><span className="text-white font-extrabold text-lg">{trip.toShort}</span></div>
        </div>
        <div className="space-y-2 mb-5">{[{ icon: <Calendar size={13} className="text-orange-400" />, label: trip.date }, { icon: <Clock size={13} className="text-orange-400" />, label: trip.time }, { icon: <TransportIcon type={trip.transport} size={13} />, label: transportLabel(trip.transport) }, { icon: <Users size={13} className="text-orange-400" />, label: `${trip.takenSeats + 2} участников` }].map((r, i) => <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">{r.icon}{r.label}</div>)}</div>
        <div className="border-t border-orange-50 pt-4">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Участники</p>
          <div className="space-y-3">
            {[{ name: trip.host.name, avatar: trip.host.avatar, role: "Организатор", rating: trip.host.rating as number | null }, ...trip.participants.map((p) => ({ name: p.name, avatar: p.avatar, role: "Путешественник", rating: null as number | null }))].map((member, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-800 truncate">{member.name}</p><p className="text-xs text-gray-400">{member.role}</p></div>
                {member.rating && <div className="flex items-center gap-0.5 flex-shrink-0"><Star size={11} className="fill-orange-400 text-orange-400" /><span className="text-xs font-bold text-gray-600">{member.rating}</span></div>}
              </div>
            ))}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0"><User size={14} className="text-orange-400" /></div>
              <div><p className="text-sm font-bold text-orange-500">Вы</p><p className="text-xs text-gray-400">В поездке</p></div>
              <Check size={14} className="text-emerald-500 ml-auto" />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function DesktopProfile() {
  const pastTrips = [
    { from: "МСК", to: "СПБ", date: "14 июн", transport: "car", rating: 5 },
    { from: "Сочи", to: "Москва", date: "28 мая", transport: "train", rating: 5 },
    { from: "МСК", to: "Тула", date: "10 мая", transport: "bus", rating: 4 },
    { from: "СПБ", to: "Карелия", date: "22 апр", transport: "train", rating: 5 },
    { from: "МСК", to: "Казань", date: "5 апр", transport: "car", rating: 4 },
  ];
  const reviews = [
    { name: "Мария К.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", text: "Алексей очень дружелюбный и пунктуальный! Отличная поездка — и музыка супер.", rating: 5, date: "14 июн" },
    { name: "Дмитрий С.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", text: "Отличный попутчик. Уважительный, весёлый — дорога пролетела незаметно.", rating: 5, date: "28 мая" },
    { name: "Елена В.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop", text: "Очень организованный, хорошо общался до поездки. Обязательно поеду с Алексеем снова!", rating: 5, date: "10 мая" },
  ];
  const upcomingTrips = TRIPS.slice(0, 2);

  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
      {/* Cover */}
      <div className="relative h-52 bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&h=416&fit=crop" alt="Обложка" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/40 to-transparent" />
        <button className="absolute top-6 right-6 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow"><Settings size={18} className="text-gray-700" /></button>
      </div>

      <div className="px-10 pb-12">
        {/* Profile header */}
        <div className="flex items-end gap-6 -mt-12 mb-6">
          <div className="relative flex-shrink-0">
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop" alt="Алексей Ч." className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl" />
            <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-400 rounded-xl border-2 border-white flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={3} /></div>
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Алексей Ч.</h1>
                <div className="flex items-center gap-2 mt-1"><MapPin size={14} className="text-orange-400" /><span className="text-gray-500 text-sm">Москва · В сообществе с 2023</span></div>
                <p className="text-gray-600 text-sm mt-2 max-w-lg">Любитель приключений и выходных поездок 🌍 Всегда готов в дорогу или в новый город. Хозяин собаки 🐕</p>
                <div className="flex gap-2 mt-3 flex-wrap">{["Документы", "Топ рейтинг", "Ранняя пташка", "Автопутешественник"].map((b) => <span key={b} className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold"><Sparkles size={10} />{b}</span>)}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="px-4 py-2.5 border border-orange-200 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors">Поделиться</button>
                <button className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}>Редактировать</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[{ value: "12", label: "Поездок", icon: <Navigation size={18} className="text-orange-500" /> }, { value: "4.9", label: "Средний рейтинг", icon: <Star size={18} className="text-orange-500" /> }, { value: "48", label: "Отзывов", icon: <MessageSquare size={18} className="text-orange-500" /> }, { value: "23", label: "Друзей", icon: <Users size={18} className="text-orange-500" /> }].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-4 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">{stat.icon}</div>
              <div><div className="text-2xl font-extrabold text-gray-900">{stat.value}</div><div className="text-xs text-gray-400 font-medium">{stat.label}</div></div>
            </div>
          ))}
        </div>

        {/* Three columns */}
        <div className="grid grid-cols-3 gap-6">
          {/* Travel History */}
          <div>
            <h3 className="font-extrabold text-gray-900 mb-4 text-base">История поездок</h3>
            <div className="space-y-2">
              {pastTrips.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-orange-50 hover:shadow-sm transition-shadow" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.05)" }}>
                  <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0"><TransportIcon type={t.transport} size={15} /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-800 truncate">{t.from} → {t.to}</p><p className="text-xs text-gray-400">{t.date}</p></div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={10} className="fill-orange-400 text-orange-400" />)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Trips */}
          <div>
            <h3 className="font-extrabold text-gray-900 mb-4 text-base">Мои поездки</h3>
            <div className="space-y-3">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-2xl overflow-hidden border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                  <div className="relative h-24 bg-orange-100"><img src={trip.image} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /><div className="absolute bottom-2 left-3 right-3 flex items-center justify-between"><span className="text-white font-extrabold">{trip.fromShort}</span><ArrowRight size={14} className="text-orange-300" /><span className="text-white font-extrabold">{trip.toShort}</span></div></div>
                  <div className="p-3"><div className="flex items-center gap-2 text-xs text-gray-500"><Calendar size={11} className="text-orange-400" />{trip.date}<Clock size={11} className="text-orange-400 ml-1" />{trip.time}</div></div>
                </div>
              ))}
              <button className="w-full py-2.5 text-sm font-bold text-orange-500 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors">Создать поездку</button>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="font-extrabold text-gray-900 mb-4 text-base">Отзывы (48)</h3>
            <div className="space-y-3">
              {reviews.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover" />
                    <div className="flex-1"><p className="text-sm font-bold text-gray-800">{r.name}</p><p className="text-xs text-gray-400">{r.date}</p></div>
                    <div className="flex items-center gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={11} className="fill-orange-400 text-orange-400" />)}</div>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopRequestView({ trip, onBack, onChat }: { trip: Trip; onBack: () => void; onChat: () => void }) {
  const [status, setStatus] = useState<"pending" | "accepted">("pending");
  useEffect(() => { const t = setTimeout(() => setStatus("accepted"), 3000); return () => clearTimeout(t); }, []);

  return (
    <div className="flex-1 flex items-center justify-center bg-[#FFF8F4] p-8">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center border border-orange-50 relative overflow-hidden" style={{ boxShadow: "0 8px 40px rgba(249,115,22,0.12)" }}>
        {status === "accepted" && ["top-8 left-8", "top-4 right-12", "top-16 right-6", "top-6 left-16"].map((pos, i) => <div key={i} className={`absolute ${pos} w-3 h-3 rounded-full`} style={{ background: ["#F97316", "#FDBA74", "#FB923C", "#FED7AA"][i] }} />)}

        {status === "pending" ? (
          <>
            <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-orange-300 animate-ping opacity-25" />
              <div className="absolute inset-2 rounded-full bg-orange-400 animate-ping opacity-20" style={{ animationDelay: "0.3s" }} />
              <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center" style={{ boxShadow: "0 8px 32px rgba(249,115,22,0.45)" }}><Clock size={28} className="text-white" /></div>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Запрос отправлен!</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Ваш запрос на участие в поездке <span className="font-bold text-gray-800">{trip.host.name}</span> из <span className="font-bold text-gray-800">{trip.fromShort} → {trip.toShort}</span> ожидает подтверждения.</p>
            <div className="bg-orange-50 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3"><img src={trip.host.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" /><div><p className="font-extrabold text-gray-900">{trip.fromShort} → {trip.toShort}</p><p className="text-sm text-gray-500">{trip.date} · {trip.time}</p></div><div className="ml-auto px-3 py-1.5 bg-orange-100 text-orange-600 rounded-xl text-xs font-extrabold">Ожидание…</div></div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" /><div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0.15s" }} /><div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
              <span className="ml-1">Ждём ответа организатора</span>
            </div>
            <button onClick={onBack} className="text-gray-400 text-sm font-medium hover:text-gray-600">← Назад к поездкам</button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6" style={{ boxShadow: "0 8px 32px rgba(16,185,129,0.4)" }}><Check size={36} className="text-white" strokeWidth={3} /></div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Вы в деле! 🎉</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed"><span className="font-bold text-gray-700">{trip.host.name}</span> подтвердил ваш запрос. Добро пожаловать в команду!</p>
            <div className="bg-emerald-50 rounded-2xl p-4 mb-6 text-left border border-emerald-100">
              <div className="flex items-center gap-3 mb-3"><img src={trip.host.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" /><div><p className="font-extrabold text-gray-900">{trip.fromShort} → {trip.toShort}</p><p className="text-sm text-gray-500">{trip.date} · {trip.time}</p></div><div className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-xl text-xs font-extrabold"><Check size={11} /> Подтверждено</div></div>
              <div className="flex -space-x-2">{[trip.host.avatar, ...trip.participants.map((p) => p.avatar)].map((av, i) => <img key={i} src={av} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />)}</div>
            </div>
            <button onClick={onChat} className="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform mb-3" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>Открыть групповой чат 💬</button>
            <button onClick={onBack} className="text-gray-400 text-sm font-medium hover:text-gray-600">← Назад к поездкам</button>
          </>
        )}
      </div>
    </div>
  );
}

function DesktopApp({ screen, setScreen, selectedTrip, setSelectedTrip }: {
  screen: Screen; setScreen: (s: Screen) => void; selectedTrip: Trip; setSelectedTrip: (t: Trip) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#FFF8F4] overflow-hidden">
      <DesktopNavbar
        activeScreen={screen}
        onNavigate={(s) => setScreen(s)}
        onCreateClick={() => setShowCreate(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        {(screen === "home" || screen === "explore") && (
          <DesktopHome onTripSelect={(t) => { setSelectedTrip(t); setScreen("detail"); }} onCreateClick={() => setShowCreate(true)} />
        )}
        {screen === "detail" && (
          <DesktopTripDetail trip={selectedTrip} onBack={() => setScreen("home")} onJoin={() => setScreen("request")} />
        )}
        {screen === "request" && (
          <DesktopRequestView trip={selectedTrip} onBack={() => setScreen("home")} onChat={() => setScreen("chat")} />
        )}
        {screen === "chat" && <DesktopChat trip={selectedTrip} />}
        {screen === "profile" && <DesktopProfile />}
      </div>

      {showCreate && <DesktopCreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════════════════════

export default function App() {
  const isDesktop = useIsDesktop();
  const [screen, setScreen] = useState<Screen>(() =>
    typeof window !== "undefined" && window.innerWidth < DESKTOP_BREAKPOINT && !localStorage.getItem("waymate-onboarded")
      ? "onboarding"
      : "home",
  );
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [selectedTrip, setSelectedTrip] = useState<Trip>(TRIPS[0]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    const map: Record<Tab, Screen> = { home: "home", explore: "home", create: "create", chat: "chat", profile: "profile" };
    setScreen(map[tab]);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("waymate-onboarded", "1");
    setScreen("home");
    setActiveTab("home");
  };

  const showMobileNav = !["onboarding", "detail", "request"].includes(screen);
  const appFont = { fontFamily: "'Plus Jakarta Sans', sans-serif" } as const;

  if (isDesktop) {
    return (
      <div style={appFont}>
        <DesktopApp
          screen={screen === "onboarding" ? "home" : screen}
          setScreen={setScreen}
          selectedTrip={selectedTrip}
          setSelectedTrip={setSelectedTrip}
        />
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[#FFF8F4] overflow-hidden" style={appFont}>
      {screen !== "onboarding" && <StatusBar />}
      <div className="flex-1 overflow-hidden">
        {screen === "onboarding" && <OnboardingScreen onStart={handleOnboardingComplete} />}
        {(screen === "home" || screen === "explore") && <HomeScreen onTripSelect={(t) => { setSelectedTrip(t); setScreen("detail"); }} />}
        {screen === "detail" && <TripDetailScreen trip={selectedTrip} onBack={() => setScreen("home")} onJoin={() => setScreen("request")} />}
        {screen === "create" && <CreateTripScreen onBack={() => { setScreen("home"); setActiveTab("home"); }} />}
        {screen === "request" && <RequestScreen trip={selectedTrip} onBack={() => { setScreen("home"); setActiveTab("home"); }} onChat={() => { setScreen("chat"); setActiveTab("chat"); }} />}
        {screen === "chat" && <ChatScreen trip={selectedTrip} onBack={() => { setScreen("home"); setActiveTab("home"); }} />}
        {screen === "profile" && <ProfileScreen />}
      </div>
      {showMobileNav && <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />}
    </div>
  );
}
