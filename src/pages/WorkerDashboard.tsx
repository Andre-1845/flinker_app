import { useNavigate } from "react-router-dom";
import { Bell, Star, TrendingUp, Briefcase, DollarSign, Calendar, Navigation } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import StatCard from "@/components/StatCard";
import GigCard from "@/components/GigCard";
import ReputationBadge from "@/components/ReputationBadge";
import logo from "@/assets/flinker-logo.png";

const mockGigs = [
  {
    title: "Garçom para Evento",
    company: "Eventos Premium",
    location: "São Paulo, SP",
    payment: "R$ 180/dia",
    date: "Amanhã, 18h-23h",
    rating: 4.8,
    tags: ["Garçom", "Evento", "Noturno"],
    matchPercent: 95,
  },
  {
    title: "Auxiliar de Carga",
    company: "LogiTrans",
    location: "Guarulhos, SP",
    payment: "R$ 150/dia",
    date: "15 Abr, 6h-14h",
    rating: 4.5,
    tags: ["Logística", "Carga", "Manhã"],
    matchPercent: 87,
  },
  {
    title: "Promotor de Vendas",
    company: "SuperMart",
    location: "Centro, SP",
    payment: "R$ 120/dia",
    date: "16-17 Abr, 9h-18h",
    rating: 4.2,
    tags: ["Vendas", "Promoção"],
    matchPercent: 78,
  },
];

const WorkerDashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-navy px-5 pb-6 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Flinker" className="h-8 w-8" />
            <div>
              <p className="text-sm text-muted-foreground">Olá 👋</p>
              <h1 className="text-xl font-bold text-foreground">Carlos Silva</h1>
              <ReputationBadge medal="Prata" stars={3.6} size="sm" />
            </div>
          </div>
          <button className="relative rounded-full bg-secondary p-2.5">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              3
            </span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatCard icon={Star} label="Estrelas" value="3.6" />
          <StatCard icon={Briefcase} label="Flinks" value="24" />
          <StatCard icon={DollarSign} label="Saldo" value="R$ 1.850" />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-6">
        {/* Today */}
        <button
          onClick={() => navigate("/gig-checkin")}
          className="mb-6 w-full rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Hoje - Garçom VIP</p>
              <p className="text-xs text-muted-foreground">Eventos Premium • 18h-23h • R$ 200</p>
            </div>
            <div className="flex items-center gap-1 rounded-full gradient-primary px-3 py-1.5 glow-orange">
              <Navigation className="h-3.5 w-3.5 text-primary-foreground" />
              <span className="text-[10px] font-bold text-primary-foreground">Check-in</span>
            </div>
          </div>
        </button>

        {/* Recommended Flinks */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Flinks Recomendados</h2>
          <div className="flex items-center gap-1 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold">Smart Match</span>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {mockGigs.map((gig, i) => (
            <GigCard key={i} {...gig} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default WorkerDashboard;
