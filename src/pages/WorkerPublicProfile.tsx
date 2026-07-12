import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Award, CheckCircle, Star, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RatingStars from "@/components/RatingStars";
import ReputationBadge from "@/components/ReputationBadge";
import ReputationScore from "@/components/ReputationScore";

const workerData = {
  name: "Carlos Silva",
  initials: "CS",
  location: "São Paulo, SP",
  reviews: 47,
  flinks: 24,
  approval: "98%",
  availability: "Seg-Sex",
  skills: ["Garçom", "Barista", "Atendimento", "Promotor", "Carga"],
  badges: [
    { name: "Atendimento 5★", icon: "⭐" },
    { name: "Logística Pro", icon: "📦" },
  ],
  comments: [
    { from: "Eventos Premium", rating: 5, text: "Excelente profissional, pontual e proativo.", date: "10 Abr" },
    { from: "CaféTop", rating: 4, text: "Bom trabalho, precisa melhorar velocidade.", date: "05 Abr" },
  ],
  reputation: {
    overall_score: 72.5,
    nota_media: 96,
    confiabilidade: 85,
    experiencia: 48,
    engajamento: 100,
    qualificacao: 20,
    medal: "Prata",
    stars: 3.6,
    gigs_completed: 24,
    trainings_completed: 2,
  },
};

const WorkerPublicProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="gradient-navy px-5 pb-8 pt-12 text-center relative">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-12 rounded-full bg-secondary p-2">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full gradient-primary text-2xl font-bold text-primary-foreground">
          {workerData.initials}
        </div>
        <h1 className="mt-3 text-xl font-bold text-foreground">{workerData.name}</h1>
        <div className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{workerData.location}</span>
        </div>
        <div className="mt-2 flex justify-center">
          <ReputationBadge medal={workerData.reputation.medal as "Ouro" | "Prata" | "Bronze"} stars={workerData.reputation.stars} size="md" />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground text-center">{workerData.reviews} avaliações • {workerData.flinks} flinks</p>

        {/* Stats */}
        <div className="mt-5 flex items-center justify-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{workerData.flinks}</p>
            <p className="text-xs text-muted-foreground">Flinks</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{workerData.approval}</p>
            <p className="text-xs text-muted-foreground">Aprovação</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <Award className="mx-auto h-5 w-5 text-primary" />
            <p className="text-xs text-muted-foreground">Top 10%</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6">
        {/* Reputation */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">REPUTAÇÃO</h3>
          <ReputationScore data={workerData.reputation} />
        </div>

        {/* Badges - Highlighted */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">SELOS DE TREINAMENTO</h3>
          <div className="flex flex-wrap gap-2">
            {workerData.badges.map(badge => (
              <span key={badge.name} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-4 py-2 text-sm font-semibold text-primary">
                <span className="text-base">{badge.icon}</span> {badge.name}
                <CheckCircle className="h-3.5 w-3.5 ml-1" />
              </span>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">HABILIDADES</h3>
          <div className="flex flex-wrap gap-2">
            {workerData.skills.map(skill => (
              <span key={skill} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Disponibilidade</p>
            <p className="text-xs text-muted-foreground">{workerData.availability}</p>
          </div>
        </div>

        {/* Comments */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">COMENTÁRIOS</h3>
          <div className="space-y-3">
            {workerData.comments.map((comment, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{comment.from}</p>
                  <span className="text-[10px] text-muted-foreground">{comment.date}</span>
                </div>
                <RatingStars rating={comment.rating} size="sm" />
                <p className="mt-2 text-xs text-muted-foreground">"{comment.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action */}
        <Button className="w-full gap-2" size="lg">
          <MessageSquare className="h-4 w-4" />
          Convidar para Flink
        </Button>
      </div>
    </div>
  );
};

export default WorkerPublicProfile;
