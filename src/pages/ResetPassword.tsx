import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import logo from "@/assets/flinker-logo.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // O backend monta o link do e-mail como /reset-password?token=...&email=...
  // (ver AppServiceProvider::boot -> ResetPassword::createUrlUsing). Sem os
  // dois, não tem como chamar POST /auth/reset-password.
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const hasValidLink = Boolean(token && email);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    if (!password || !confirmPassword) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não conferem");
      return;
    }
    if (!token || !email) {
      toast.error("Link inválido ou expirado");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      setSuccess(true);
      toast.success("Senha atualizada com sucesso!");
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : "Erro ao atualizar senha. Tente novamente.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm text-center space-y-4 animate-slide-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Senha atualizada!</h2>
          <p className="text-sm text-muted-foreground">
            Sua senha foi alterada com sucesso. Faça login com a nova senha.
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="w-full gradient-primary glow-orange rounded-xl py-6 text-base font-bold text-primary-foreground"
          >
            Ir para o login
          </Button>
        </div>
      </div>
    );
  }

  if (!hasValidLink) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm text-center space-y-4">
          <img src={logo} alt="Flinker" className="mx-auto h-12 w-12" />
          <h2 className="text-lg font-bold text-foreground">Link inválido ou expirado</h2>
          <p className="text-sm text-muted-foreground">
            Solicite um novo link de recuperação de senha.
          </p>
          <Button
            onClick={() => navigate("/forgot-password")}
            className="w-full gradient-primary glow-orange rounded-xl py-6 text-base font-bold text-primary-foreground"
          >
            Solicitar novo link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-12">
      <button onClick={() => navigate("/login")} className="flex items-center gap-2 text-muted-foreground">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm">Voltar ao login</span>
      </button>

      <div className="mx-auto mt-8 w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-center gap-3">
          <img src={logo} alt="Flinker" className="h-10 w-10" />
          <h1 className="text-2xl font-black text-foreground">
            Flin<span className="text-gradient">ker</span>
          </h1>
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Defina sua nova senha
        </p>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Nova senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-card border-border pl-11 py-6 rounded-xl"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              className="bg-card border-border pl-11 py-6 rounded-xl"
            />
          </div>
          <Button
            onClick={handleUpdate}
            disabled={isLoading}
            className="w-full gradient-primary glow-orange rounded-xl py-6 text-base font-bold text-primary-foreground"
          >
            {isLoading ? "Atualizando..." : "Atualizar senha"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
