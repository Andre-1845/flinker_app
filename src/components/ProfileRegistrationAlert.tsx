import { AlertCircle, CheckCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileRegistrationAlertProps {
  isComplete: boolean;
  variant?: "profile" | "wallet";
}

const ProfileRegistrationAlert = ({ isComplete, variant = "profile" }: ProfileRegistrationAlertProps) => {
  const navigate = useNavigate();

  if (isComplete) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 px-4 py-3">
        <CheckCircle className="h-4 w-4 flex-shrink-0 text-[hsl(var(--success))]" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Cadastro validado para pagamentos</span>
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={() => variant === "wallet" ? navigate("/profile") : undefined}
      className={`flex w-full items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-left ${variant === "wallet" ? "transition-all hover:bg-warning/10" : ""}`}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">Complete seu cadastro</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {variant === "wallet"
            ? "Seu cadastro está incompleto. Complete CPF, telefone e endereço no Perfil para liberar saques e recebimentos."
            : "Informe seu CPF, telefone e endereço para validar sua conta e liberar sua carteira."}
        </p>
      </div>
      {variant === "wallet" && <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />}
    </button>
  );
};

export default ProfileRegistrationAlert;
