import { useNavigate } from "react-router-dom";
import { Briefcase, User, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/flinker-logo.png";
import heroBg from "@/assets/hero-bg.jpg";

const Onboarding = () => {
  const navigate = useNavigate();
  const { setGuestRole } = useAuth();

  const handleSelectRole = (role: "worker" | "company") => {
    setGuestRole(role);
    navigate(role === "company" ? "/company-dashboard" : "/dashboard");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="h-full w-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
      </div>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 animate-slide-up">
        <img src={logo} alt="Flinker" className="h-20 w-20" />
        <h1 className="mt-4 text-4xl font-black tracking-tight text-foreground">
          Flin<span className="text-gradient">ker</span>
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Encontre Flinks perto de você
        </p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Flinks são oportunidades rápidas para profissionais autônomos, sem vínculo, disponíveis na plataforma. Você escolhe quando e onde atuar, conecta-se a empresas e recebe por tarefa realizada.
        </p>

        <div className="mt-8 flex items-center gap-3 rounded-xl bg-card/60 px-4 py-3">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Match inteligente • Pagamento via PIX • Avaliações</span>
        </div>

        <div className="mt-10 w-full space-y-3">
          <p className="text-center text-sm font-medium text-muted-foreground">Como você quer usar o Flinker?</p>
          
          <button
            onClick={() => handleSelectRole("worker")}
            className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:bg-card/80"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-foreground">Sou Profissional</p>
              <p className="text-xs text-muted-foreground">Encontre flinks perfeitos para você</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </button>

          <button
            onClick={() => handleSelectRole("company")}
            className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:bg-card/80"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
              <Briefcase className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-foreground">Sou Empresa</p>
              <p className="text-xs text-muted-foreground">Encontre o profissional ideal rapidamente</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </button>
        </div>

        <Button
          variant="link"
          className="mt-6 text-muted-foreground"
          onClick={() => navigate("/login")}
        >
          Já tenho uma conta
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
