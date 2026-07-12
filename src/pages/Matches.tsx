import { useState } from "react";
import { CheckCircle, Clock, XCircle, MessageSquare, AlertTriangle, Check, X, Lock, Shield, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import BottomNav from "@/components/BottomNav";
import ReputationBadge from "@/components/ReputationBadge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const mockMatches = [
  {
    id: "m1",
    flinkTitle: "Garçom para Casamento",
    company: "Festa & Cia",
    date: "20 Abr, 16h-00h",
    payment: "R$ 220",
    medal: "Ouro" as const,
    stars: 4.9,
    status: "matched",
    workerAccepted: false,
    companyAccepted: true,
  },
  {
    id: "m2",
    flinkTitle: "Promotor de Vendas",
    company: "SuperMart",
    date: "16-17 Abr, 9h-18h",
    payment: "R$ 120",
    medal: "Bronze" as const,
    stars: 4.2,
    status: "confirmed",
    workerAccepted: true,
    companyAccepted: true,
  },
  {
    id: "m3",
    flinkTitle: "Barista Temporário",
    company: "CaféTop",
    date: "10 Abr",
    payment: "R$ 140",
    medal: "Prata" as const,
    stars: 4.6,
    status: "completed",
    workerAccepted: true,
    companyAccepted: true,
  },
];

type FlinkStatus = "created" | "guaranteed" | "matched" | "partially_accepted" | "confirmed" | "in_progress" | "completed" | "paid" | "cancelled";

const statusConfig: Record<FlinkStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  created: { label: "Criado", icon: Clock, color: "text-muted-foreground" },
  guaranteed: { label: "Valor Reservado", icon: Shield, color: "text-primary" },
  matched: { label: "Aguardando Aceite", icon: Clock, color: "text-warning" },
  partially_accepted: { label: "Aceito Parcialmente", icon: Clock, color: "text-warning" },
  confirmed: { label: "Confirmado", icon: CheckCircle, color: "text-success" },
  in_progress: { label: "Em Execução", icon: Clock, color: "text-primary" },
  completed: { label: "Concluído", icon: CheckCircle, color: "text-primary" },
  paid: { label: "Pago", icon: CheckCircle, color: "text-success" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "text-destructive" },
};

const Matches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState(mockMatches);
  const [cancelDialog, setCancelDialog] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const handleAccept = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) => {
        if (m.id !== matchId) return m;
        const newWorkerAccepted = true;
        const bothAccepted = newWorkerAccepted && m.companyAccepted;
        return {
          ...m,
          workerAccepted: true,
          status: bothAccepted ? "confirmed" : "partially_accepted",
        };
      })
    );
    toast.success("Aceite registrado!");
  };

  const handleCancel = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, status: "cancelled" } : m
      )
    );
    setCancelDialog(null);
    setCancelReason("");
    toast.info("Match cancelado.");
  };

  const isChatAllowed = (match: typeof mockMatches[0]) => {
    return match.status === "confirmed" || match.status === "in_progress";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-12">
        <h1 className="text-2xl font-bold text-foreground">Meus Matches</h1>
        <p className="text-sm text-muted-foreground">Flinks que combinaram com você</p>

        {/* Payment guarantee info */}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/10 p-3">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Pagamento garantido.</span>{" "}
            Seu pagamento está garantido pela plataforma após a conclusão do serviço.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {matches.map((match) => {
            const st = statusConfig[match.status as FlinkStatus] || statusConfig.matched;
            const StatusIcon = st.icon;
            const needsAccept = match.status === "matched" && !match.workerAccepted;
            const chatAllowed = isChatAllowed(match);

            return (
              <div key={match.id} className="gradient-card rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{match.flinkTitle}</h3>
                    <p className="text-xs text-muted-foreground">{match.company} • {match.date}</p>
                    <div className="mt-1.5">
                      <ReputationBadge medal={match.medal} stars={match.stars} size="sm" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{match.payment}</p>
                    <div className={`mt-1 flex items-center gap-1 ${st.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      <span className="text-xs font-medium">{st.label}</span>
                    </div>
                  </div>
                </div>

                {/* Bilateral accept status */}
                {(match.status === "matched" || match.status === "confirmed" || match.status === "partially_accepted") && (
                  <div className="mt-3 flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-xs">
                    <span className={match.workerAccepted ? "text-success" : "text-muted-foreground"}>
                      {match.workerAccepted ? "✅ Você aceitou" : "⏳ Seu aceite"}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className={match.companyAccepted ? "text-success" : "text-muted-foreground"}>
                      {match.companyAccepted ? "✅ Empresa aceitou" : "⏳ Aceite empresa"}
                    </span>
                  </div>
                )}

                {/* Contact blocked notice - before bilateral accept */}
                {!chatAllowed && match.status !== "completed" && match.status !== "paid" && match.status !== "cancelled" && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/10 px-3 py-2">
                    <Lock className="h-3 w-3 text-destructive" />
                    <p className="text-[10px] text-muted-foreground">
                      Contato liberado apenas após aceite bilateral.
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                {needsAccept && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 bg-primary text-primary-foreground"
                      onClick={() => handleAccept(match.id)}
                    >
                      <Check className="h-4 w-4" />
                      Aceitar Flink
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-destructive/30 text-destructive"
                      onClick={() => setCancelDialog(match.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {chatAllowed && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-2 bg-secondary text-secondary-foreground"
                      onClick={() => navigate("/chat")}
                    >
                      <MessageSquare className="h-4 w-4" />
                      Abrir Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 border-destructive/30 text-destructive"
                      onClick={() => setCancelDialog(match.id)}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancel dialog with penalty warning */}
      <Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Match</DialogTitle>
            <DialogDescription>
              Cancelamentos podem afetar sua reputação e medalha. Penalidades variam conforme o momento:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg bg-destructive/5 border border-destructive/10 p-3">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-destructive" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-semibold text-foreground">Antes da execução:</span> queda de prioridade e visibilidade</p>
                <p><span className="font-semibold text-foreground">Após confirmação:</span> bloqueio temporário de 30 dias + perda de medalha</p>
                <p><span className="font-semibold text-foreground">No-show:</span> penalidade grave + bloqueio de 30 dias + queda de 50% nas estrelas</p>
              </div>
            </div>
          </div>
          <Textarea
            placeholder="Motivo do cancelamento (opcional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelDialog(null)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelDialog && handleCancel(cancelDialog)}
            >
              Confirmar Cancelamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Matches;
