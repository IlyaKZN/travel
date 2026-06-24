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

interface Participant { name: string; avatar: string; }
interface Trip {
  id: number; from: string; fromShort: string; to: string; toShort: string;
  date: string; time: string; transport: string; seats: number; takenSeats: number;
  host: { name: string; avatar: string; rating: number; trips: number };
  participants: Participant[]; description: string; tags: string[]; image: string;
}
interface Message { id: number; sender: string; avatar: string; text: string; time: string; isMe: boolean; }

// ─── Data ─────────────────────────────────────────────────────────────────────

const TRIPS: Trip[] = [
  {
    id: 1,
    from: "New York, NY", fromShort: "NYC",
    to: "Boston, MA", toShort: "BOS",
    date: "Sat, Jul 5", time: "9:00 AM", transport: "car",
    seats: 4, takenSeats: 2,
    host: { name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", rating: 4.9, trips: 23 },
    participants: [
      { name: "Jake", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop" },
      { name: "Mia", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop" },
    ],
    description: "Weekend road trip to Boston for the art festival. I drive a comfortable SUV with great playlists! Comfortable, punctual, friendly vibes only.",
    tags: ["Art Festival", "Road Trip", "Music"],
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&h=400&fit=crop",
  },
  {
    id: 2,
    from: "Chicago, IL", fromShort: "CHI",
    to: "Milwaukee, WI", toShort: "MKE",
    date: "Sun, Jul 6", time: "10:30 AM", transport: "train",
    seats: 6, takenSeats: 4,
    host: { name: "Marcus T.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", rating: 4.7, trips: 15 },
    participants: [
      { name: "Ana", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop" },
      { name: "Tom", avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=80&h=80&fit=crop" },
      { name: "Lena", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop" },
    ],
    description: "Heading to Milwaukee Summerfest! Train ride, board games, great company. Making a full day of it — expect laughs and good music.",
    tags: ["Festival", "Train", "Day Trip"],
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop",
  },
  {
    id: 3,
    from: "Los Angeles, CA", fromShort: "LAX",
    to: "San Diego, CA", toShort: "SAN",
    date: "Fri, Jul 11", time: "7:00 AM", transport: "car",
    seats: 3, takenSeats: 1,
    host: { name: "Priya K.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop", rating: 5.0, trips: 41 },
    participants: [
      { name: "Diego", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop" },
    ],
    description: "Quick weekend escape to San Diego! Beach, tacos, and amazing sunset views. Tesla Model Y — super comfortable for the highway cruise.",
    tags: ["Beach", "Weekend", "Scenic"],
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=400&fit=crop",
  },
  {
    id: 4,
    from: "Seattle, WA", fromShort: "SEA",
    to: "Portland, OR", toShort: "PDX",
    date: "Sat, Jul 12", time: "8:30 AM", transport: "car",
    seats: 3, takenSeats: 0,
    host: { name: "Jordan L.", avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=80&h=80&fit=crop", rating: 4.8, trips: 9 },
    participants: [],
    description: "Scenic I-5 drive down to Portland. Planning to stop at Mount Rainier viewpoint. Coffee and good conversation required.",
    tags: ["Scenic Drive", "Nature", "Coffee"],
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=400&fit=crop",
  },
  {
    id: 5,
    from: "Miami, FL", fromShort: "MIA",
    to: "Orlando, FL", toShort: "MCO",
    date: "Sun, Jul 13", time: "6:00 AM", transport: "bus",
    seats: 8, takenSeats: 5,
    host: { name: "Elena R.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop", rating: 4.6, trips: 7 },
    participants: [
      { name: "Chris", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" },
      { name: "Sara", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop" },
    ],
    description: "Group bus trip to Orlando for the theme parks. Going to Universal Studios! The more the merrier — great group energy guaranteed.",
    tags: ["Theme Parks", "Group Trip", "Fun"],
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=400&fit=crop",
  },
  {
    id: 6,
    from: "Denver, CO", fromShort: "DEN",
    to: "Aspen, CO", toShort: "ASE",
    date: "Fri, Jul 18", time: "7:30 AM", transport: "car",
    seats: 4, takenSeats: 1,
    host: { name: "Kai B.", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop", rating: 4.9, trips: 31 },
    participants: [
      { name: "Nora", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&h=80&fit=crop" },
    ],
    description: "Mountain drive to Aspen for the jazz festival weekend. Stunning Rocky Mountain views — bring warm clothes and hiking boots!",
    tags: ["Jazz Festival", "Mountains", "Scenic"],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
  },
];

const MESSAGES: Message[] = [
  { id: 1, sender: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", text: "Hey everyone! 🙌 So excited for this trip to Boston!", time: "9:32 AM", isMe: false },
  { id: 2, sender: "Jake R.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", text: "Same! Should we meet at Grand Central or does Sarah pick us up?", time: "9:34 AM", isMe: false },
  { id: 3, sender: "Me", avatar: "", text: "I can do either! Grand Central works fine for me 👌", time: "9:35 AM", isMe: true },
  { id: 4, sender: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", text: "Perfect! Meet at the south entrance at 9:00 sharp. I'll bring snacks 🍊", time: "9:37 AM", isMe: false },
  { id: 5, sender: "Mia L.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop", text: "Yay! I'm bringing my portable speaker if that's cool with everyone?", time: "9:40 AM", isMe: false },
  { id: 6, sender: "Me", avatar: "", text: "100% yes to the speaker! Road trip playlist loading... 🎵", time: "9:41 AM", isMe: true },
  { id: 7, sender: "Jake R.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop", text: "Also — anyone need me to bring extra water bottles?", time: "9:43 AM", isMe: false },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function TransportIcon({ type, size = 16 }: { type: string; size?: number }) {
  const props = { size, strokeWidth: 2 };
  if (type === "train") return <Train {...props} />;
  if (type === "bus") return <Bus {...props} />;
  if (type === "plane") return <Plane {...props} />;
  return <Car {...props} />;
}

function transportLabel(type: string) {
  return { car: "Car", train: "Train", bus: "Bus", plane: "Flight" }[type] ?? "Car";
}

// ════════════════════════════════════════════════════════════════════════════════
// MOBILE SCREENS
// ════════════════════════════════════════════════════════════════════════════════

function OnboardingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="relative flex-[1.2] overflow-hidden rounded-b-[2.5rem] bg-orange-200">
        <img src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&h=700&fit=crop" alt="Friends on a road trip" className="w-full h-full object-cover" />
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
            <p className="text-xs font-bold text-gray-800">2,400+ travelers</p>
            <p className="text-xs text-gray-500">joined last week</p>
          </div>
          <div className="ml-auto flex items-center gap-1 bg-orange-50 px-2.5 py-1.5 rounded-xl">
            <Star size={13} className="fill-orange-400 text-orange-400" />
            <span className="text-xs font-bold text-gray-800">4.9</span>
          </div>
        </div>
      </div>
      <div className="px-6 pt-7 pb-8 bg-[#FFF8F4]">
        <h1 className="text-[1.65rem] font-extrabold text-gray-900 leading-tight mb-2.5">
          Find your <span className="text-orange-500">travel crew</span> for every adventure
        </h1>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">Connect with friendly travelers, share rides, and turn every journey into a memory worth keeping.</p>
        <div className="space-y-2.5 mb-7">
          {[
            { icon: <Shield size={15} />, text: "Verified profiles & safety ratings" },
            { icon: <Zap size={15} />, text: "Join a trip in just 2 taps" },
            { icon: <MessageSquare size={15} />, text: "Private group chat for every trip" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center flex-shrink-0">{item.icon}</div>
              <span className="text-sm text-gray-700 font-medium">{item.text}</span>
            </div>
          ))}
        </div>
        <button onClick={onStart} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold text-base active:scale-95 transition-transform" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>
          Get Started — It&apos;s Free
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">Already have an account? <span className="text-orange-500 font-semibold">Sign in</span></p>
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
          {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex flex-col items-center">
            <span className="text-base font-extrabold text-gray-900">{trip.fromShort}</span>
            <span className="text-[10px] text-gray-400">{trip.from.split(",")[0]}</span>
          </div>
          <div className="flex-1 flex items-center gap-1">
            <div className="flex-1 border-t-2 border-dashed border-orange-200" />
            <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center"><ArrowRight size={11} className="text-orange-400" /></div>
            <div className="flex-1 border-t-2 border-dashed border-orange-200" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-base font-extrabold text-gray-900">{trip.toShort}</span>
            <span className="text-[10px] text-gray-400">{trip.to.split(",")[0]}</span>
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
            <span className="text-[11px] text-gray-400">{trip.takenSeats} going</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ onTripSelect }: { onTripSelect: (t: Trip) => void }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const filters = ["All", "Car", "Train", "Bus", "Flight"];
  const filteredTrips = activeFilter === "all" ? TRIPS : TRIPS.filter((t) => { if (activeFilter === "flight") return t.transport === "plane"; return t.transport === activeFilter; });
  return (
    <div className="flex flex-col h-full bg-[#FFF8F4]">
      <div className="px-5 pt-14 pb-3">
        <div className="flex items-center justify-between mb-1">
          <div><p className="text-xs text-gray-400 font-medium">Good morning,</p><h1 className="text-xl font-extrabold text-gray-900">Alex Chen 👋</h1></div>
          <button className="relative w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-orange-100" style={{ boxShadow: "0 2px 8px rgba(249,115,22,0.1)" }}>
            <Bell size={18} className="text-gray-600" /><div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full" />
          </button>
        </div>
        <div className="flex items-center gap-1 mt-1"><MapPin size={13} className="text-orange-400" /><span className="text-xs text-gray-500 font-medium">New York, NY</span><ChevronRight size={12} className="text-gray-400" /></div>
      </div>
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <Search size={17} className="text-gray-400" /><span className="text-gray-400 text-sm">Where do you want to go?</span>
        </div>
      </div>
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {filters.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f.toLowerCase())} className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeFilter === f.toLowerCase() ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-100"}`} style={activeFilter === f.toLowerCase() ? { boxShadow: "0 4px 12px rgba(249,115,22,0.3)" } : {}}>{f}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-24 space-y-4" style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center justify-between mb-1"><h2 className="text-sm font-extrabold text-gray-900">Upcoming Trips</h2><button className="text-orange-500 text-xs font-bold">See all</button></div>
        {filteredTrips.length === 0 ? (<div className="flex flex-col items-center py-12 text-gray-400"><Compass size={40} className="mb-3 text-orange-200" /><p className="text-sm font-medium">No trips found for this filter</p></div>) : (filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} onSelect={() => onTripSelect(trip)} />))}
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
              { icon: <Calendar size={14} className="text-orange-500" />, label: trip.date.split(",")[0], sub: trip.date.split(",")[1]?.trim() },
              { icon: <Clock size={14} className="text-orange-500" />, label: trip.time, sub: "Departure" },
              { icon: <TransportIcon type={trip.transport} size={14} />, label: transportLabel(trip.transport), sub: "Via" },
              { icon: <Users size={14} className="text-orange-500" />, label: `${seatsLeft}`, sub: "Seats left" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-1 bg-orange-50 rounded-2xl py-3 px-1">{item.icon}<span className="text-xs font-extrabold text-gray-800 text-center leading-tight">{item.label}</span><span className="text-[9px] text-gray-400 text-center">{item.sub}</span></div>
            ))}
          </div>
          <div className="flex items-center gap-3 mb-5 p-3.5 bg-orange-50 rounded-2xl">
            <img src={trip.host.avatar} alt={trip.host.name} className="w-12 h-12 rounded-2xl object-cover" />
            <div>
              <p className="font-extrabold text-gray-900 text-sm">{trip.host.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5"><Star size={11} className="fill-orange-400 text-orange-400" /><span className="text-sm font-bold text-gray-700">{trip.host.rating}</span><span className="text-xs text-gray-400">· {trip.host.trips} trips hosted</span></div>
            </div>
            <button className="ml-auto px-3 py-1.5 border border-orange-200 text-orange-500 rounded-xl text-xs font-bold">Profile</button>
          </div>
          <div className="mb-5"><h3 className="font-extrabold text-gray-900 mb-1.5 text-sm">About this trip</h3><p className="text-sm text-gray-600 leading-relaxed">{trip.description}</p></div>
          <div className="flex gap-2 mb-5 flex-wrap">{trip.tags.map((tag) => <span key={tag} className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold">{tag}</span>)}</div>
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3"><h3 className="font-extrabold text-gray-900 text-sm">Going ({trip.takenSeats + 1})</h3><span className="text-xs text-orange-500 font-bold">{seatsLeft} spots open</span></div>
            <div className="flex items-start gap-3 flex-wrap">
              <div className="flex flex-col items-center gap-1"><img src={trip.host.avatar} alt={trip.host.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-orange-400 ring-offset-1" /><span className="text-[10px] text-orange-500 font-bold">Host</span></div>
              {trip.participants.map((p, i) => <div key={i} className="flex flex-col items-center gap-1"><img src={p.avatar} alt={p.name} className="w-12 h-12 rounded-2xl object-cover" /><span className="text-[10px] text-gray-500 font-medium">{p.name}</span></div>)}
              {Array.from({ length: Math.min(seatsLeft, 2) }).map((_, i) => <div key={i} className="flex flex-col items-center gap-1"><div className="w-12 h-12 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 flex items-center justify-center"><Plus size={18} className="text-orange-300" /></div><span className="text-[10px] text-gray-400">Open</span></div>)}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">{[{ icon: <Shield size={12} />, label: "Verified" }, { icon: <Star size={12} />, label: "Top Rated" }, { icon: <Check size={12} />, label: "ID Checked" }].map((b, i) => <div key={i} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-bold">{b.icon}{b.label}</div>)}</div>
        </div>
      </div>
      <div className="px-5 pb-8 pt-3 bg-white border-t border-orange-50">
        <button onClick={onJoin} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>Request to Join — Free</button>
        <p className="text-center text-xs text-gray-400 mt-2">Host reviews your request within 24 hours</p>
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
  const transports: { type: TransportType; icon: React.ReactNode; label: string }[] = [
    { type: "car", icon: <Car size={20} />, label: "Car" },
    { type: "train", icon: <Train size={20} />, label: "Train" },
    { type: "bus", icon: <Bus size={20} />, label: "Bus" },
    { type: "plane", icon: <Plane size={20} />, label: "Flight" },
  ];
  return (
    <div className="flex flex-col h-full bg-[#FFF8F4]">
      <div className="flex items-center gap-3 px-5 pt-14 pb-5 bg-[#FFF8F4]">
        <button onClick={onBack} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center border border-orange-50 shadow-sm"><ChevronLeft size={20} className="text-gray-700" /></button>
        <h1 className="text-xl font-extrabold text-gray-900">Plan a Trip</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-28 space-y-4" style={{ scrollbarWidth: "none" }}>
        <div className="bg-white rounded-3xl p-4 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Route</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-[#FFF8F4] rounded-2xl px-4 py-3"><div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0"><MapPin size={15} className="text-orange-500" /></div><input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Departure city" className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none font-medium" /></div>
            <div className="flex justify-center -my-0.5 relative z-10"><button className="w-8 h-8 rounded-xl bg-white border border-orange-100 flex items-center justify-center shadow-sm"><ArrowUpDown size={14} className="text-orange-500" /></button></div>
            <div className="flex items-center gap-3 bg-[#FFF8F4] rounded-2xl px-4 py-3"><div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0"><Navigation size={15} className="text-white" /></div><input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destination city" className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none font-medium" /></div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Date & Time</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-[#FFF8F4] rounded-2xl px-4 py-3"><Calendar size={15} className="text-orange-400 flex-shrink-0" /><input type="date" className="flex-1 bg-transparent text-xs text-gray-700 outline-none font-medium min-w-0" /></div>
            <div className="flex items-center gap-2 bg-[#FFF8F4] rounded-2xl px-4 py-3"><Clock size={15} className="text-orange-400 flex-shrink-0" /><input type="time" className="flex-1 bg-transparent text-xs text-gray-700 outline-none font-medium min-w-0" /></div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Transport Type</p>
          <div className="grid grid-cols-4 gap-2">{transports.map((t) => <button key={t.type} onClick={() => setTransport(t.type)} className={`flex flex-col items-center gap-1.5 py-3.5 rounded-2xl transition-all font-bold text-xs ${transport === t.type ? "bg-orange-500 text-white" : "bg-[#FFF8F4] text-gray-600"}`} style={transport === t.type ? { boxShadow: "0 4px 12px rgba(249,115,22,0.35)" } : {}}>{t.icon}<span>{t.label}</span></button>)}</div>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4">Available Seats</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setSeats(Math.max(1, seats - 1))} className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-extrabold text-2xl">−</button>
            <div className="flex-1 text-center"><span className="text-4xl font-extrabold text-gray-900">{seats}</span><p className="text-xs text-gray-400 mt-0.5">companion seats</p></div>
            <button onClick={() => setSeats(Math.min(8, seats + 1))} className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-extrabold text-2xl" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}>+</button>
          </div>
          <div className="flex gap-1.5 mt-4 justify-center">{Array.from({ length: seats }).map((_, i) => <div key={i} className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center"><User size={14} className="text-orange-400" /></div>)}</div>
        </div>
        <div className="bg-white rounded-3xl p-4 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Description</p>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Tell others about your trip vibe, expectations, and what to bring..." rows={4} className="w-full bg-[#FFF8F4] rounded-2xl px-4 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none" />
          <p className="text-right text-xs text-gray-400 mt-1">{desc.length}/280</p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-white border-t border-orange-50">
        <button className="w-full py-4 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>Create Trip ✈︎</button>
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
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Request Sent!</h2>
        <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed max-w-xs">Your request to join <span className="font-bold text-gray-700">{trip.host.name}&apos;s</span> trip from <span className="font-bold text-gray-700">{trip.fromShort} → {trip.toShort}</span> is awaiting approval.</p>
        <div className="w-full bg-white rounded-3xl p-4 border border-orange-50 mb-8" style={{ boxShadow: "0 2px 16px rgba(249,115,22,0.08)" }}>
          <div className="flex items-center gap-3">
            <img src={trip.host.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" />
            <div><p className="font-extrabold text-gray-900 text-sm">{trip.fromShort} → {trip.toShort}</p><p className="text-xs text-gray-500 mt-0.5">{trip.date} · {trip.time}</p></div>
            <div className="ml-auto px-3 py-1.5 bg-orange-100 text-orange-600 rounded-xl text-xs font-extrabold">Pending…</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" /><div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0.15s" }} /><div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
          <span className="ml-1">Waiting for host to respond</span>
        </div>
        <button onClick={onBack} className="text-gray-400 text-sm font-medium">Back to trips</button>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full bg-[#FFF8F4] items-center justify-center px-6 relative overflow-hidden">
      {["top-16 left-8", "top-24 right-12", "top-32 left-20", "top-12 right-6"].map((pos, i) => <div key={i} className={`absolute ${pos} w-3 h-3 rounded-full opacity-60`} style={{ background: ["#F97316", "#FDBA74", "#FB923C", "#FED7AA"][i] }} />)}
      <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mb-7" style={{ boxShadow: "0 8px 32px rgba(16,185,129,0.4)" }}><Check size={42} className="text-white" strokeWidth={3} /></div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">You&apos;re In! 🎉</h2>
      <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed max-w-xs"><span className="font-bold text-gray-700">{trip.host.name}</span> approved your request. Welcome to the crew!</p>
      <div className="w-full bg-white rounded-3xl p-4 border border-emerald-100 mb-6" style={{ boxShadow: "0 2px 16px rgba(16,185,129,0.1)" }}>
        <div className="flex items-center gap-3 mb-3"><img src={trip.host.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" /><div><p className="font-extrabold text-gray-900 text-sm">{trip.fromShort} → {trip.toShort}</p><p className="text-xs text-gray-500 mt-0.5">{trip.date} · {trip.time}</p></div><div className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-xl text-xs font-extrabold"><Check size={11} /> Accepted</div></div>
        <div className="flex items-center gap-2 pt-3 border-t border-gray-50"><div className="flex -space-x-2"><img src={trip.host.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />{trip.participants.map((p, i) => <img key={i} src={p.avatar} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />)}</div><span className="text-xs text-gray-500 ml-1">{trip.takenSeats + 2} travelers going</span></div>
      </div>
      <button onClick={onChat} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform mb-3" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>Open Group Chat 💬</button>
      <button onClick={onBack} className="text-gray-400 text-sm font-medium">Back to trips</button>
    </div>
  );
}

function ChatScreen({ trip, onBack }: { trip: Trip; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: prev.length + 1, sender: "Me", avatar: "", text: input, time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }), isMe: true }]);
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };
  return (
    <div className="flex flex-col h-full bg-[#FFF8F4]">
      <div className="flex items-center gap-3 px-4 pt-14 pb-3.5 bg-white border-b border-orange-50 flex-shrink-0" style={{ boxShadow: "0 2px 8px rgba(249,115,22,0.06)" }}>
        <button onClick={onBack} className="w-9 h-9 bg-[#FFF8F4] rounded-xl flex items-center justify-center"><ChevronLeft size={20} className="text-gray-700" /></button>
        <div className="relative flex-shrink-0"><img src={trip.host.avatar} alt="" className="w-10 h-10 rounded-2xl object-cover" /><div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" /></div>
        <div className="flex-1 min-w-0"><p className="font-extrabold text-gray-900 text-sm truncate">{trip.fromShort} → {trip.toShort}</p><p className="text-xs text-gray-400">{trip.takenSeats + 2} members · {trip.date}</p></div>
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
          <div className="flex-1 flex items-center gap-2 bg-[#FFF8F4] rounded-2xl px-4 py-2.5"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Message the crew..." className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" /></div>
          <button onClick={sendMessage} className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.4)" }}><Send size={15} className="text-white" /></button>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen() {
  const pastTrips = [
    { from: "NYC", to: "Washington DC", date: "Jun 14", transport: "car", rating: 5 },
    { from: "Boston", to: "New York", date: "May 28", transport: "train", rating: 5 },
    { from: "NYC", to: "Philadelphia", date: "May 10", transport: "bus", rating: 4 },
  ];
  const reviews = [
    { name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", text: "Alex was super friendly and punctual! Loved sharing the ride — great music taste too.", rating: 5, date: "Jun 14" },
    { name: "Marcus T.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", text: "Great travel companion. Respectful, funny, and made the journey fly by.", rating: 5, date: "May 28" },
  ];
  return (
    <div className="flex flex-col h-full bg-[#FFF8F4]">
      <div className="relative flex-shrink-0">
        <div className="h-36 bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden"><img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=288&fit=crop" alt="Travel cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" /></div>
        <button className="absolute top-12 right-4 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow"><Settings size={17} className="text-gray-700" /></button>
        <div className="absolute bottom-0 left-5 translate-y-1/2"><div className="relative"><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop" alt="Alex Chen" className="w-20 h-20 rounded-3xl object-cover border-4 border-white shadow-lg" /><div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-400 rounded-lg border-2 border-white flex items-center justify-center"><Check size={10} className="text-white" strokeWidth={3} /></div></div></div>
      </div>
      <div className="pt-14 px-5 pb-4 bg-white flex-shrink-0">
        <div className="flex items-start justify-between">
          <div><h2 className="text-xl font-extrabold text-gray-900">Alex Chen</h2><div className="flex items-center gap-1.5 mt-0.5"><MapPin size={12} className="text-orange-400" /><span className="text-xs text-gray-500">New York, NY · Member since 2023</span></div></div>
          <button className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-extrabold" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}>Edit Profile</button>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">{[{ value: "12", label: "Trips" }, { value: "4.9", label: "Rating" }, { value: "48", label: "Reviews" }, { value: "23", label: "Friends" }].map((stat, i) => <div key={i} className="flex flex-col items-center py-3 bg-orange-50 rounded-2xl"><span className="text-base font-extrabold text-gray-900">{stat.value}</span><span className="text-[10px] text-gray-500 mt-0.5 font-medium">{stat.label}</span></div>)}</div>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">Adventure seeker & weekend explorer 🌍 Always down for a road trip or new city. Dog parent 🐕</p>
        <div className="flex gap-2 mt-3 flex-wrap">{["Verified ID", "Top Rated", "Early Bird", "Road Tripper"].map((b) => <span key={b} className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-lg text-[11px] font-bold"><Sparkles size={9} />{b}</span>)}</div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-24" style={{ scrollbarWidth: "none" }}>
        <div className="pt-4 pb-2"><h3 className="font-extrabold text-gray-900 mb-3 text-sm">Travel History</h3><div className="space-y-2">{pastTrips.map((t, i) => <div key={i} className="bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}><div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0"><TransportIcon type={t.transport} size={15} /></div><div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-800 truncate">{t.from} → {t.to}</p><p className="text-xs text-gray-400">{t.date}</p></div><div className="flex items-center gap-0.5 flex-shrink-0">{Array.from({ length: t.rating }).map((_, j) => <Star key={j} size={11} className="fill-orange-400 text-orange-400" />)}</div></div>)}</div></div>
        <div className="pt-4"><h3 className="font-extrabold text-gray-900 mb-3 text-sm">Reviews (48)</h3><div className="space-y-3">{reviews.map((r, i) => <div key={i} className="bg-white rounded-2xl p-4 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}><div className="flex items-center gap-2.5 mb-2"><img src={r.avatar} alt={r.name} className="w-9 h-9 rounded-full object-cover" /><div className="flex-1"><p className="text-sm font-bold text-gray-800">{r.name}</p><p className="text-xs text-gray-400">{r.date}</p></div><div className="flex items-center gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={11} className="fill-orange-400 text-orange-400" />)}</div></div><p className="text-sm text-gray-600 leading-relaxed">{r.text}</p></div>)}</div></div>
      </div>
    </div>
  );
}

function BottomNav({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (t: Tab) => void }) {
  const tabs: { id: Tab; icon: React.ReactNode; label: string | null; isMain?: boolean }[] = [
    { id: "home", icon: <Home size={20} />, label: "Home" },
    { id: "explore", icon: <Compass size={20} />, label: "Explore" },
    { id: "create", icon: <Plus size={24} />, label: null, isMain: true },
    { id: "chat", icon: <MessageSquare size={20} />, label: "Chats" },
    { id: "profile", icon: <User size={20} />, label: "Profile" },
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
          <input placeholder="Search destinations..." className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none min-w-0" />
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-1">
        {([
          { label: "Home", screen: "home" as Screen, icon: <Home size={16} /> },
          { label: "Explore", screen: "explore" as Screen, icon: <Compass size={16} /> },
          { label: "Chats", screen: "chat" as Screen, icon: <MessageSquare size={16} /> },
          { label: "Profile", screen: "profile" as Screen, icon: <User size={16} /> },
        ]).map((item) => (
          <button key={item.screen} onClick={() => onNavigate(item.screen)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${activeScreen === item.screen ? "bg-orange-50 text-orange-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}>
            {item.icon}{item.label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
        <button onClick={onCreateClick} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold flex-shrink-0" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}>
          <Plus size={16} />Plan a Trip
        </button>
        <button className="relative w-9 h-9 bg-[#FFF8F4] rounded-xl flex items-center justify-center border border-orange-100 flex-shrink-0">
          <Bell size={17} className="text-gray-600" /><div className="absolute top-2 right-2 w-1.5 h-1.5 bg-orange-500 rounded-full" />
        </button>
        <button onClick={() => onNavigate("profile")} className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl transition-all flex-shrink-0 ${activeScreen === "profile" ? "bg-orange-50 border border-orange-100" : "hover:bg-gray-50"}`}>
          <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop" alt="Alex" className="w-8 h-8 rounded-xl object-cover" />
          <span className="text-sm font-bold text-gray-800 hidden xl:block">Alex Chen</span>
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
        <h3 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Filter size={11} />Filters</h3>

        <div className="mb-5">
          <p className="text-sm font-extrabold text-gray-800 mb-3">Transport</p>
          <div className="space-y-1.5">
            {[{ type: "car", icon: <Car size={14} />, label: "Car" }, { type: "train", icon: <Train size={14} />, label: "Train" }, { type: "bus", icon: <Bus size={14} />, label: "Bus" }, { type: "plane", icon: <Plane size={14} />, label: "Flight" }].map((t) => (
              <button key={t.type} onClick={() => toggleTransport(t.type)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedTransports.includes(t.type) ? "bg-orange-500 text-white" : "bg-[#FFF8F4] text-gray-600 hover:bg-orange-50"}`}>
                {t.icon}{t.label}{selectedTransports.includes(t.type) && <Check size={13} className="ml-auto" />}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm font-extrabold text-gray-800 mb-1">Min. Seats</p>
          <p className="text-xs text-gray-400 mb-3">At least <span className="font-bold text-orange-500">{minSeats}</span> open seat{minSeats > 1 ? "s" : ""}</p>
          <input type="range" min={1} max={6} value={minSeats} onChange={(e) => setMinSeats(Number(e.target.value))} className="w-full accent-orange-500" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>6</span></div>
        </div>

        {(selectedTransports.length > 0 || minSeats > 1) && (
          <button onClick={() => { setSelectedTransports([]); setMinSeats(1); }} className="w-full py-2 text-xs font-bold text-orange-500 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors mb-5">
            Reset Filters
          </button>
        )}

        <div className="pt-4 border-t border-orange-50">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><TrendingUp size={11} />Popular Routes</p>
          <div className="space-y-1">
            {[{ from: "NYC", to: "BOS", count: 12 }, { from: "LAX", to: "SAN", count: 8 }, { from: "CHI", to: "MKE", count: 6 }, { from: "DEN", to: "ASE", count: 4 }].map((r, i) => (
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
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Globe size={11} />Destinations</p>
          {["New York", "Los Angeles", "Chicago", "Miami", "Denver"].map((city) => (
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
          <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&h=448&fit=crop" alt="Travel" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-700/75 via-orange-500/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-10">
            <p className="text-orange-200 text-sm font-semibold mb-1 uppercase tracking-widest">Find your next adventure</p>
            <h1 className="text-4xl font-extrabold text-white mb-1 leading-tight">Your travel crew<br />is waiting for you</h1>
            <p className="text-white/70 text-sm mb-5">Browse {TRIPS.length * 20}+ upcoming trips across the US</p>
            <div className="flex items-center gap-0 bg-white rounded-2xl overflow-hidden max-w-2xl shadow-xl">
              <div className="flex items-center gap-2.5 px-5 py-3.5 flex-1">
                <MapPin size={16} className="text-orange-400 flex-shrink-0" />
                <input placeholder="From city..." className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none font-medium min-w-0" />
              </div>
              <div className="w-px h-8 bg-orange-100" />
              <div className="flex items-center gap-2.5 px-5 py-3.5 flex-1">
                <Navigation size={16} className="text-orange-400 flex-shrink-0" />
                <input placeholder="To city..." className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none font-medium min-w-0" />
              </div>
              <div className="w-px h-8 bg-orange-100" />
              <div className="flex items-center gap-2.5 px-5 py-3.5 flex-1">
                <Calendar size={16} className="text-orange-400 flex-shrink-0" />
                <input type="date" className="flex-1 text-sm text-gray-600 outline-none font-medium min-w-0 bg-transparent" />
              </div>
              <button className="px-6 py-3.5 bg-orange-500 text-white text-sm font-extrabold hover:bg-orange-600 transition-colors" style={{ boxShadow: "none" }}>Search</button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Chips + count */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {["All", "Car", "Train", "Bus", "Flight"].map((f) => (
              <button key={f} onClick={() => setActiveChip(f.toLowerCase())} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeChip === f.toLowerCase() ? "bg-orange-500 text-white" : "bg-white text-gray-600 border border-gray-100 hover:border-orange-200"}`} style={activeChip === f.toLowerCase() ? { boxShadow: "0 4px 12px rgba(249,115,22,0.3)" } : {}}>
                {f}
              </button>
            ))}
            <div className="ml-auto text-sm text-gray-400 font-medium">
              <span className="font-extrabold text-gray-800">{filteredTrips.length}</span> trips found
            </div>
          </div>

          {/* Grid */}
          {filteredTrips.length === 0 ? (
            <div className="flex flex-col items-center py-20"><Compass size={48} className="mb-4 text-orange-200" /><p className="text-base text-gray-400 font-medium">No trips match your filters</p><button onClick={() => { setSelectedTransports([]); setMinSeats(1); setActiveChip("all"); }} className="mt-3 text-orange-500 text-sm font-bold hover:underline">Clear all filters</button></div>
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
          <ChevronLeft size={16} />Back to trips
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
                { icon: <Calendar size={18} className="text-orange-500" />, label: trip.date, sub: "Date" },
                { icon: <Clock size={18} className="text-orange-500" />, label: trip.time, sub: "Departure" },
                { icon: <TransportIcon type={trip.transport} size={18} />, label: transportLabel(trip.transport), sub: "Transport" },
                { icon: <Users size={18} className="text-orange-500" />, label: `${seatsLeft} left`, sub: "Seats" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2 bg-orange-50 rounded-2xl py-4 px-3">
                  {item.icon}<span className="text-sm font-extrabold text-gray-800 text-center">{item.label}</span><span className="text-xs text-gray-400 text-center">{item.sub}</span>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl p-5 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
              <h3 className="font-extrabold text-gray-900 text-base mb-4">Your Host</h3>
              <div className="flex items-center gap-4">
                <img src={trip.host.avatar} alt={trip.host.name} className="w-16 h-16 rounded-2xl object-cover" />
                <div>
                  <p className="font-extrabold text-gray-900 text-lg">{trip.host.name}</p>
                  <div className="flex items-center gap-2 mt-1"><Star size={14} className="fill-orange-400 text-orange-400" /><span className="font-bold text-gray-700">{trip.host.rating}</span><span className="text-gray-400">·</span><span className="text-gray-500 text-sm">{trip.host.trips} trips hosted</span></div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="px-4 py-2 border border-orange-200 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors">View Profile</button>
                  <button className="px-4 py-2 bg-orange-50 text-orange-600 rounded-xl text-sm font-bold hover:bg-orange-100 transition-colors flex items-center gap-1.5"><MessageSquare size={14} />Message</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
              <h3 className="font-extrabold text-gray-900 text-base mb-3">About this Trip</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{trip.description}</p>
              <div className="flex gap-2 mt-4 flex-wrap">{trip.tags.map((tag) => <span key={tag} className="px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-sm font-bold">{tag}</span>)}</div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-orange-50" style={{ boxShadow: "0 2px 12px rgba(249,115,22,0.07)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-gray-900 text-base">Travelers Going ({trip.takenSeats + 1})</h3>
                <span className="text-sm text-orange-500 font-bold">{seatsLeft} spots remaining</span>
              </div>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex flex-col items-center gap-1.5"><img src={trip.host.avatar} alt={trip.host.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-orange-400 ring-offset-1" /><span className="text-xs text-orange-500 font-bold">Host</span></div>
                {trip.participants.map((p, i) => <div key={i} className="flex flex-col items-center gap-1.5"><img src={p.avatar} alt={p.name} className="w-14 h-14 rounded-2xl object-cover" /><span className="text-xs text-gray-500 font-medium">{p.name}</span></div>)}
                {Array.from({ length: Math.min(seatsLeft, 3) }).map((_, i) => <div key={i} className="flex flex-col items-center gap-1.5"><div className="w-14 h-14 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 flex items-center justify-center"><Plus size={20} className="text-orange-300" /></div><span className="text-xs text-gray-400">Open</span></div>)}
              </div>
            </div>
          </div>

          {/* Right: booking sidebar */}
          <div className="col-span-1">
            <div className="sticky top-4 bg-white rounded-3xl p-5 border border-orange-50 space-y-4" style={{ boxShadow: "0 4px 24px rgba(249,115,22,0.12)" }}>
              <div>
                <div className="text-2xl font-extrabold text-gray-900">Free to Join</div>
                <p className="text-sm text-gray-400 mt-0.5">Share experiences, not costs</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-4 space-y-2.5">
                {[
                  { icon: <MapPin size={13} className="text-orange-500" />, label: "From", value: trip.from },
                  { icon: <Navigation size={13} className="text-orange-500" />, label: "To", value: trip.to },
                  { icon: <Calendar size={13} className="text-orange-500" />, label: "Date", value: trip.date },
                  { icon: <Clock size={13} className="text-orange-500" />, label: "Time", value: trip.time },
                  { icon: <Users size={13} className="text-orange-500" />, label: "Seats Left", value: `${seatsLeft} of ${trip.seats}` },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2">{row.icon}<span className="text-xs text-gray-400 w-16 flex-shrink-0">{row.label}</span><span className="text-sm font-bold text-gray-800 ml-auto text-right">{row.value}</span></div>
                ))}
              </div>
              <button onClick={onJoin} className="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>
                Request to Join
              </button>
              <p className="text-center text-xs text-gray-400">Host reviews your request within 24h</p>
              <div className="border-t border-orange-50 pt-4 flex items-center gap-3">
                <img src={trip.host.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                <div><p className="text-sm font-bold text-gray-900">{trip.host.name}</p><div className="flex items-center gap-1"><Star size={11} className="fill-orange-400 text-orange-400" /><span className="text-xs font-semibold text-gray-600">{trip.host.rating}</span><span className="text-xs text-gray-400">· Verified</span></div></div>
              </div>
              <div className="flex gap-2 flex-wrap pt-1">{[{ icon: <Shield size={11} />, label: "Verified" }, { icon: <Star size={11} />, label: "Top Rated" }, { icon: <Check size={11} />, label: "ID Checked" }].map((b, i) => <div key={i} className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-xs font-bold">{b.icon}{b.label}</div>)}</div>
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
          <h2 className="text-xl font-extrabold text-gray-900 flex-1">Plan a New Trip</h2>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"><X size={16} className="text-gray-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ scrollbarWidth: "thin" }}>
          <div className="grid grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Route</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 bg-[#FFF8F4] rounded-xl px-3 py-2.5"><div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0"><MapPin size={13} className="text-orange-500" /></div><input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Departure city" className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" /></div>
                  <div className="flex justify-center"><button className="w-7 h-7 rounded-lg bg-white border border-orange-100 flex items-center justify-center shadow-sm"><ArrowUpDown size={12} className="text-orange-500" /></button></div>
                  <div className="flex items-center gap-3 bg-[#FFF8F4] rounded-xl px-3 py-2.5"><div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0"><Navigation size={13} className="text-white" /></div><input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destination city" className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" /></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Date & Time</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 bg-[#FFF8F4] rounded-xl px-3 py-2.5"><Calendar size={13} className="text-orange-400 flex-shrink-0" /><input type="date" className="flex-1 bg-transparent text-xs text-gray-700 outline-none min-w-0" /></div>
                  <div className="flex items-center gap-2 bg-[#FFF8F4] rounded-xl px-3 py-2.5"><Clock size={13} className="text-orange-400 flex-shrink-0" /><input type="time" className="flex-1 bg-transparent text-xs text-gray-700 outline-none min-w-0" /></div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Transport</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {([{ type: "car" as TransportType, icon: <Car size={16} />, label: "Car" }, { type: "train" as TransportType, icon: <Train size={16} />, label: "Train" }, { type: "bus" as TransportType, icon: <Bus size={16} />, label: "Bus" }, { type: "plane" as TransportType, icon: <Plane size={16} />, label: "Flight" }]).map((t) => (
                    <button key={t.type} onClick={() => setTransport(t.type)} className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-bold transition-all ${transport === t.type ? "bg-orange-500 text-white" : "bg-[#FFF8F4] text-gray-600 hover:bg-orange-50"}`}>{t.icon}<span>{t.label}</span></button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Available Seats</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSeats(Math.max(1, seats - 1))} className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-extrabold text-xl">−</button>
                  <div className="flex-1 text-center"><span className="text-3xl font-extrabold text-gray-900">{seats}</span><p className="text-xs text-gray-400">seats</p></div>
                  <button onClick={() => setSeats(Math.min(8, seats + 1))} className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-extrabold text-xl" style={{ boxShadow: "0 4px 8px rgba(249,115,22,0.35)" }}>+</button>
                </div>
                <div className="flex gap-1 mt-3 justify-center">{Array.from({ length: seats }).map((_, i) => <div key={i} className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center"><User size={12} className="text-orange-400" /></div>)}</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-orange-50 flex-1" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Description</p>
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Tell travelers about the vibe, what to expect, meeting point..." rows={5} className="w-full bg-[#FFF8F4] rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none resize-none" />
                <p className="text-right text-xs text-gray-400 mt-1">{desc.length}/280</p>
              </div>

              {/* Preview card */}
              {(from || to) && (
                <div className="bg-orange-500 rounded-2xl p-4 text-white">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest opacity-70 mb-2">Preview</p>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-lg">{from.slice(0, 3).toUpperCase() || "???"}</span>
                    <ArrowRight size={16} className="opacity-70" />
                    <span className="font-extrabold text-lg">{to.slice(0, 3).toUpperCase() || "???"}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs opacity-80">
                    <span className="flex items-center gap-1"><TransportIcon type={transport} size={11} />{transportLabel(transport)}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{seats} seats</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-3 bg-white border-t border-orange-50">
          <button className="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>
            Publish Trip ✈︎
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
    setMessages((prev) => [...prev, { id: prev.length + 1, sender: "Me", avatar: "", text: input, time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }), isMe: true }]);
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Conversations list */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-orange-50 flex flex-col">
        <div className="p-4 border-b border-orange-50">
          <h3 className="font-extrabold text-gray-900 text-sm mb-3">Trip Chats</h3>
          <div className="flex items-center gap-2 bg-[#FFF8F4] rounded-xl px-3 py-2"><Search size={13} className="text-gray-400" /><input placeholder="Search chats..." className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none" /></div>
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
          <div><p className="font-extrabold text-gray-900">{trip.fromShort} → {trip.toShort}</p><p className="text-xs text-gray-400">{trip.takenSeats + 2} members · {trip.date}</p></div>
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
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Message the crew..." className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
            </div>
            <button onClick={sendMessage} className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.4)" }}><Send size={15} className="text-white" /></button>
          </div>
        </div>
      </div>

      {/* Trip info panel */}
      <aside className="w-72 flex-shrink-0 bg-white border-l border-orange-50 overflow-y-auto p-5" style={{ scrollbarWidth: "none" }}>
        <h3 className="font-extrabold text-gray-900 mb-4">Trip Details</h3>
        <div className="relative h-28 rounded-2xl overflow-hidden mb-4 bg-orange-200">
          <img src={trip.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between"><span className="text-white font-extrabold text-lg">{trip.fromShort}</span><ArrowRight size={16} className="text-orange-300" /><span className="text-white font-extrabold text-lg">{trip.toShort}</span></div>
        </div>
        <div className="space-y-2 mb-5">{[{ icon: <Calendar size={13} className="text-orange-400" />, label: trip.date }, { icon: <Clock size={13} className="text-orange-400" />, label: trip.time }, { icon: <TransportIcon type={trip.transport} size={13} />, label: transportLabel(trip.transport) }, { icon: <Users size={13} className="text-orange-400" />, label: `${trip.takenSeats + 2} members` }].map((r, i) => <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">{r.icon}{r.label}</div>)}</div>
        <div className="border-t border-orange-50 pt-4">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">Members</p>
          <div className="space-y-3">
            {[{ name: trip.host.name, avatar: trip.host.avatar, role: "Host", rating: trip.host.rating as number | null }, ...trip.participants.map((p) => ({ name: p.name, avatar: p.avatar, role: "Traveler", rating: null as number | null }))].map((member, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <img src={member.avatar} alt={member.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-bold text-gray-800 truncate">{member.name}</p><p className="text-xs text-gray-400">{member.role}</p></div>
                {member.rating && <div className="flex items-center gap-0.5 flex-shrink-0"><Star size={11} className="fill-orange-400 text-orange-400" /><span className="text-xs font-bold text-gray-600">{member.rating}</span></div>}
              </div>
            ))}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0"><User size={14} className="text-orange-400" /></div>
              <div><p className="text-sm font-bold text-orange-500">You</p><p className="text-xs text-gray-400">Joined</p></div>
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
    { from: "NYC", to: "Washington DC", date: "Jun 14", transport: "car", rating: 5 },
    { from: "Boston", to: "New York", date: "May 28", transport: "train", rating: 5 },
    { from: "NYC", to: "Philadelphia", date: "May 10", transport: "bus", rating: 4 },
    { from: "Chicago", to: "Milwaukee", date: "Apr 22", transport: "train", rating: 5 },
    { from: "NYC", to: "Atlantic City", date: "Apr 5", transport: "car", rating: 4 },
  ];
  const reviews = [
    { name: "Sarah M.", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop", text: "Alex was super friendly and punctual! Loved sharing the ride — great music taste too.", rating: 5, date: "Jun 14" },
    { name: "Marcus T.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop", text: "Great travel companion. Respectful, funny, and made the journey fly by.", rating: 5, date: "May 28" },
    { name: "Priya K.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop", text: "Very organized and communicated well before the trip. Would absolutely travel with Alex again!", rating: 5, date: "May 10" },
  ];
  const upcomingTrips = TRIPS.slice(0, 2);

  return (
    <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
      {/* Cover */}
      <div className="relative h-52 bg-gradient-to-br from-orange-400 to-orange-600 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&h=416&fit=crop" alt="Cover" className="w-full h-full object-cover opacity-50 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/40 to-transparent" />
        <button className="absolute top-6 right-6 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow"><Settings size={18} className="text-gray-700" /></button>
      </div>

      <div className="px-10 pb-12">
        {/* Profile header */}
        <div className="flex items-end gap-6 -mt-12 mb-6">
          <div className="relative flex-shrink-0">
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop" alt="Alex Chen" className="w-28 h-28 rounded-3xl object-cover border-4 border-white shadow-xl" />
            <div className="absolute bottom-1 right-1 w-7 h-7 bg-emerald-400 rounded-xl border-2 border-white flex items-center justify-center"><Check size={12} className="text-white" strokeWidth={3} /></div>
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Alex Chen</h1>
                <div className="flex items-center gap-2 mt-1"><MapPin size={14} className="text-orange-400" /><span className="text-gray-500 text-sm">New York, NY · Member since 2023</span></div>
                <p className="text-gray-600 text-sm mt-2 max-w-lg">Adventure seeker & weekend explorer 🌍 Always down for a road trip or new city. Dog parent 🐕</p>
                <div className="flex gap-2 mt-3 flex-wrap">{["Verified ID", "Top Rated", "Early Bird", "Road Tripper"].map((b) => <span key={b} className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold"><Sparkles size={10} />{b}</span>)}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="px-4 py-2.5 border border-orange-200 text-orange-500 rounded-xl text-sm font-bold hover:bg-orange-50 transition-colors">Share Profile</button>
                <button className="px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors" style={{ boxShadow: "0 4px 12px rgba(249,115,22,0.35)" }}>Edit Profile</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[{ value: "12", label: "Trips Taken", icon: <Navigation size={18} className="text-orange-500" /> }, { value: "4.9", label: "Avg Rating", icon: <Star size={18} className="text-orange-500" /> }, { value: "48", label: "Reviews", icon: <MessageSquare size={18} className="text-orange-500" /> }, { value: "23", label: "Friends", icon: <Users size={18} className="text-orange-500" /> }].map((stat, i) => (
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
            <h3 className="font-extrabold text-gray-900 mb-4 text-base">Travel History</h3>
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
            <h3 className="font-extrabold text-gray-900 mb-4 text-base">My Upcoming Trips</h3>
            <div className="space-y-3">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="bg-white rounded-2xl overflow-hidden border border-orange-50" style={{ boxShadow: "0 1px 8px rgba(249,115,22,0.06)" }}>
                  <div className="relative h-24 bg-orange-100"><img src={trip.image} alt="" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" /><div className="absolute bottom-2 left-3 right-3 flex items-center justify-between"><span className="text-white font-extrabold">{trip.fromShort}</span><ArrowRight size={14} className="text-orange-300" /><span className="text-white font-extrabold">{trip.toShort}</span></div></div>
                  <div className="p-3"><div className="flex items-center gap-2 text-xs text-gray-500"><Calendar size={11} className="text-orange-400" />{trip.date}<Clock size={11} className="text-orange-400 ml-1" />{trip.time}</div></div>
                </div>
              ))}
              <button className="w-full py-2.5 text-sm font-bold text-orange-500 border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors">Create a New Trip</button>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="font-extrabold text-gray-900 mb-4 text-base">Reviews (48)</h3>
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
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Request Sent!</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">Your request to join <span className="font-bold text-gray-800">{trip.host.name}&apos;s</span> trip from <span className="font-bold text-gray-800">{trip.fromShort} → {trip.toShort}</span> is awaiting approval.</p>
            <div className="bg-orange-50 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-center gap-3"><img src={trip.host.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" /><div><p className="font-extrabold text-gray-900">{trip.fromShort} → {trip.toShort}</p><p className="text-sm text-gray-500">{trip.date} · {trip.time}</p></div><div className="ml-auto px-3 py-1.5 bg-orange-100 text-orange-600 rounded-xl text-xs font-extrabold">Pending…</div></div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" /><div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0.15s" }} /><div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
              <span className="ml-1">Waiting for host to respond</span>
            </div>
            <button onClick={onBack} className="text-gray-400 text-sm font-medium hover:text-gray-600">← Back to trips</button>
          </>
        ) : (
          <>
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6" style={{ boxShadow: "0 8px 32px rgba(16,185,129,0.4)" }}><Check size={36} className="text-white" strokeWidth={3} /></div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">You&apos;re In! 🎉</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed"><span className="font-bold text-gray-700">{trip.host.name}</span> approved your request. Welcome to the crew!</p>
            <div className="bg-emerald-50 rounded-2xl p-4 mb-6 text-left border border-emerald-100">
              <div className="flex items-center gap-3 mb-3"><img src={trip.host.avatar} alt="" className="w-12 h-12 rounded-2xl object-cover" /><div><p className="font-extrabold text-gray-900">{trip.fromShort} → {trip.toShort}</p><p className="text-sm text-gray-500">{trip.date} · {trip.time}</p></div><div className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-xl text-xs font-extrabold"><Check size={11} /> Accepted</div></div>
              <div className="flex -space-x-2">{[trip.host.avatar, ...trip.participants.map((p) => p.avatar)].map((av, i) => <img key={i} src={av} alt="" className="w-8 h-8 rounded-full border-2 border-white object-cover" />)}</div>
            </div>
            <button onClick={onChat} className="w-full py-3.5 bg-orange-500 text-white rounded-2xl font-extrabold text-base active:scale-95 transition-transform mb-3" style={{ boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }}>Open Group Chat 💬</button>
            <button onClick={onBack} className="text-gray-400 text-sm font-medium hover:text-gray-600">← Back to trips</button>
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
