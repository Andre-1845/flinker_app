import { useEffect, useState } from "react";
import { CheckCircle, Clock, XCircle, MessageSquare, AlertTriangle, Check, X, Lock, Shield, ShieldAlert, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { listMyMatches, confirmMatch, cancelMatch, confirmMatchCompletion } from "@/lib/matches";
import type { FlinkMatch, MatchStatus } from "@/lib/types";
import { ApiError } from "@/lib/api";

const statusConfig: Record<MatchStatus, { label: string; icon: typeof CheckCircle; color: string }> = {
  pending: { label: "Aguardando empresa", icon: Clock, color: "text-warning" },
  accepted: { label: "Aguardando seu aceite", icon: Clock, color: "text-warning" },
  confirmed: { label: "Confirmado", icon: CheckCircle, color: "text-success" },
  rejected: { label: "Não selecionado", icon: XCircle, color: "text-muted-foreground" },
  cancelled: { label: "Cancelado", icon: XCircle, color: "text-destructive" },
};

const Matches = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<FlinkMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState<number | null>(null);
  const [completeDialog, setCompleteDialog] = useState<number | null>(null);
  const [actingOn, setActingOn] = useState<number | null>(null);

  const loadMatches = () => {
    setLoading(true);
    listMyMatches()
      .then((res) => setMatches(res.data))
      .catch(() => toast.error("Não foi possível carregar seus matches."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleConfirm = async (matchId: number) => {
    setActingOn(matchId);
    try {
      await confirmMatch(matchId);
      toast.success("Aceite confirmado! Sua agenda foi bloqueada para esse horário.");
      loadMatches();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Erro ao confirmar. Tente novamente.";
      toast.error(message);
    } finally {
      setActingOn(null);
    }
  };

  const handleConfirmCompletion = async (matchId: number) => {
    setActingOn(matchId);
    try {
      await confirmMatchCompletion(matchId);
      setCompleteDialog(null);
      toast.success("Conclusão confirmada! Assim que a empresa também confirmar, o pagamento é liberado.");
      loadMatches();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Erro ao confirmar conclusão. Tente novamente.";
      toast.error(message);
    } finally {
      setActingOn(null);
    }
  };

  const handleCancel = async (matchId: number) => {
    setActingOn(matchId);
    try {
      await cancelMatch(matchId);
      toast.info("Match cancelado.");
      setCancelDialog(null);
      loadMatches();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Erro ao cancelar. Tente novamente.";
      toast.error(message);
    } finally {
      setActingOn(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-12">
        <h1 className="text-2xl font-bold text-foreground">Meus Matches</h1>
        <p className="text-sm text-muted-foreground">Flinks que combinaram com você</p>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/10 p-3">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <p className="text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">Pagamento garantido.</span>{" "}
            Seu pagamento está garantido pela plataforma após a conclusão do serviço.
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {matches.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Você ainda não tem nenhum match. Demonstre interesse em um Flink pra começar.
            </p>
          )}

          {matches.map((match) => {
            const st = statusConfig[match.status];
            const StatusIcon = st.icon;
            const needsConfirm = match.status === "accepted";
            const chatAllowed = match.status === "confirmed";
            const canCheckIn = match.status === "confirmed" && !match.checked_in_at;
            const flinkStatus = match.flink?.status;
            const isFlinkDone = flinkStatus === "completed" || flinkStatus === "cancelled";
            const canConfirmCompletion =
              match.status === "confirmed" && !!match.checked_in_at && !isFlinkDone && !match.professional_confirmed_at;
            const awaitingCompanyConfirmation =
              match.status === "confirmed" && !!match.professional_confirmed_at && !match.company_confirmed_at && flinkStatus !== "completed";
            const isActing = actingOn === match.id;

            return (
              <div key={match.id} className="gradient-card rounded-2xl border border-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-foreground">{match.flink?.activity_type}</h3>
                    <p className="text-xs text-muted-foreground">
                      {match.flink?.company?.responsible_name ?? "Empresa"} •{" "}
                      {match.flink && new Date(match.flink.start_date_time).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      R$ {match.flink?.pricing.net_value.toFixed(2)}
                    </p>
                    <div className={`mt-1 flex items-center gap-1 ${st.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      <span className="text-xs font-medium">{st.label}</span>
                    </div>
                  </div>
                </div>

                {!chatAllowed && match.status !== "rejected" && match.status !== "cancelled" && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-destructive/5 border border-destructive/10 px-3 py-2">
                    <Lock className="h-3 w-3 text-destructive" />
                    <p className="text-[10px] text-muted-foreground">
                      Contato liberado apenas após a confirmação mútua.
                    </p>
                  </div>
                )}

                {needsConfirm && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 gap-1.5 bg-primary text-primary-foreground"
                      onClick={() => handleConfirm(match.id)}
                      disabled={isActing}
                    >
                      {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Confirmar Aceite
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

                {canCheckIn && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      className="w-full gap-2 gradient-primary text-primary-foreground"
                      onClick={() => navigate(`/gig-checkin/${match.id}`)}
                    >
                      <Navigation className="h-4 w-4" />
                      Fazer Check-in
                    </Button>
                  </div>
                )}

                {canConfirmCompletion && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      className="w-full gap-2 bg-success text-success-foreground"
                      onClick={() => setCompleteDialog(match.id)}
                      disabled={isActing}
                    >
                      {isActing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Confirmar Conclusão do Serviço
                    </Button>
                  </div>
                )}

                {awaitingCompanyConfirmation && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-warning/5 border border-warning/10 px-3 py-2">
                    <Clock className="h-3.5 w-3.5 text-warning" />
                    <p className="text-[11px] text-muted-foreground">
                      Você confirmou a conclusão. Aguardando a empresa confirmar para liberar o pagamento
                      (ou o prazo automático, se ela não confirmar).
                    </p>
                  </div>
                )}

                {flinkStatus === "completed" && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-success/5 border border-success/10 px-3 py-2">
                    <CheckCircle className="h-3.5 w-3.5 text-success" />
                    <p className="text-[11px] text-muted-foreground">
                      Serviço concluído e pagamento liberado.
                    </p>
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

      <Dialog open={!!completeDialog} onOpenChange={() => setCompleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Conclusão do Serviço</DialogTitle>
            <DialogDescription>
              Confirme só depois de ter executado o serviço combinado. A empresa também precisa confirmar
              para o pagamento ser liberado — se ela não confirmar, o sistema libera automaticamente após
              o prazo definido pela plataforma.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCompleteDialog(null)}>
              Voltar
            </Button>
            <Button
              className="bg-success text-success-foreground"
              onClick={() => completeDialog && handleConfirmCompletion(completeDialog)}
              disabled={actingOn === completeDialog}
            >
              {actingOn === completeDialog ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Conclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Match</DialogTitle>
            <DialogDescription>
              Cancelamentos podem afetar sua reputação. Penalidades variam conforme o momento:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg bg-destructive/5 border border-destructive/10 p-3">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 text-destructive" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-semibold text-foreground">Antes da execução:</span> queda de prioridade e visibilidade</p>
                <p><span className="font-semibold text-foreground">Após confirmação:</span> pode afetar sua reputação</p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelDialog(null)}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelDialog && handleCancel(cancelDialog)}
              disabled={actingOn === cancelDialog}
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
