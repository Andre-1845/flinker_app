import { useEffect, useState } from "react";
import { Bell, Plus, Briefcase, TrendingUp, MapPin, Shield, AlertCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNavCompany from "@/components/BottomNavCompany";
import StatCard from "@/components/StatCard";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useAuth } from "@/contexts/AuthContext";
import { listCompanyFlinks } from "@/lib/flinks";
import type { Flink } from "@/lib/types";
import logo from "@/assets/flinker-logo.png";
import { toast } from "sonner";

const statusLabel: Record<Flink["status"], string> = {
  open: "Aberto",
  matched: "Com candidato",
  confirmed: "Confirmado",
  in_progress: "Em execução",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { status, loading: profileLoading } = useCompanyProfile();
  const isProfileIncomplete = status === "incomplete";

  const [flinks, setFlinks] = useState<Flink[]>([]);
  const [loadingFlinks, setLoadingFlinks] = useState(true);

  useEffect(() => {
    if (!user?.company) {
      setLoadingFlinks(false);
      return;
    }
    listCompanyFlinks(user.company.id)
      .then((res) => setFlinks(res.data))
      .catch(() => toast.error("Não foi possível carregar seus Flinks."))
      .finally(() => setLoadingFlinks(false));
  }, [user]);

  const activeCount = flinks.filter((f) => f.status === "open" || f.status === "matched").length;
  const completedCount = flinks.filter((f) => f.status === "completed").length;
  const approvalRate = flinks.length > 0 ? Math.round(((flinks.length - flinks.filter((f) => f.status === "cancelled").length) / flinks.length) * 100) : 0;

  const handleCreateFlink = () => {
    if (isProfileIncomplete) {
      toast.error("Complete seu cadastro empresarial para liberar a criação de flinks e garantir segurança nas transações.");
      navigate("/company-profile");
      return;
    }
    navigate("/company-flinks/new");
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
              <h1 className="text-xl font-bold text-foreground">{user?.name ?? "Minha Empresa"}</h1>
            </div>
          </div>
          <button className="relative rounded-full bg-secondary p-2.5">
            <Bell className="h-5 w-5 text-foreground" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatCard icon={Briefcase} label="Flinks ativos" value={String(activeCount)} />
          <StatCard icon={Briefcase} label="Total flinks" value={String(flinks.length)} />
          <StatCard icon={TrendingUp} label="Taxa" value={`${approvalRate}%`} />
        </div>
      </div>

      <div className="px-5 pt-6">
        {/* Alerta de cadastro incompleto */}
        {!profileLoading && isProfileIncomplete && (
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

        {/* Explicação sobre Flink */}
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">O que é um Flink?</span>{" "}
            Flinks são oportunidades de trabalho rápidas disponíveis na plataforma Flinker — com segurança, pagamento garantido e avaliação.
          </p>
        </div>

        {/* Aviso de garantia de pagamento */}
        <div className="mb-4 flex items-start gap-2 rounded-xl bg-warning/5 border border-warning/10 p-3">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
          <p className="text-[11px] text-muted-foreground">
            O pagamento será liberado apenas após a execução do serviço. Para publicar um flink, é necessário garantir o valor do pagamento.
          </p>
        </div>

        {/* CTA de publicar Flink */}
        <button
          onClick={handleCreateFlink}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-primary-foreground ${
            isProfileIncomplete ? "bg-muted-foreground/50 cursor-not-allowed" : "gradient-primary glow-orange"
          }`}
        >
          <Plus className="h-5 w-5" />
          Publicar Novo Flink
        </button>

        {/* Meus Flinks */}
        <h2 className="mt-8 text-lg font-bold text-foreground">Meus Flinks</h2>
        <p className="text-xs text-muted-foreground">Publicados recentemente</p>

        <div className="mt-4 space-y-3">
          {loadingFlinks ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : flinks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Você ainda não publicou nenhum Flink.
            </p>
          ) : (
            flinks.map((flink) => (
              <div key={flink.id} className="gradient-card rounded-2xl border border-border p-4 card-hover">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-foreground">{flink.activity_type}</h3>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-secondary-foreground">
                    {statusLabel[flink.status]}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {flink.location}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {new Date(flink.start_date_time).toLocaleString("pt-BR")}
                </p>
                <p className="mt-1.5 text-sm font-semibold text-foreground">
                  Total: R$ {flink.pricing.total_value.toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNavCompany />
    </div>
  );
};

export default CompanyDashboard;
