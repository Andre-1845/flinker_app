import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Award, ChevronRight, Settings, LogOut, History, Shield, GraduationCap, Play, Star, MessageSquare, Eye, EyeOff, CheckCircle, Flame, Trophy, TrendingUp, BadgeCheck } from "lucide-react";
import ReputationScore from "@/components/ReputationScore";
import AvatarUpload from "@/components/AvatarUpload";
import VerifiedBadge from "@/components/VerifiedBadge";
import ReputationBadge from "@/components/ReputationBadge";
import ProfileRegistrationForm from "@/components/ProfileRegistrationForm";
import ProfileRegistrationAlert from "@/components/ProfileRegistrationAlert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import RatingStars from "@/components/RatingStars";
import { useAuth } from "@/contexts/AuthContext";

const skills = ["Garçom", "Barista", "Atendimento", "Promotor", "Carga"];

const badges = [
  { name: "Atendimento 5★", icon: "⭐", unlocked: true },
  { name: "Logística Pro", icon: "📦", unlocked: true },
  { name: "Barista", icon: "☕", unlocked: false },
  { name: "Recepção", icon: "🏢", unlocked: false },
];

const trainings = [
  { id: 1, title: "Atendimento 5 estrelas", videos: 4, completed: 2, xp: 200, category: "Atendimento" },
  { id: 2, title: "Logística eficiente", videos: 3, completed: 3, xp: 225, category: "Logística" },
  { id: 3, title: "Barista profissional", videos: 5, completed: 0, xp: 300, category: "Gastronomia" },
];

const reviews = [
  { id: 1, from: "Eventos Premium", rating: 5, text: "Excelente profissional, pontual e proativo.", date: "10 Abr", visible: true },
  { id: 2, from: "CaféTop", rating: 4, text: "Bom trabalho, precisa melhorar velocidade.", date: "05 Abr", visible: true },
  { id: 3, from: "SuperMart", rating: 5, text: "Muito dedicado e atencioso com clientes.", date: "28 Mar", visible: false },
];

const menuItems = [
  { icon: History, label: "Histórico de Flinks", value: "24 flinks", path: "" },
  { icon: Shield, label: "Verificação", value: "Verificado", path: "" },
  { icon: Settings, label: "Configurações", value: "", path: "" },
];

