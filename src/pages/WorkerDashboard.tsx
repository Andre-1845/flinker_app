import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Star, TrendingUp, Briefcase, DollarSign, Calendar, Navigation, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import StatCard from "@/components/StatCard";
import GigCard from "@/components/GigCard";
import ReputationBadge from "@/components/ReputationBadge";
import { useAuth } from "@/contexts/AuthContext";
import { listActiveFlinks } from "@/lib/flinks";
import { listMyMatches } from "@/lib/matches";
import type { Flink, FlinkMatch } from "@/lib/types";
import logo from "@/assets/flinker-logo.png";
import { toast } from "sonner";

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recommended, setRecommended] = useState<Flink[]>([]);
  const [myMatches, setMyMatches] = useState<FlinkMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listActiveFlinks(), listMyMatches()])
      .then(([flinksRes, matchesRes]) => {
        setRecommended(flinksRes.data.slice(0, 3));
        setMyMatches(matchesRes.data);
      })
      .catch(() => toast.error("Não foi possível carregar seus dados."))
      .finally(() => setLoading(false));
  }, []);

  const completedCount = myMatches.filter((m) => m.flink?.status === "completed").length;
  const reputation = user?.professional?.reputation ?? 0;

  // Próximo compromisso confirmado que ainda não teve check-in
  const nextConfirmed = myMatches.find((m) => m.status === "confirmed" && !m.checked_in_at);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-navy px-5 pb-6 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Flinker" className="h-8 w-8" />
            <div>
              <p className="text-sm text-muted-foreground">Olá 👋</p>
              <h1 className="text-xl font-bold text-foreground">{user?.name ?? "Profissional"}</h1>
              <ReputationBadge medal={reputation >= 4.5 ? "Ouro" : reputation >= 4 ? "Prata" : "Bronze"} stars={reputation} size="sm" />
            </div>
          </div>
          <button className="relative rounded-full bg-secondary p-2.5">
            <Bell className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatCard icon={Star} label="Estrelas" value={reputation.toFixed(1)} />
          <StatCard icon={Briefcase} label="Flinks" value={String(completedCount)} />
          <StatCard icon={DollarSign} label="Saldo" value="Em breve" />
        </div>
      </div>

      <div className="px-5 pt-6">
        {nextConfirmed?.flink && (
          <button
            onClick={() => navigate(`/gig-checkin/${nextConfirmed.id}`)}
            className="mb-6 w-full rounded-2xl border border-primary/20 bg-primary/5 p-4 text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{nextConfirmed.flink.activity_type}</p>
                <p className="text-xs text-muted-foreground">
                  {nextConfirmed.flink.company?.responsible_name ?? "Empresa"} •{" "}
                  {new Date(nextConfirmed.flink.start_date_time).toLocaleString("pt-BR")} • R${" "}
                  {nextConfirmed.flink.pricing.net_value.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-1 rounded-full gradient-primary px-3 py-1.5 glow-orange">
                <Navigation className="h-3.5 w-3.5 text-primary-foreground" />
                <span className="text-[10px] font-bold text-primary-foreground">Check-in</span>
              </div>
            </div>
          </button>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Flinks Recomendados</h2>
          <div className="flex items-center gap-1 text-primary">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-semibold">Perto de você</span>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recommended.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum Flink disponível no momento.</p>
          ) : (
            recommended.map((flink) => (
              <GigCard
                key={flink.id}
                title={flink.activity_type}
                company={flink.company?.responsible_name ?? "Empresa"}
                location={flink.location}
                payment={`R$ ${flink.pricing.net_value.toFixed(2)}/dia`}
                date={new Date(flink.start_date_time).toLocaleString("pt-BR")}
                rating={flink.company?.reputation ?? 0}
                tags={[flink.activity_type]}
                matchPercent={undefined}
              />
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default WorkerDashboard;
