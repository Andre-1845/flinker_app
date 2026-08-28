import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";
import logo from "@/assets/flinker-logo.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      toast.error("Informe seu e-mail");
      return;
    }
    setIsLoading(true);
    try {
      // O backend responde com sucesso genérico mesmo se o e-mail não existir
      // (evita revelar quais e-mails estão cadastrados) — ver AuthController::forgotPassword.
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Link de recuperação enviado!");
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Erro ao enviar link. Tente novamente.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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

        {sent ? (
          <div className="mt-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Verifique seu e-mail</h2>
            <p className="text-sm text-muted-foreground">
              Enviamos um link de recuperação para <strong className="text-foreground">{email}</strong>. 
              Verifique sua caixa de entrada e spam.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/login")}
              className="w-full rounded-xl py-6 border-border bg-card text-foreground"
            >
              Voltar ao login
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Informe seu e-mail para receber um link de recuperação de senha.
            </p>
            <div className="mt-6 space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="E-mail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                  className="bg-card border-border pl-11 py-6 rounded-xl"
                />
              </div>
              <Button
                onClick={handleReset}
                disabled={isLoading}
                className="w-full gradient-primary glow-orange rounded-xl py-6 text-base font-bold text-primary-foreground"
              >
                {isLoading ? "Enviando..." : "Enviar link de recuperação"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
