import { Bell, Plus, Users, Briefcase, TrendingUp, Star, MapPin, Shield, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VerifiedBadge from "@/components/VerifiedBadge";
import { Button } from "@/components/ui/button";
import BottomNavCompany from "@/components/BottomNavCompany";
import StatCard from "@/components/StatCard";
import ReputationBadge from "@/components/ReputationBadge";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import logo from "@/assets/flinker-logo.png";
import { toast } from "sonner";

const suggestedWorkers = [
  { name: "Ana Souza", role: "Garçonete", rating: 4.9, flinks: 52, location: "São Paulo", medal: "Ouro" as const, avatar: "AS", comment: "Excelente profissional, super pontual.", verified: true },
  { name: "Bruno Lima", role: "Auxiliar de Carga", rating: 4.7, flinks: 38, location: "Guarulhos", medal: "Prata" as const, avatar: "BL", comment: "Muito dedicado e confiável.", verified: false },
  { name: "Carla Mendes", role: "Promotora", rating: 4.6, flinks: 29, location: "São Paulo", medal: "Prata" as const, avatar: "CM", comment: "Ótima comunicação com clientes.", verified: true },
];

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { status, loading } = useCompanyProfile();
  const isProfileIncomplete = status === "incomplete";

  const handleCreateFlink = () => {
    if (isProfileIncomplete) {
      toast.error("Complete seu cadastro empresarial para liberar a criação de flinks e garantir segurança nas transações.");
      navigate("/company-profile");
      return;
    }
    // TODO: navigate to flink creation
    toast.info("Funcionalidade de criação de flink em breve.");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-navy px-5 pb-6 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Flinker" className="h-8 w-8" />
            <div>
              <p className="text-sm text-muted-foreground">Empresa</p>
              <h1 className="text-xl font-bold text-foreground">Eventos Premium</h1>
            </div>
          </div>
          <button className="relative rounded-full bg-secondary p-2.5">
            <Bell className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatCard icon={Briefcase} label="Flinks ativos" value="3" />
          <StatCard icon={Briefcase} label="Total flinks" value="47" />
          <StatCard icon={TrendingUp} label="Taxa" value="95%" />
        </div>
      </div>

      <div className="px-5 pt-6">
        {/* Incomplete profile alert */}
        {isProfileIncomplete && (
          <button
            onClick={() => navigate("/company-profile")}
            className="mb-4 flex w-full items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-left transition-all hover:bg-destructive/10"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">🔴 Cadastro incompleto</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Complete seu cadastro empresarial para liberar a criação de flinks e garantir segurança nas transações.
              </p>
            </div>
          </button>
        )}

        {/* Flink explanation */}
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">O que é um Flink?</span>{" "}
            Flinks são oportunidades de trabalho rápidas disponíveis na plataforma Flinker — com segurança, pagamento garantido e avaliação.
          </p>
        </div>

        {/* Payment guarantee notice */}
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-warning/5 border border-warning/10 p-3">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
          <p className="text-[11px] text-muted-foreground">
            O pagamento será liberado apenas após a execução do serviço. Para publicar um flink, é necessário garantir o valor do pagamento.
          </p>
        </div>

        {/* Post Flink CTA */}
        <Button
          onClick={handleCreateFlink}
          className={`w-full gap-2 rounded-xl py-6 text-base font-bold text-primary-foreground ${
            isProfileIncomplete
              ? "bg-muted-foreground/50 cursor-not-allowed"
              : "gradient-primary glow-orange"
          }`}
        >
          <Plus className="h-5 w-5" />
          Publicar Novo Flink
        </Button>

        {/* Suggested Workers */}
        <h2 className="mt-8 text-lg font-bold text-foreground">Profissionais Sugeridos</h2>
        <p className="text-xs text-muted-foreground">Baseado nos seus últimos flinks</p>

        <div className="mt-4 space-y-3">
          {suggestedWorkers.map((worker, i) => (
            <div key={i} className="gradient-card rounded-2xl border border-border p-4 card-hover">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                  {worker.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="font-bold text-foreground">{worker.name}</h3>
                    {worker.verified && <VerifiedBadge size="sm" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{worker.role} • {worker.flinks} flinks</p>
                  <div className="mt-1 flex items-center gap-3">
                    <ReputationBadge medal={worker.medal} stars={worker.rating} size="sm" />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {worker.location}
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground italic">"{worker.comment}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNavCompany />
    </div>
  );
};

export default CompanyDashboard;
