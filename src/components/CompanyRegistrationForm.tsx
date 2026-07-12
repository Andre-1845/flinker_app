import { useState, useEffect } from "react";
import { Save, Building2, Phone, MapPin, AlertCircle, CheckCircle, User, FileText, Search, Loader2, Key, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import type { Company, User as ApiUser } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const formatCNPJ = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCEP = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const validateCNPJ = (cnpj: string) => {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  const calc = (size: number) => {
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(digits.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    const result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return result === parseInt(digits.charAt(size));
  };
  return calc(12) && calc(13);
};

const validateCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10) r = 0;
  if (r !== parseInt(digits[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10) r = 0;
  return r === parseInt(digits[10]);
};

interface CompanyRegistrationFormProps {
  onSave?: () => void;
}

const CompanyRegistrationForm = ({ onSave }: CompanyRegistrationFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [responsibleCpf, setResponsibleCpf] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    const load = () => {
      if (!user?.company) {
        setLoadingData(false);
        return;
      }
      const c = user.company;
      setCompanyName(user.name || "");
      setCnpj(c.cnpj ? formatCNPJ(c.cnpj) : "");
      setPhone(c.phone ? formatPhone(c.phone) : "");
      setResponsibleName(c.responsible_name || "");
      setResponsibleCpf(c.responsible_cpf ? formatCPF(c.responsible_cpf) : "");
      setPixKey(c.pix_key || "");
      if (c.address) {
        const parts = c.address.split(" | ");
        if (parts.length >= 3) {
          setCep(parts[0] || "");
          setAddress(parts[1] || "");
          setCity(parts[2]?.split(" - ")[0] || "");
          setState(parts[2]?.split(" - ")[1] || "");
        } else {
          setAddress(c.address);
        }
      }
      setLoadingData(false);
    };
    load();
  }, [user]);

  const isCompanyNameValid = companyName.trim().length >= 2;
  const isCnpjValid = validateCNPJ(cnpj);
  const isPhoneValid = phone.replace(/\D/g, "").length >= 10;
  const isCepValid = cep.replace(/\D/g, "").length === 8;
  const isAddressValid = address.trim().length >= 10;
  const isResponsibleNameValid = responsibleName.trim().length >= 3;
  const isResponsibleCpfValid = validateCPF(responsibleCpf);
  const isPixKeyValid = pixKey.trim().length >= 5;
  const isComplete = isCompanyNameValid && isCnpjValid && isPhoneValid && isCepValid && isAddressValid && isResponsibleNameValid && isResponsibleCpfValid && isPixKeyValid;

  const searchCep = async () => {
    const cepDigits = cep.replace(/\D/g, "");
    if (cepDigits.length !== 8) { toast.error("CEP inválido"); return; }
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
      const data = await response.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
      } else {
        setAddress(`${data.logradouro}${data.complemento ? `, ${data.complemento}` : ""}, ${data.bairro}`);
        setCity(data.localidade);
        setState(data.uf);
        toast.success("Endereço encontrado!");
      }
    } catch {
      toast.error("Erro ao buscar CEP");
    }
    setLoadingCep(false);
  };

  const handleSave = async () => {
    if (!user?.company) {
      toast.error("Você precisa criar uma conta para salvar o cadastro.");
      navigate("/login?signup=company");
      return;
    }
    if (!isComplete) {
      toast.error("Preencha todos os campos corretamente.");
      return;
    }
    setSaving(true);
    const fullAddress = `${cep} | ${address} | ${city} - ${state}`;

    try {
      if (companyName.trim() !== user.name) {
        await api.put<{ data: ApiUser }>("/users/me", { name: companyName.trim() });
      }
      await api.put<{ data: Company }>(`/companies/${user.company.id}`, {
        responsible_name: responsibleName.trim(),
        responsible_cpf: responsibleCpf.replace(/\D/g, ""),
        phone: phone.replace(/\D/g, ""),
        address: fullAddress,
        pix_key: pixKey.trim(),
      });

      toast.success("Cadastro da empresa salvo com sucesso!");
      onSave?.();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Erro ao salvar. Tente novamente.";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const fieldStatus = (valid: boolean, value: string) => {
    if (!value) return null;
    return valid ? (
      <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
    ) : (
      <AlertCircle className="h-4 w-4 text-destructive" />
    );
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!user && (
        <button
          onClick={() => navigate("/login?signup=company")}
          className="flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left transition-all hover:bg-primary/10"
        >
          <LogIn className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Crie sua conta para salvar</p>
            <p className="text-xs text-muted-foreground">O cadastro será vinculado à sua conta após o login.</p>
          </div>
        </button>
      )}

      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Complete o cadastro para criar flinks.</span>{" "}
          Todos os campos são obrigatórios para liberar publicação e pagamentos.
        </p>
      </div>

      {/* Nome da empresa */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" /> Nome da empresa
        </label>
        <div className="relative mt-1">
          <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Nome da empresa"
            className="w-full rounded-xl border border-border bg-secondary p-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{fieldStatus(isCompanyNameValid, companyName)}</div>
        </div>
      </div>

      {/* CNPJ */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <FileText className="h-3.5 w-3.5" /> CNPJ
        </label>
        <div className="relative mt-1">
          <input type="text" value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} placeholder="00.000.000/0000-00"
            className="w-full rounded-xl border border-border bg-secondary p-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{fieldStatus(isCnpjValid, cnpj)}</div>
        </div>
        {cnpj && !isCnpjValid && cnpj.replace(/\D/g, "").length === 14 && (
          <p className="mt-1 text-[10px] text-destructive">CNPJ inválido</p>
        )}
      </div>

      {/* Nome do responsável */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <User className="h-3.5 w-3.5" /> Nome do responsável
        </label>
        <div className="relative mt-1">
          <input type="text" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} placeholder="Nome completo do responsável"
            className="w-full rounded-xl border border-border bg-secondary p-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{fieldStatus(isResponsibleNameValid, responsibleName)}</div>
        </div>
      </div>

      {/* CPF do responsável */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <FileText className="h-3.5 w-3.5" /> CPF do responsável
        </label>
        <div className="relative mt-1">
          <input type="text" value={responsibleCpf} onChange={(e) => setResponsibleCpf(formatCPF(e.target.value))} placeholder="000.000.000-00"
            className="w-full rounded-xl border border-border bg-secondary p-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{fieldStatus(isResponsibleCpfValid, responsibleCpf)}</div>
        </div>
      </div>

      {/* Telefone */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Phone className="h-3.5 w-3.5" /> Telefone
        </label>
        <div className="relative mt-1">
          <input type="text" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(00) 00000-0000"
            className="w-full rounded-xl border border-border bg-secondary p-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{fieldStatus(isPhoneValid, phone)}</div>
        </div>
      </div>

      {/* CEP + Busca */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> CEP
        </label>
        <div className="mt-1 flex gap-2">
          <div className="relative flex-1">
            <input type="text" value={cep} onChange={(e) => setCep(formatCEP(e.target.value))} placeholder="00000-000"
              className="w-full rounded-xl border border-border bg-secondary p-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{fieldStatus(isCepValid, cep)}</div>
          </div>
          <Button type="button" onClick={searchCep} disabled={!isCepValid || loadingCep} className="rounded-xl px-4 gradient-primary text-primary-foreground">
            {loadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Endereço */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> Endereço completo
        </label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro" rows={2}
          className="mt-1 w-full rounded-xl border border-border bg-secondary p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none" />
        {city && state && <p className="mt-1 text-[10px] text-muted-foreground">{city} - {state}</p>}
      </div>

      {/* Chave PIX */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Key className="h-3.5 w-3.5" /> Chave PIX
        </label>
        <div className="relative mt-1">
          <input type="text" value={pixKey} onChange={(e) => setPixKey(e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória"
            className="w-full rounded-xl border border-border bg-secondary p-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{fieldStatus(isPixKeyValid, pixKey)}</div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={!isComplete || saving}
        className="w-full gap-2 gradient-primary glow-orange rounded-xl py-5 font-bold text-primary-foreground disabled:opacity-50">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Salvar cadastro da empresa
      </Button>

      {isComplete && (
        <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 px-4 py-2">
          <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
          <p className="text-xs font-medium text-foreground">Cadastro validado — pronto para criar flinks</p>
        </div>
      )}
    </div>
  );
};

export default CompanyRegistrationForm;
