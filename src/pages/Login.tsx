import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, ArrowLeft, FileText, User, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import logo from "@/assets/flinker-logo.png";

const legalDocs = [
  { label: "Termos Gerais", href: "/docs/termos-gerais.pdf" },
  { label: "Termos do Prestador", href: "/docs/termos-prestador.pdf" },
  { label: "Termos da Empresa", href: "/docs/termos-empresa.pdf" },
  { label: "Política de Privacidade", href: "/docs/politica-privacidade.pdf" },
  { label: "Política de Pagamentos", href: "/docs/politica-pagamentos.pdf" },
];

type UserRole = "worker" | "company";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("worker");
  const [isLoading, setIsLoading] = useState(false);

  const { user, loading: authLoading, userRole } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!authLoading && user && userRole) {
      navigate(userRole === "company" ? "/company-dashboard" : "/dashboard", { replace: true });
    }
  }, [authLoading, user, userRole, navigate]);

  useEffect(() => {
    const signupRole = searchParams.get("signup");
    if (signupRole === "worker" || signupRole === "company") {
      setIsSignUp(true);
      setSelectedRole(signupRole);
    }
    const savedEmail = localStorage.getItem("flinker_saved_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [searchParams]);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    setIsLoading(true);

    // Save or clear email based on "remember me"
    if (rememberMe) {
      localStorage.setItem("flinker_saved_email", email);
    } else {
      localStorage.removeItem("flinker_saved_email");
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        toast.error("Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.");
      } else {
        toast.error("E-mail ou senha incorretos");
      }
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .maybeSingle();

    if (roleData?.role === "company") {
      navigate("/company-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (selectedRole === "company") {
      if (!fullName) {
        toast.error("Preencha o nome da empresa");
        return;
      }
    }
    if (!acceptedTerms) {
      toast.error("Aceite os termos para continuar");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: selectedRole,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Conta criada com sucesso! Fazendo login...");
    
    // Auto-login after signup since email confirmation is disabled
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      toast.info("Conta criada! Faça login para continuar.");
      setIsSignUp(false);
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .maybeSingle();

    navigate(roleData?.role === "company" ? "/company-dashboard" : "/dashboard");
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });

    if (result.error) {
      toast.error("Erro ao entrar com Google");
      setIsLoading(false);
      return;
    }

    if (result.redirected) return;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
      .maybeSingle();

    navigate(roleData?.role === "company" ? "/company-dashboard" : "/dashboard");
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-6 pt-12 pb-8">
      <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground">
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm">Voltar</span>
      </button>

      <div className="mx-auto mt-6 w-full max-w-sm animate-slide-up">
        <div className="flex items-center justify-center gap-3">
          <img src={logo} alt="Flinker" className="h-10 w-10" />
          <h1 className="text-2xl font-black text-foreground">
            Flin<span className="text-gradient">ker</span>
          </h1>
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {isSignUp ? "Crie sua conta" : "Entre na sua conta"}
        </p>

        <div className="mt-5 space-y-3">
          {isSignUp && (
            <>
              {/* Role Selection */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Tipo de conta</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedRole("worker")}
                    className={`flex items-center gap-2 rounded-xl border p-3 transition-colors ${
                      selectedRole === "worker"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm font-semibold">Profissional</span>
                  </button>
                  <button
                    onClick={() => setSelectedRole("company")}
                    className={`flex items-center gap-2 rounded-xl border p-3 transition-colors ${
                      selectedRole === "company"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span className="text-sm font-semibold">Empresa</span>
                  </button>
                </div>
              </div>

              {selectedRole === "company" ? (
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Nome da empresa"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-card border-border pl-11 py-5 rounded-xl"
                  />
                </div>
              ) : (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-card border-border pl-11 py-5 rounded-xl"
                  />
                </div>
              )}
            </>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border-border pl-11 py-5 rounded-xl"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (isSignUp ? handleSignUp() : handleLogin())}
              className="bg-card border-border pl-11 py-5 rounded-xl"
            />
          </div>

          {/* Remember me + Forgot password (login only) */}
          {!isSignUp && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(v === true)}
                />
                <label htmlFor="remember" className="text-xs text-muted-foreground">
                  Lembrar meu e-mail
                </label>
              </div>
              <button
                onClick={() => navigate("/forgot-password")}
                className="text-xs font-semibold text-primary"
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          {isSignUp && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                Documentos Legais
              </div>
              <div className="space-y-1.5">
                {legalDocs.map((doc) => (
                  <a
                    key={doc.href}
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary hover:underline"
                  >
                    <span>📄</span> {doc.label}
                  </a>
                ))}
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(v) => setAcceptedTerms(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-tight">
                  Li e aceito os Termos de Uso e a Política de Privacidade do Flinker.
                </label>
              </div>
            </div>
          )}

          <Button
            onClick={isSignUp ? handleSignUp : handleLogin}
            disabled={isLoading || (isSignUp && !acceptedTerms)}
            className="w-full gradient-primary glow-orange rounded-xl py-6 text-base font-bold text-primary-foreground disabled:opacity-50"
          >
            {isLoading ? "Carregando..." : isSignUp ? "Criar Conta" : "Entrar"}
          </Button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full rounded-xl py-6 border-border bg-card text-foreground"
          >
            Continuar com Google
          </Button>
        </div>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {isSignUp ? "Já tem conta?" : "Não tem conta?"}{" "}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setAcceptedTerms(false); }}
            className="font-semibold text-primary"
          >
            {isSignUp ? "Entrar" : "Criar conta"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
