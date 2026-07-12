import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, CheckCircle, XCircle, Loader2, Navigation, Clock, ArrowLeft, Shield, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getFlink } from "@/lib/flinks";
import { checkInMatch, listMyMatches } from "@/lib/matches";
import { ApiError } from "@/lib/api";
import type { FlinkMatch } from "@/lib/types";

type CheckInStatus = "loading" | "idle" | "locating" | "success" | "too_far" | "error" | "denied" | "not_allowed";

const GigCheckIn = () => {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const [status, setStatus] = useState<CheckInStatus>("loading");
  const [match, setMatch] = useState<FlinkMatch | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) {
      setStatus("not_allowed");
      return;
    }

    // A API não tem "GET /matches/{id}" direto, então buscamos na lista do usuário.
    listMyMatches()
      .then((res) => {
        const found = res.data.find((m) => m.id === Number(matchId));
        if (!found) {
          setStatus("not_allowed");
          return;
        }
        if (found.status !== "confirmed") {
          setStatus("not_allowed");
          setErrorMessage("Este match ainda não foi confirmado, então o check-in não está liberado.");
          return;
        }
        setMatch(found);
        setStatus(found.checked_in_at ? "success" : "idle");
        if (found.checked_in_at) {
          setCheckedInAt(new Date(found.checked_in_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
        }
      })
      .catch(() => setStatus("error"));
  }, [matchId]);

  const attemptCheckIn = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      toast.error("Geolocalização não suportada neste dispositivo.");
      return;
    }
    if (!matchId) return;

    setStatus("locating");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        setAccuracy(Math.round(acc));

        try {
          const updated = await checkInMatch(Number(matchId), latitude, longitude);
          setMatch(updated);
          setStatus("success");
          setCheckedInAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
          toast.success("Check-in realizado com sucesso!");
        } catch (error) {
          if (error instanceof ApiError && error.status === 422) {
            setStatus("too_far");
            setErrorMessage(error.fieldError("location") ?? error.message);
            toast.error(error.message);
          } else {
            setStatus("error");
            toast.error("Erro ao registrar o check-in. Tente novamente.");
          }
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
          toast.error("Permissão de localização negada.");
        } else {
          setStatus("error");
          toast.error("Erro ao obter localização. Tente novamente.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [matchId]);

  const statusContent: Record<CheckInStatus, { icon: React.ReactNode; title: string; description: string; color: string }> = {
    loading: {
      icon: <Loader2 className="h-10 w-10 animate-spin text-primary" />,
      title: "Carregando...",
      description: "Buscando os dados do seu match.",
      color: "border-border",
    },
    not_allowed: {
      icon: <XCircle className="h-10 w-10 text-destructive" />,
      title: "Check-in não disponível",
      description: errorMessage ?? "Não foi possível encontrar esse match, ou ele ainda não está confirmado.",
      color: "border-destructive/30",
    },
    idle: {
      icon: <MapPin className="h-10 w-10 text-primary" />,
      title: "Pronto para o Check-in",
      description: "Toque no botão quando estiver no local do flink para confirmar sua presença.",
      color: "border-border",
    },
    locating: {
      icon: <Loader2 className="h-10 w-10 animate-spin text-primary" />,
      title: "Obtendo localização...",
      description: "Aguarde enquanto verificamos sua posição via GPS.",
      color: "border-primary/30",
    },
    success: {
      icon: <CheckCircle className="h-10 w-10 text-success" />,
      title: "Check-in Confirmado!",
      description: checkedInAt ? `Presença registrada às ${checkedInAt}. Bom trabalho!` : "Presença registrada. Bom trabalho!",
      color: "border-success/30",
    },
    too_far: {
      icon: <Navigation className="h-10 w-10 text-warning" />,
      title: "Muito longe do local",
      description: errorMessage ?? "Aproxime-se do local do Flink para fazer check-in.",
      color: "border-warning/30",
    },
    error: {
      icon: <XCircle className="h-10 w-10 text-destructive" />,
      title: "Erro de localização",
      description: "Não foi possível obter sua localização. Verifique o GPS e tente novamente.",
      color: "border-destructive/30",
    },
    denied: {
      icon: <Shield className="h-10 w-10 text-destructive" />,
      title: "Permissão negada",
      description: "Ative a permissão de localização nas configurações do navegador para continuar.",
      color: "border-destructive/30",
    },
  };

  const current = statusContent[status];
  const flink = match?.flink;

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-navy px-5 pb-6 pt-12">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full bg-secondary p-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Check-in GPS</h1>
            <p className="text-xs text-muted-foreground">Confirme sua presença no local</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6">
        {flink && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{flink.activity_type}</h3>
                <p className="text-xs text-muted-foreground">{flink.company?.responsible_name ?? "Empresa"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">R$ {flink.pricing.net_value.toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span>{flink.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>{new Date(flink.start_date_time).toLocaleString("pt-BR")}</span>
              </div>
            </div>
          </div>
        )}

        <div className={`mt-6 flex flex-col items-center rounded-2xl border bg-card p-8 text-center transition-colors ${current.color}`}>
          {current.icon}
          <h2 className="mt-4 text-lg font-bold text-foreground">{current.title}</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{current.description}</p>

          {accuracy !== null && !["idle", "loading", "not_allowed"].includes(status) && (
            <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
              <Wifi className="h-3 w-3" />
              <span>Precisão GPS: ~{accuracy}m</span>
            </div>
          )}
        </div>

        <div className="mt-8">
          {status === "success" ? (
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full gap-2 rounded-xl py-6 text-base font-bold bg-success text-success-foreground"
            >
              <CheckCircle className="h-5 w-5" />
              Voltar ao Início
            </Button>
          ) : status === "not_allowed" || status === "loading" ? (
            <Button onClick={() => navigate("/matches")} className="w-full rounded-xl py-6 text-base font-bold">
              Voltar aos Matches
            </Button>
          ) : (
            <Button
              onClick={attemptCheckIn}
              disabled={status === "locating"}
              className="w-full gap-2 gradient-primary glow-orange rounded-xl py-6 text-base font-bold text-primary-foreground"
            >
              {status === "locating" ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Navigation className="h-5 w-5" />
                  {status === "idle" ? "Fazer Check-in" : "Tentar Novamente"}
                </>
              )}
            </Button>
          )}
        </div>

        <div className="mt-6 space-y-2 pb-8">
          <p className="text-xs font-semibold text-muted-foreground">DICAS</p>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-0.5 text-primary">•</span>
            <span>Ative o GPS de alta precisão no seu celular</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-0.5 text-primary">•</span>
            <span>Fique em local aberto para melhor sinal</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-0.5 text-primary">•</span>
            <span>A validação da distância é feita pelo servidor no momento do check-in</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigCheckIn;
