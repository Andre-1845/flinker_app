import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ChevronRight, Settings, LogOut, History, Shield, GraduationCap, Play, Star, CheckCircle, Building2, BadgeCheck } from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";
import VerifiedBadge from "@/components/VerifiedBadge";
import ReputationBadge from "@/components/ReputationBadge";
import CompanyRegistrationForm from "@/components/CompanyRegistrationForm";
import CompanyStatusBadge from "@/components/CompanyStatusBadge";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavCompany from "@/components/BottomNavCompany";
import { useAuth } from "@/contexts/AuthContext";

const companyTrainings = [
  { id: 1, title: "Desafios e vantagens da Geração Z", videos: 5, completed: 3, xp: 250, category: "Gestão" },
  { id: 2, title: "Gestão de equipes temporárias", videos: 4, completed: 1, xp: 200, category: "Liderança" },
  { id: 3, title: "Remuneração por desempenho", videos: 3, completed: 0, xp: 180, category: "RH" },
];

const menuItems = [
  { icon: History, label: "Histórico de Flinks", value: "47 flinks" },
  { icon: Shield, label: "Verificação", value: "Verificado" },
  { icon: Settings, label: "Configurações", value: "" },
];

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile, status, refetch } = useCompanyProfile();
  const [activeTab, setActiveTab] = useState(status === "incomplete" ? "cadastro" : "training");

  const displayName = profile?.fullName || "Minha Empresa";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-navy px-5 pb-6 pt-12 text-center">
        <div className="mx-auto">
          <AvatarUpload initials={displayName.slice(0, 2).toUpperCase()} size="md" icon={<Building2 className="h-9 w-9" />} />
        </div>
        <h1 className="mt-3 text-xl font-bold text-foreground inline-flex items-center gap-1.5 justify-center w-full">
          {displayName} {status === "verified" && <VerifiedBadge size="md" />}
        </h1>
        <div className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>São Paulo, SP</span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-3">
          <ReputationBadge medal="Ouro" stars={4.7} size="md" />
          <CompanyStatusBadge status={status} />
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">32 avaliações • 47 flinks</p>

        <div className="mt-5 flex items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">47</p>
            <p className="text-xs text-muted-foreground">Flinks</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">95%</p>
            <p className="text-xs text-muted-foreground">Aprovação</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5">
              <Star className="h-5 w-5 fill-primary text-primary" />
              <span className="text-lg font-bold text-foreground">4.7</span>
            </div>
            <p className="text-xs text-muted-foreground">Nota</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* Incomplete alert */}
        {status === "incomplete" && (
          <button
            onClick={() => setActiveTab("cadastro")}
            className="mb-4 flex w-full items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-left"
          >
            <span className="mt-0.5 text-base">🔴</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Complete seu cadastro empresarial</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Complete o cadastro para liberar a criação de flinks e garantir segurança nas transações.
              </p>
            </div>
            <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </button>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary">
            <TabsTrigger value="cadastro" className="text-xs">Cadastro</TabsTrigger>
            <TabsTrigger value="training" className="text-xs">Treinamentos</TabsTrigger>
            <TabsTrigger value="info" className="text-xs">Informações</TabsTrigger>
            <TabsTrigger value="more" className="text-xs">Mais</TabsTrigger>
          </TabsList>

          <TabsContent value="cadastro" className="mt-4">
            <CompanyRegistrationForm onSave={() => { refetch(); setActiveTab("training"); }} />
          </TabsContent>

          <TabsContent value="training" className="mt-4 space-y-4">
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Capacite sua gestão.</span>{" "}
                Treinamentos exclusivos para empresas que contratam pela Flinker.
              </p>
            </div>
            <button onClick={() => navigate("/training/feed")} className="w-full overflow-hidden rounded-2xl border border-primary/30 bg-card transition-all active:scale-[0.98]">
              <div className="relative flex items-center justify-center bg-secondary h-28">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 shadow-lg">
                  <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
                </div>
                <span className="absolute top-2 left-3 rounded-full bg-primary/80 px-2 py-0.5 text-[10px] font-bold text-primary-foreground">Continuar</span>
              </div>
              <div className="flex items-center gap-3 p-3">
                <GraduationCap className="h-5 w-5 text-primary" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-foreground">Desafios e vantagens da Geração Z</p>
                  <p className="text-[10px] text-muted-foreground">Vídeo 4 de 5 • Continue de onde parou</p>
                </div>
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
            </button>
            <div className="space-y-3">
              {companyTrainings.map(course => {
                const progress = course.videos > 0 ? (course.completed / course.videos) * 100 : 0;
                const isComplete = course.completed === course.videos;
                return (
                  <button key={course.id} onClick={() => navigate("/training/feed")} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all">
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

          <TabsContent value="info" className="mt-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-muted-foreground">SOBRE</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Empresa especializada em eventos corporativos e sociais. Contratamos profissionais temporários para garçom, barista, recepção e logística.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold text-muted-foreground">SEGMENTOS</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Eventos", "Gastronomia", "Logística"].map(s => (
                  <span key={s} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">{s}</span>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="more" className="mt-4">
            <div className="space-y-1">
              {menuItems.map(item => (
                <button key={item.label} className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/50">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="flex-1 text-left text-sm font-medium text-foreground">{item.label}</span>
                  {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
            <button onClick={() => navigate("/verification?type=company")} className="mt-4 flex w-full items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 transition-all hover:bg-blue-500/20">
              <BadgeCheck className="h-6 w-6 text-blue-500" />
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-foreground">Tornar-se Verificada</p>
                <p className="text-[10px] text-muted-foreground">Mais credibilidade e prioridade • R$ 59,90/mês</p>
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

      <BottomNavCompany />
    </div>
  );
};

export default CompanyProfile;
