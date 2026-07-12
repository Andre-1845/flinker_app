import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Crown, Eye, Zap, Shield, Star, TrendingUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const workerBenefits = [
  { icon: BadgeCheck, text: "Selo \"Verificado\" no perfil" },
  { icon: Eye, text: "Maior visibilidade no match" },
  { icon: Crown, text: "Prioridade em flinks com melhor remuneração" },
  { icon: TrendingUp, text: "Destaque nos resultados de busca" },
  { icon: Zap, text: "Acesso antecipado a oportunidades" },
  { icon: Star, text: "Benefícios exclusivos futuros" },
];

const companyBenefits = [
  { icon: BadgeCheck, text: "Selo \"Empresa Verificada\"" },
  { icon: Eye, text: "Destaque na listagem para profissionais" },
  { icon: TrendingUp, text: "Maior taxa de aceitação de flinks" },
  { icon: Crown, text: "Prioridade no match com melhores avaliados" },
  { icon: Shield, text: "Maior credibilidade no perfil" },
  { icon: Star, text: "Benefícios exclusivos futuros" },
];

const VerificationSubscription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = (searchParams.get("type") as "worker" | "company") || "worker";
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");

  const isWorker = userType === "worker";
  const monthlyPrice = isWorker ? 29.9 : 59.9;
  const annualPrice = isWorker ? 24.9 : 49.9;
  const benefits = isWorker ? workerBenefits : companyBenefits;
  const currentPrice = plan === "monthly" ? monthlyPrice : annualPrice;

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <div className="gradient-navy px-5 pb-8 pt-12 text-center">
        <button onClick={() => navigate(-1)} className="absolute left-4 top-12 rounded-full bg-secondary p-2">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
          <BadgeCheck className="h-9 w-9 text-blue-500" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-foreground">Se destaque na Flinker</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ganhe mais visibilidade, confiança e prioridade nos matches.
        </p>
      </div>

      <div className="px-5 pt-6 space-y-6">
        {/* Plan Toggle */}
        <div className="flex rounded-xl bg-secondary p-1">
          <button
            onClick={() => setPlan("monthly")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${plan === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Mensal
          </button>
          <button
            onClick={() => setPlan("annual")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${plan === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Anual <span className="text-[10px]">(-17%)</span>
          </button>
        </div>

        {/* Price */}
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">
            R$ {currentPrice.toFixed(2).replace(".", ",")}
          </p>
          <p className="text-sm text-muted-foreground">
            {plan === "monthly" ? "por mês" : "por mês (cobrado anualmente)"}
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">BENEFÍCIOS INCLUSOS</h3>
          {benefits.map((b, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <b.icon className="h-4 w-4 text-blue-500" />
              </div>
              <span className="text-sm text-foreground">{b.text}</span>
            </div>
          ))}
        </div>

        {/* Requirements */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Requisitos:</span>{" "}
            {isWorker
              ? "CPF válido, telefone verificado e e-mail confirmado."
              : "CNPJ válido e dados cadastrais completos."}
          </p>
        </div>

        {/* CTA */}
        <Button className="w-full py-6 text-base font-bold bg-blue-500 hover:bg-blue-600 text-white">
          <BadgeCheck className="mr-2 h-5 w-5" />
          Assinar agora
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          Renovação automática. Cancele quando quiser.
          Benefícios mantidos até o fim do ciclo pago.
        </p>
      </div>
    </div>
  );
};

export default VerificationSubscription;
