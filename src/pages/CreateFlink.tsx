import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, Calendar, FileText, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createFlink } from "@/lib/flinks";
import { ApiError } from "@/lib/api";

const CreateFlink = () => {
  const navigate = useNavigate();
  const [activityType, setActivityType] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [requirements, setRequirements] = useState("");
  const [netValue, setNetValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const marginPercent = 7; // ver PricingService no backend — fixo por enquanto
  const netValueNumber = parseFloat(netValue.replace(",", ".")) || 0;
  const totalValue = netValueNumber > 0 ? netValueNumber * (1 + marginPercent / 100) : 0;

  const handleSubmit = async () => {
    if (!activityType || !location || !latitude || !longitude || !startDateTime || !endDateTime || !netValue) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createFlink({
        activity_type: activityType,
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        start_date_time: startDateTime.replace("T", " ") + ":00",
        end_date_time: endDateTime.replace("T", " ") + ":00",
        requirements: requirements || undefined,
        net_value: netValueNumber,
      });

      toast.success("Flink publicado com sucesso!");
      navigate("/company-dashboard");
    } catch (error) {
      const message = error instanceof ApiError
        ? (error.fieldError("end_date_time") ?? error.message)
        : "Erro ao publicar o Flink. Tente novamente.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-12 pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm">Voltar</span>
      </button>

      <h1 className="mt-6 text-2xl font-bold text-foreground">Publicar Novo Flink</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Informe o valor que o profissional vai receber — a margem da plataforma é calculada automaticamente.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" /> Tipo de atividade
          </label>
          <Input
            placeholder="Ex: Garçom, Segurança, Montador de estande"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="mt-1 bg-card border-border rounded-xl"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> Local (endereço)
          </label>
          <Input
            placeholder="Rua, número, bairro - cidade"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 bg-card border-border rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Latitude</label>
            <Input
              placeholder="-22.4738"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="mt-1 bg-card border-border rounded-xl"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Longitude</label>
            <Input
              placeholder="-44.4438"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="mt-1 bg-card border-border rounded-xl"
            />
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Dica: abra o local no Google Maps, clique com o botão direito no ponto exato e copie as coordenadas.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Início
            </label>
            <Input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="mt-1 bg-card border-border rounded-xl"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> Término
            </label>
            <Input
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              className="mt-1 bg-card border-border rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" /> Requisitos (opcional)
          </label>
          <Textarea
            placeholder="Ex: experiência prévia em eventos"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="mt-1 bg-card border-border rounded-xl resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" /> Valor líquido para o profissional (R$)
          </label>
          <Input
            placeholder="200"
            inputMode="decimal"
            value={netValue}
            onChange={(e) => setNetValue(e.target.value)}
            className="mt-1 bg-card border-border rounded-xl"
          />
        </div>

        {netValueNumber > 0 && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Profissional recebe</span>
              <span className="font-semibold text-foreground">R$ {netValueNumber.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between text-muted-foreground">
              <span>Margem da plataforma ({marginPercent}%)</span>
              <span>R$ {(totalValue - netValueNumber).toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between font-bold text-foreground">
              <span>Você paga (total)</span>
              <span>R$ {totalValue.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full gap-2 gradient-primary glow-orange rounded-xl py-6 text-base font-bold text-primary-foreground disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Publicar Flink
        </Button>
      </div>
    </div>
  );
};

export default CreateFlink;
