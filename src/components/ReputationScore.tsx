import { Shield, Star, TrendingUp, Activity, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ReputationBadge from "@/components/ReputationBadge";

interface ReputationData {
  overall_score: number;
  nota_media: number;
  confiabilidade: number;
  experiencia: number;
  engajamento: number;
  qualificacao: number;
  medal: string;
  stars: number;
  gigs_completed: number;
  trainings_completed: number;
}

interface ReputationScoreProps {
  data: ReputationData;
  compact?: boolean;
}

const pillars = [
  { key: "nota_media" as const, label: "Nota Média", description: "Avaliações recebidas", icon: Star, weight: "35%" },
  { key: "confiabilidade" as const, label: "Confiabilidade", description: "Pontualidade e presença", icon: Shield, weight: "25%" },
  { key: "experiencia" as const, label: "Experiência", description: "Flinks concluídos", icon: TrendingUp, weight: "15%" },
  { key: "engajamento" as const, label: "Engajamento", description: "Atividade recente", icon: Activity, weight: "15%" },
  { key: "qualificacao" as const, label: "Qualificação", description: "Treinamentos completos", icon: GraduationCap, weight: "10%" },
];

const ReputationScore = ({ data, compact = false }: ReputationScoreProps) => {
  if (compact) {
    return (
      <ReputationBadge medal={data.medal as "Ouro" | "Prata" | "Bronze"} stars={data.stars} size="sm" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Score Card */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Avaliação Geral</p>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-5 w-5 ${
                    s <= Math.round(data.stars) ? "fill-primary text-primary" : "text-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="ml-1 text-lg font-bold text-foreground">{data.stars.toFixed(1)}</span>
            </div>
          </div>
          <ReputationBadge medal={data.medal as "Ouro" | "Prata" | "Bronze"} stars={data.stars} size="md" />
        </div>
        <Progress value={data.overall_score} className="mt-3 h-2.5 bg-secondary" />
      </div>

      {/* Pillars */}
      <div className="space-y-2">
        {pillars.map(pillar => {
          const value = data[pillar.key];
          const Icon = pillar.icon;
          return (
            <div key={pillar.key} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-xs font-medium text-foreground">{pillar.label}</p>
                    <p className="text-[9px] text-muted-foreground">{pillar.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Peso: {pillar.weight}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={value} className="h-1.5 flex-1 bg-secondary" />
                  <span className="text-[10px] font-semibold text-muted-foreground w-7 text-right">{Math.round(value)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReputationScore;
