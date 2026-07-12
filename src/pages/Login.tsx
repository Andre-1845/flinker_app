import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mail, Lock, ArrowLeft, FileText, User, Briefcase, Building2, IdCard, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { login, registerProfessional, registerCompany } from "@/lib/auth";
import { ApiError } from "@/lib/api";
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
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [responsibleCpf, setResponsibleCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("worker");
  const [isLoading, setIsLoading] = useState(false);

  const { user, loading: authLoading, userRole, setAuthenticatedUser } = useAuth();

  // Redireciona quem já está logado pro dashboard certo
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

  const handleApiError = (error: unknown, fallback: string) => {
    if (error instanceof ApiError) {
      const firstFieldError = error.errors ? Object.values(error.errors)[0]?.[0] : undefined;
      toast.error(firstFieldError ?? error.message ?? fallback);
      return;
    }
    toast.error(fallback);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    setIsLoading(true);

    if (rememberMe) {
      localStorage.setItem("flinker_saved_email", email);
    } else {
      localStorage.removeItem("flinker_saved_email");
    }

    try {
      const loggedUser = await login(email, password);
      setAuthenticatedUser(loggedUser);
      navigate(loggedUser.profile === "company" ? "/company-dashboard" : "/dashboard");
    } catch (error) {
      handleApiError(error, "E-mail ou senha incorretos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    if (selectedRole === "worker" && (!cpf || !phone)) {
      toast.error("Preencha CPF e telefone");
      return;
    }
    if (selectedRole === "company" && (!cnpj || !responsibleCpf || !phone)) {
      toast.error("Preencha CNPJ, CPF do responsável e telefone");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Aceite os termos para continuar");
      return;
    }
    if (password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const newUser =
        selectedRole === "company"
          ? await registerCompany({
              name: fullName,
              email,
              password,
              password_confirmation: password,
              cnpj: cnpj.replace(/\D/g, ""),
              responsible_name: fullName,
              responsible_cpf: responsibleCpf.replace(/\D/g, ""),
              phone,
            })
          : await registerProfessional({
              name: fullName,
              email,
              password,
              password_confirmation: password,
              cpf: cpf.replace(/\D/g, ""),
              phone,
            });

      setAuthenticatedUser(newUser);
      toast.success("Conta criada com sucesso!");
      navigate(newUser.profile === "company" ? "/company-dashboard" : "/dashboard");
    } catch (error) {
      handleApiError(error, "Não foi possível criar a conta. Verifique os dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
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
              {/* Seleção de perfil */}
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
                    placeholder="Nome do responsável"
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

              {/* Campos obrigatórios pelo backend, além do nome/email/senha */}
              {selectedRole === "worker" ? (
                <div className="relative">
                  <IdCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="CPF (somente números)"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="bg-card border-border pl-11 py-5 rounded-xl"
                  />
                </div>
              ) : (
                <>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="CNPJ (somente números)"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="bg-card border-border pl-11 py-5 rounded-xl"
                    />
                  </div>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="CPF do responsável"
                      value={responsibleCpf}
                      onChange={(e) => setResponsibleCpf(e.target.value)}
                      className="bg-card border-border pl-11 py-5 rounded-xl"
                    />
                  </div>
                </>
              )}
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Telefone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-card border-border pl-11 py-5 rounded-xl"
                />
              </div>
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

          {/* Lembrar e-mail + esqueci senha (só no login) */}
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
