import { useState, useEffect } from "react";
import { Save, User, Phone, MapPin, AlertCircle, CheckCircle, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

const formatCNPJ = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const validateCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;
  return true;
};

const validateCNPJ = (cnpj: string) => {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * weights1[i];
  let remainder = sum % 11;
  const check1 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[12]) !== check1) return false;
  sum = 0;
  for (let i = 0; i < 13; i++) sum += parseInt(digits[i]) * weights2[i];
  remainder = sum % 11;
  const check2 = remainder < 2 ? 0 : 11 - remainder;
  if (parseInt(digits[13]) !== check2) return false;
  return true;
};

interface ProfileRegistrationFormProps {
  onSave?: () => void;
}

const ProfileRegistrationForm = ({ onSave }: ProfileRegistrationFormProps) => {
  const { user } = useAuth();
  const [cpf, setCpf] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load profile data
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("cpf, phone, address, cnpj, pix_key")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        if (data.cpf) setCpf(formatCPF(data.cpf));
        if (data.phone) setPhone(formatPhone(data.phone));
        if (data.address) setAddress(data.address);
        if (data.cnpj) setCnpj(formatCNPJ(data.cnpj));
        if (data.pix_key) setPixKey(data.pix_key);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const isCpfValid = validateCPF(cpf);
  const isPixKeyValid = pixKey.trim().length >= 5;
  const isPhoneValid = phone.replace(/\D/g, "").length >= 10;
  const isAddressValid = address.trim().length >= 10;
  const cnpjDigits = cnpj.replace(/\D/g, "");
  const isCnpjValid = cnpjDigits.length === 0 || validateCNPJ(cnpj);
  const isComplete = isCpfValid && isPixKeyValid && isPhoneValid && isAddressValid && isCnpjValid;

  const handleSave = async () => {
    if (!isComplete || !user) return;
    setSaving(true);
    const { error } = await supabase.rpc("update_own_profile", {
      p_cpf: cpf.replace(/\D/g, ""),
      p_phone: phone.replace(/\D/g, ""),
      p_address: address.trim(),
      p_cnpj: cnpjDigits || null,
      p_pix_key: pixKey.trim() || null,
    });

    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar cadastro. Tente novamente.");
      return;
    }
    toast.success("Cadastro atualizado com sucesso!");
    onSave?.();
  };

  const fieldStatus = (valid: boolean, value: string) => {
    if (!value) return null;
    return valid ? (
      <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
    ) : (
      <AlertCircle className="h-4 w-4 text-destructive" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Complete seu cadastro para receber pagamentos com segurança.</span>{" "}
          Informe seu CPF, telefone e endereço para validar sua conta e liberar sua carteira.
        </p>
      </div>

      {/* CPF */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <User className="h-3.5 w-3.5" /> CPF
        </label>
        <div className="relative mt-1">
          <input
            type="text"
            value={cpf}
            onChange={(e) => setCpf(formatCPF(e.target.value))}
            placeholder="000.000.000-00"
            className="w-full rounded-xl border border-border bg-secondary p-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {fieldStatus(isCpfValid, cpf)}
          </div>
        </div>
      </div>

      {/* MEI (CNPJ) */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5" /> MEI (CNPJ)
          <span className="ml-1 text-[10px] text-muted-foreground/60">Opcional</span>
        </label>
        <div className="relative mt-1">
          <input
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
            placeholder="Informe seu CNPJ (MEI) se for Profissional Autônomo."
            className="w-full rounded-xl border border-border bg-secondary p-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {cnpjDigits.length > 0 && fieldStatus(isCnpjValid, cnpj)}
          </div>
        </div>
        {cnpjDigits.length > 0 && !isCnpjValid && (
          <p className="mt-1 text-[10px] text-destructive">CNPJ inválido. Verifique os dados informados.</p>
        )}
      </div>

      {/* Chave PIX */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <User className="h-3.5 w-3.5" /> Chave PIX
        </label>
        <div className="relative mt-1">
          <input
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            className="w-full rounded-xl border border-border bg-secondary p-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {fieldStatus(isPixKeyValid, pixKey)}
          </div>
        </div>
      </div>

      {/* Telefone */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Phone className="h-3.5 w-3.5" /> Telefone
        </label>
        <div className="relative mt-1">
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="(00) 00000-0000"
            className="w-full rounded-xl border border-border bg-secondary p-3 pr-10 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {fieldStatus(isPhoneValid, phone)}
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> Endereço completo
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Rua, número, bairro, cidade, estado, CEP"
          rows={2}
          className="mt-1 w-full rounded-xl border border-border bg-secondary p-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
        />
        {address && !isAddressValid && (
          <p className="mt-1 text-[10px] text-destructive">Mínimo de 10 caracteres</p>
        )}
      </div>

      <Button
        onClick={handleSave}
        disabled={!isComplete || saving}
        className="w-full gap-2 gradient-primary glow-orange rounded-xl py-5 font-bold text-primary-foreground disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Salvando..." : "Salvar cadastro"}
      </Button>

      {isComplete && (
        <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 px-4 py-2">
          <CheckCircle className="h-4 w-4 text-[hsl(var(--success))]" />
          <p className="text-xs font-medium text-foreground">Cadastro validado para pagamentos</p>
        </div>
      )}
    </div>
  );
};

export default ProfileRegistrationForm;