const mockReputation = {
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
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, refreshUser } = useAuth();
  const [userReviews, setUserReviews] = useState(reviews);

  const professional = user?.professional;
  const registrationComplete = Boolean(
    professional && professional.address && professional.pix_key
  );

  const toggleReviewVisibility = (id: number) => {
    setUserReviews(prev => prev.map(r => r.id === id ? { ...r, visible: !r.visible } : r));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Profile Header */}
      <div className="gradient-navy px-5 pb-6 pt-12 text-center">
        <div className="mx-auto">
          <AvatarUpload initials="CS" size="md" />
        </div>
        <h1 className="mt-3 text-xl font-bold text-foreground inline-flex items-center gap-1.5 justify-center w-full">
          {user?.name ?? "Profissional"} <VerifiedBadge size="md" />
        </h1>
        <div className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>São Paulo, SP</span>
        </div>
        <div className="mt-2 flex items-center justify-center">
          <ReputationBadge medal={mockReputation.medal as "Ouro" | "Prata" | "Bronze"} stars={mockReputation.stars} size="md" />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">47 avaliações • {mockReputation.gigs_completed} flinks</p>

        {/* Stats */}
        <div className="mt-5 flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">24</p>
            <p className="text-xs text-muted-foreground">Flinks</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">98%</p>
            <p className="text-xs text-muted-foreground">Aprovação</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              <Award className="inline h-5 w-5 text-primary" />
            </p>
            <p className="text-xs text-muted-foreground">Top 10%</p>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {badges.filter(b => b.unlocked).map(badge => (
            <span key={badge.name} className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary">
              <span>{badge.icon}</span> {badge.name}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* Registration alert */}
        {!registrationComplete && (
          <div className="mb-4">
            <ProfileRegistrationAlert isComplete={false} variant="profile" />
          </div>
        )}

        {/* Flink explainer */}
        <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Flinker = renda + crescimento.</span>{" "}
            Complete treinamentos, ganhe selos e aumente sua visibilidade para as melhores oportunidades.
          </p>
        </div>

        <Tabs defaultValue={registrationComplete ? "skills" : "cadastro"} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-secondary">
            <TabsTrigger value="cadastro" className="text-xs">Cadastro</TabsTrigger>
            <TabsTrigger value="skills" className="text-xs">Perfil</TabsTrigger>
            <TabsTrigger value="reputation" className="text-xs">Reputação</TabsTrigger>
            <TabsTrigger value="training" className="text-xs">Treino</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs">Avaliações</TabsTrigger>
            <TabsTrigger value="more" className="text-xs">Mais</TabsTrigger>
          </TabsList>

          {/* Cadastro Tab */}
          <TabsContent value="cadastro" className="mt-4">
            <ProfileRegistrationForm
              onSave={() => refreshUser()}
            />
          </TabsContent>

          {/* Reputation Tab */}
          <TabsContent value="reputation" className="mt-4">
            <ReputationScore data={mockReputation} />
            <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Como melhorar?</span>{" "}
                Complete treinamentos, mantenha pontualidade e aceite mais flinks para subir de medalha.
              </p>
            </div>
          </TabsContent>

          {/* Skills & Info Tab */}
          <TabsContent value="skills" className="mt-4 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">HABILIDADES</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span key={skill} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground">SELOS DE QUALIFICAÇÃO</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {badges.map(badge => (
                  <div key={badge.name} className={`flex items-center gap-2 rounded-xl border p-3 ${badge.unlocked ? "border-primary/30 bg-primary/5" : "border-border bg-card opacity-50"}`}>
                    <span className="text-xl">{badge.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{badge.name}</p>
                      <p className="text-[10px] text-muted-foreground">{badge.unlocked ? "Conquistado" : "Bloqueado"}</p>
                    </div>
                    {badge.unlocked && <CheckCircle className="ml-auto h-4 w-4 text-primary" />}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="mt-4 space-y-4">
            {/* XP Progress */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-sm font-bold text-foreground">Nível 3</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="h-4 w-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">425 XP</span>
                </div>
              </div>
              <Progress value={65} className="mt-3 h-2 bg-secondary" />
              <p className="mt-1 text-[10px] text-muted-foreground">425 / 650 XP — Próximo: Nível 4</p>
            </div>

            {/* Last / Next Video Preview */}
            <button
              onClick={() => navigate("/training/feed")}
              className="w-full overflow-hidden rounded-2xl border border-primary/30 bg-card transition-all active:scale-[0.98]"
            >
              <div className="relative flex items-center justify-center bg-secondary h-32">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/90 shadow-lg">
                    <Play className="h-7 w-7 text-primary-foreground ml-0.5" />
                  </div>
                </div>
                <span className="absolute top-2 left-3 rounded-full bg-primary/80 px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Continuar
                </span>
                <span className="absolute bottom-2 right-3 text-[10px] font-medium text-muted-foreground bg-background/80 rounded px-1.5 py-0.5">
                  2:45
                </span>
              </div>
              <div className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-foreground">Atendimento 5 estrelas</p>
                  <p className="text-[10px] text-muted-foreground">Vídeo 3 de 4 • Continue de onde parou</p>
                </div>
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
            </button>

            {/* Courses */}
            <div className="space-y-3">
              {trainings.map(course => {
                const progress = course.videos > 0 ? (course.completed / course.videos) * 100 : 0;
                const isComplete = course.completed === course.videos;
                return (
                  <button
                    key={course.id}
                    onClick={() => navigate("/training/feed")}
                    className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-bold text-foreground">{course.title}</h3>
                      <p className="text-[10px] text-muted-foreground">{course.category} • {course.videos} vídeos • {course.xp} XP</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Progress value={progress} className="h-1.5 flex-1 bg-secondary" />
                        <span className="text-[10px] font-semibold text-muted-foreground">{course.completed}/{course.videos}</span>
                      </div>
                    </div>
                    {isComplete && <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />}
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground">COMENTÁRIOS RECEBIDOS</h3>
              <span className="text-[10px] text-muted-foreground">{userReviews.filter(r => r.visible).length} públicos</span>
            </div>
            <p className="text-[10px] text-muted-foreground -mt-2">
              Escolha quais comentários exibir publicamente no seu perfil.
            </p>

            <div className="space-y-3">
              {userReviews.map(review => (
                <div key={review.id} className={`rounded-2xl border p-4 ${review.visible ? "border-primary/20 bg-card" : "border-border bg-card/50 opacity-70"}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{review.from}</p>
                      <div className="mt-0.5 flex items-center gap-1">
                        <RatingStars rating={review.rating} size="sm" />
                        <span className="text-[10px] text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleReviewVisibility(review.id)}
                      className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium transition-colors hover:bg-secondary"
                    >
                      {review.visible ? (
                        <>
                          <Eye className="h-3 w-3 text-primary" />
                          <span className="text-primary">Público</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Oculto</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">"{review.text}"</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* More Tab */}
          <TabsContent value="more" className="mt-4">
            <div className="space-y-1">
              {menuItems.map(item => (
                <button
                  key={item.label}
                  onClick={() => item.path && navigate(item.path)}
                  className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/50"
                >
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
                  {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>

            {/* Verification CTA */}
            <button
              onClick={() => navigate("/verification?type=worker")}
              className="mt-4 flex w-full items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 transition-all hover:bg-blue-500/20"
            >
              <BadgeCheck className="h-6 w-6 text-blue-500" />
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-foreground">Tornar-se Verificado</p>
                <p className="text-[10px] text-muted-foreground">Mais visibilidade e prioridade • R$ 29,90/mês</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            <button onClick={signOut} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive">
              <LogOut className="h-4 w-4" />
              Sair da conta
            </button>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
