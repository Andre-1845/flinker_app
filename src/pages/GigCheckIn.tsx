import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CheckCircle, XCircle, Loader2, Navigation, Clock, ArrowLeft, Shield, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type CheckInStatus = "idle" | "locating" | "success" | "too_far" | "error" | "denied";

// Mock flink location (Vila Olímpia, SP)
const FLINK_LOCATION = { lat: -23.5958, lng: -46.6862 };
const MAX_DISTANCE_METERS = 200;

const haversineDistance = (
  lat1: number, lon1: number, lat2: number, lon2: number
): number => {
  const R = 6371e3;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const GigCheckIn = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<CheckInStatus>("idle");
  const [distance, setDistance] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);

  const flinkInfo = {
    title: "Garçom VIP",
    company: "Eventos Premium",
    location: "Vila Olímpia, SP",
    time: "18h - 23h",
    payment: "R$ 200",
  };

  const attemptCheckIn = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      toast.error("Geolocalização não suportada neste dispositivo.");
      return;
    }

    setStatus("locating");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        const dist = haversineDistance(latitude, longitude, FLINK_LOCATION.lat, FLINK_LOCATION.lng);
        setDistance(Math.round(dist));
        setAccuracy(Math.round(acc));

        if (dist <= MAX_DISTANCE_METERS) {
          setStatus("success");
          setCheckedInAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
          toast.success("Check-in realizado com sucesso!");
        } else {
          setStatus("too_far");
          toast.error(`Você está a ${Math.round(dist)}m do local. Aproxime-se para fazer check-in.`);
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
  }, []);

  const statusContent: Record<CheckInStatus, { icon: React.ReactNode; title: string; description: string; color: string }> = {
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
      description: `Presença registrada às ${checkedInAt}. Bom trabalho!`,
      color: "border-success/30",
    },
    too_far: {
      icon: <Navigation className="h-10 w-10 text-warning" />,
      title: "Muito longe do local",
      description: `Você está a ${distance}m. Aproxime-se até ${MAX_DISTANCE_METERS}m para fazer check-in.`,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
        {/* Flink Info Card */}
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <MapPin className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">{flinkInfo.title}</h3>
              <p className="text-xs text-muted-foreground">{flinkInfo.company}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-foreground">{flinkInfo.payment}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>{flinkInfo.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>{flinkInfo.time}</span>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className={`mt-6 flex flex-col items-center rounded-2xl border bg-card p-8 text-center transition-colors ${current.color}`}>
          {current.icon}
          <h2 className="mt-4 text-lg font-bold text-foreground">{current.title}</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{current.description}</p>

          {accuracy !== null && status !== "idle" && (
            <div className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
              <Wifi className="h-3 w-3" />
              <span>Precisão GPS: ~{accuracy}m</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8">
          {status === "success" ? (
            <Button
              onClick={() => navigate("/dashboard")}
              className="w-full gap-2 rounded-xl py-6 text-base font-bold bg-success text-success-foreground"
            >
              <CheckCircle className="h-5 w-5" />
              Voltar ao Início
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

        {/* Distance indicator */}
        {distance !== null && status !== "success" && (
          <div className="mt-4 rounded-xl bg-secondary p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Distância do local</span>
              <span className={`font-bold ${distance <= MAX_DISTANCE_METERS ? "text-success" : "text-warning"}`}>
                {distance}m
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${distance <= MAX_DISTANCE_METERS ? "bg-success" : "bg-warning"}`}
                style={{ width: `${Math.max(5, Math.min(100, (1 - distance / 1000) * 100))}%` }}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Máximo permitido: {MAX_DISTANCE_METERS}m do local
            </p>
          </div>
        )}

        {/* Tips */}
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
            <span>O check-in deve ser feito no raio de {MAX_DISTANCE_METERS}m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigCheckIn;
