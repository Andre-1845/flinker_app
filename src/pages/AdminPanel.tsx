import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  Settings,
  Shield,
  Ban,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";

const mockTransactions = [
  { id: "TXN-001", company: "Eventos Premium", worker: "Carlos Silva", gross: 200, commission: 16, net: 184, status: "completed", date: "10 Abr" },
  { id: "TXN-002", company: "SuperMart", worker: "Ana Costa", gross: 120, commission: 9.6, net: 110.4, status: "completed", date: "08 Abr" },
  { id: "TXN-003", company: "LogiTrans", worker: "João Santos", gross: 150, commission: 12, net: 138, status: "pending", date: "Hoje" },
];

const mockAlerts = [
  { id: 1, type: "payment_outside", user: "TechCorp", description: "Check-in confirmado sem pagamento pela plataforma", severity: "high" },
  { id: 2, type: "repeated_pattern", user: "Carlos + Eventos Premium", description: "5 flinks consecutivos — padrão incomum", severity: "medium" },
  { id: 3, type: "cancellation", user: "FastJobs", description: "3 cancelamentos em 7 dias", severity: "low" },
];

type Tab = "overview" | "transactions" | "fraud" | "config";

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [commissionRate, setCommissionRate] = useState("8");

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Visão Geral", icon: TrendingUp },
    { key: "transactions", label: "Transações", icon: DollarSign },
    { key: "fraud", label: "Alertas", icon: AlertTriangle },
    { key: "config", label: "Config", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="gradient-navy px-5 pb-6 pt-12">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full bg-secondary p-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Painel Admin</h1>
            <p className="text-xs text-muted-foreground">Gerenciamento da plataforma</p>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatCard icon={DollarSign} label="Receita Flinker" value="R$ 4.2k" />
            <StatCard icon={Users} label="Usuários ativos" value="347" />
            <StatCard icon={TrendingUp} label="Flinks este mês" value="89" />
            <StatCard icon={AlertTriangle} label="Alertas fraude" value="3" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pt-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
              activeTab === tab.key
                ? "gradient-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-5 pt-5">
        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">RESUMO FINANCEIRO</h3>
            <div className="rounded-2xl bg-card p-4 space-y-3">
              {[
                { label: "Volume total (mês)", value: "R$ 52.800" },
                { label: "Comissão Flinker (8%)", value: "R$ 4.224" },
                { label: "Pagamentos pendentes", value: "R$ 1.350" },
                { label: "Saques realizados", value: "R$ 38.400" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-sm font-bold text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions */}
        {activeTab === "transactions" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">TRANSAÇÕES RECENTES</h3>
            {mockTransactions.map((tx) => (
              <div key={tx.id} className="rounded-xl bg-card p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.company} → {tx.worker}</p>
                    <p className="text-[11px] text-muted-foreground">{tx.id} • {tx.date}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      tx.status === "completed"
                        ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {tx.status === "completed" ? "Concluída" : "Pendente"}
                  </span>
                </div>
                <div className="mt-2 flex gap-4 text-[11px] text-muted-foreground">
                  <span>Bruto: R$ {tx.gross.toFixed(2)}</span>
                  <span className="text-primary">Comissão: R$ {tx.commission.toFixed(2)}</span>
                  <span>Líquido: R$ {tx.net.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fraud Alerts */}
        {activeTab === "fraud" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">ALERTAS DE FRAUDE</h3>
            {mockAlerts.map((alert) => (
              <div key={alert.id} className="rounded-xl bg-card p-3 border-l-4 border-l-destructive/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle
                        className={`h-4 w-4 ${
                          alert.severity === "high"
                            ? "text-destructive"
                            : alert.severity === "medium"
                            ? "text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                      <p className="text-sm font-medium text-foreground">{alert.user}</p>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{alert.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button className="rounded-lg bg-secondary p-1.5">
                      <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="rounded-lg bg-destructive/10 p-1.5">
                      <Ban className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-xl bg-primary/5 border border-primary/10 p-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold text-foreground">Sistema Antifraude Ativo</p>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Monitoramento automático de check-ins sem pagamento, padrões repetitivos e cancelamentos.
              </p>
            </div>
          </div>
        )}

        {/* Config */}
        {activeTab === "config" && (
          <div className="space-y-5">
            <h3 className="text-sm font-semibold text-muted-foreground">CONFIGURAÇÕES</h3>

            <div className="rounded-2xl bg-card p-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Taxa de Comissão (%)</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-24 rounded-xl border border-border bg-secondary p-2.5 text-center text-lg font-bold text-foreground focus:border-primary focus:outline-none"
                  />
                  <span className="text-sm text-muted-foreground">% de cada transação</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Atual: 8% • Alterações aplicam imediatamente</p>
              </div>

              <div className="border-t border-border pt-4">
                <label className="text-xs font-medium text-muted-foreground">Período de Segurança (horas)</label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    defaultValue={48}
                    className="w-24 rounded-xl border border-border bg-secondary p-2.5 text-center text-lg font-bold text-foreground focus:border-primary focus:outline-none"
                  />
                  <span className="text-sm text-muted-foreground">horas até liberar saldo</span>
                </div>
              </div>
            </div>

            <Button className="w-full gradient-primary glow-orange rounded-xl py-5 font-bold text-primary-foreground">
              Salvar Configurações
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
