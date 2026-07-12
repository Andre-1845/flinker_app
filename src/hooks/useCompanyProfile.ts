import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CompanyProfileData {
  fullName: string;
  cnpj: string;
  phone: string;
  address: string;
  responsibleName: string;
  responsibleCpf: string;
  pixKey: string;
  isVerified: boolean;
}

export type CompanyStatus = "incomplete" | "complete" | "verified";

export const useCompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompanyProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<CompanyStatus>("incomplete");

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      setStatus("incomplete");
      setProfile(null);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      const p: CompanyProfileData = {
        fullName: data.full_name || "",
        cnpj: data.cnpj || "",
        phone: data.phone || "",
        address: data.address || "",
        responsibleName: data.responsible_name || "",
        responsibleCpf: data.cpf || "",
        pixKey: data.pix_key || "",
        isVerified: data.is_verified || false,
      };
      setProfile(p);

      const isComplete =
        p.fullName.trim().length >= 2 &&
        validateCNPJ(p.cnpj) &&
        p.phone.replace(/\D/g, "").length >= 10 &&
        p.address.trim().length >= 10 &&
        p.responsibleName.trim().length >= 3 &&
        validateCPF(p.responsibleCpf) &&
        p.pixKey.trim().length >= 5;

      if (p.isVerified) setStatus("verified");
      else if (isComplete) setStatus("complete");
      else setStatus("incomplete");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return { profile, loading, status, refetch: fetchProfile };
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
