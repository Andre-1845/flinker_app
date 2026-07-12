import { useMemo } from "react";
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

/**
 * Antes buscava a tabela `profiles` do Supabase. Agora deriva tudo do usuário
 * autenticado (`/users/me`, já carregado no AuthContext) — como o cadastro no
 * backend Laravel já exige CNPJ/responsável/telefone de cara, só falta
 * endereço/chave PIX pra considerar o cadastro "completo".
 *
 * A Flinker ainda não tem um conceito de empresa "verificada" (selo azul) no
 * backend — fica sempre "complete" no máximo por enquanto. Ver Fase 6 do
 * backend (Admin) quando isso for definido.
 */
export const useCompanyProfile = () => {
  const { user, loading, refreshUser } = useAuth();

  const profile: CompanyProfileData | null = useMemo(() => {
    if (!user?.company) return null;
    const c = user.company;
    return {
      fullName: user.name,
      cnpj: c.cnpj,
      phone: c.phone,
      address: c.address ?? "",
      responsibleName: c.responsible_name,
      responsibleCpf: c.responsible_cpf,
      pixKey: c.pix_key ?? "",
      isVerified: false,
    };
  }, [user]);

  const status: CompanyStatus = useMemo(() => {
    if (!profile) return "incomplete";
    if (profile.isVerified) return "verified";
    const isComplete = profile.address.trim().length >= 5 && profile.pixKey.trim().length >= 3;
    return isComplete ? "complete" : "incomplete";
  }, [profile]);

  return { profile, loading, status, refetch: refreshUser };
};
