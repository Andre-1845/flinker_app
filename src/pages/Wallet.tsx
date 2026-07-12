import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  TrendingUp,
  ChevronRight,
  ArrowLeft,
  Shield,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import ProfileRegistrationAlert from "@/components/ProfileRegistrationAlert";

// Mock data
const walletData = {
  available: 1850.0,
  pending: 400.0,
  total: 2250.0,
};

const movements = [
  { id: 1, type: "credit" as const, description: "Garçom VIP - Eventos Premium", amount: 184.0, date: "10 Abr", status: "available" as const },
  { id: 2, type: "credit" as const, description: "Promotor - SuperMart", amount: 110.4, date: "08 Abr", status: "available" as const },
  { id: 3, type: "withdraw" as const, description: "Saque via Pix", amount: -500.0, date: "07 Abr", status: "withdrawn" as const },
  { id: 4, type: "credit" as const, description: "Auxiliar de Carga - LogiTrans", amount: 138.0, date: "05 Abr", status: "available" as const },
  { id: 5, type: "credit" as const, description: "Garçom Evento Corporativo", amount: 200.0, date: "Hoje", status: "pending" as const },
  { id: 6, type: "credit" as const, description: "Barista - CaféTop", amount: 200.0, date: "Hoje", status: "pending" as const },
];

const Wallet = () => {
  const navigate = useNavigate();
  const [showWithdraw, setShowWithdraw] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-navy px-5 pb-8 pt-12">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full bg-secondary p-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Minha Carteira</h1>
            <p className="text-xs text-muted-foreground">Gerencie seus ganhos</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="mt-6 rounded-2xl border border-primary/20 bg-card p-5">
          <p className="text-xs text-muted-foreground">Saldo disponível</p>
          <p className="mt-1 text-3xl font-bold text-foreground">
            R$ {walletData.available.toFixed(2).replace(".", ",")}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs text-muted-foreground">
                Pendente: <span className="font-semibold text-warning">R$ {walletData.pending.toFixed(2).replace(".", ",")}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--success))]" />
              <span className="text-xs text-muted-foreground">
                Total: <span className="font-semibold text-foreground">R$ {walletData.total.toFixed(2).replace(".", ",")}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <Button
            onClick={() => setShowWithdraw(true)}
            className="flex-1 gap-2 gradient-primary glow-orange rounded-xl py-5 text-sm font-bold text-primary-foreground"
          >
            <ArrowUpRight className="h-4 w-4" />
            Sacar via Pix
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2 rounded-xl border-border py-5 text-sm font-bold"
            onClick={() => {}}
          >
            <Shield className="h-4 w-4 text-primary" />
            Extrato
          </Button>
        </div>
      </div>

      <div className="px-5 pt-6">
        {/* Registration alert */}
        <div className="mb-5">
          <ProfileRegistrationAlert isComplete={false} variant="wallet" />
        </div>

        {/* Payment guarantee info */}
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-[hsl(var(--success))]/5 border border-[hsl(var(--success))]/10 p-3">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--success))]" />
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Pagamento garantido.</span>{" "}
            Seu pagamento está garantido pela plataforma após a conclusão do serviço.
          </p>
        </div>

        {/* Security info */}
        <div className="mb-5 flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <p className="text-[11px] text-muted-foreground">
            Valores entram como <span className="font-semibold text-foreground">pendente</span> e são liberados em 24–72h após confirmação do flink. Seus ganhos são creditados diretamente na carteira.
          </p>
        </div>

        {/* Movements */}
        <h2 className="text-sm font-semibold text-muted-foreground">MOVIMENTAÇÕES</h2>
        <div className="mt-3 space-y-2">
          {movements.map((mov) => (
            <button
              key={mov.id}
              className="flex w-full items-center gap-3 rounded-xl bg-card p-3 transition-all hover:bg-secondary/50"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  mov.type === "withdraw" ? "bg-destructive/10" : "bg-[hsl(var(--success))]/10"
                }`}
              >
                {mov.type === "withdraw" ? (
                  <ArrowUpRight className="h-5 w-5 text-destructive" />
                ) : (
                  <ArrowDownLeft className="h-5 w-5 text-[hsl(var(--success))]" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{mov.description}</p>
                <p className="text-[11px] text-muted-foreground">{mov.date}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-bold ${
                    mov.amount < 0 ? "text-destructive" : "text-[hsl(var(--success))]"
                  }`}
                >
                  {mov.amount < 0 ? "-" : "+"}R$ {Math.abs(mov.amount).toFixed(2).replace(".", ",")}
                </p>
                {mov.status === "pending" && (
                  <span className="text-[10px] font-medium text-warning">Pendente</span>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-t-3xl bg-card p-6 pb-10 animate-in slide-in-from-bottom">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
            <h3 className="text-lg font-bold text-foreground">Sacar via Pix</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Disponível: R$ {walletData.available.toFixed(2).replace(".", ",")}
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Valor do saque</label>
                <input
                  type="number"
                  placeholder="0,00"
                  className="mt-1 w-full rounded-xl border border-border bg-secondary p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Chave Pix</label>
                <input
                  type="text"
                  placeholder="CPF, e-mail ou telefone"
                  className="mt-1 w-full rounded-xl border border-border bg-secondary p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl border-border py-5"
                onClick={() => setShowWithdraw(false)}
              >
                Cancelar
              </Button>
              <Button className="flex-1 gradient-primary glow-orange rounded-xl py-5 font-bold text-primary-foreground">
                Confirmar Saque
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Wallet;
