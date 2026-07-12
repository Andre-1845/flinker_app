/**
 * Tipos espelhando os Resources da API Laravel (ver flinker_backend/app/Http/Resources).
 * Mantidos manualmente em sincronia com o backend — se um campo mudar lá, atualize aqui.
 */

export type UserProfile = "professional" | "company" | "admin";

/** Papel usado nas telas (nomenclatura antiga do Lovable, mantida pra não quebrar rotas/telas existentes). */
export type FrontendRole = "worker" | "company" | "admin";

export function profileToFrontendRole(profile: UserProfile): FrontendRole {
  return profile === "professional" ? "worker" : profile;
}

export interface Professional {
  id: number;
  cpf: string;
  phone: string;
  address: string | null;
  pix_key: string | null;
  photo_url: string | null;
  is_mei: boolean;
  cnpj: string | null;
  reputation: number;
}

export interface Company {
  id: number;
  cnpj: string;
  responsible_name: string;
  responsible_cpf: string;
  phone: string;
  address: string | null;
  pix_key: string | null;
  reputation: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile: UserProfile;
  is_active: boolean;
  professional?: Professional | null;
  company?: Company | null;
  created_at: string;
}

export type FlinkStatus = "open" | "matched" | "confirmed" | "in_progress" | "completed" | "cancelled";

export interface Flink {
  id: number;
  company_id: number;
  activity_type: string;
  location: string;
  latitude: number;
  longitude: number;
  start_date_time: string;
  end_date_time: string;
  requirements: string | null;
  status: FlinkStatus;
  status_label: string;
  pricing: {
    net_value: number;
    platform_margin: number;
    total_value: number;
  };
  distance_km?: number;
  company?: Company;
  created_at: string;
}

export type MatchStatus = "pending" | "accepted" | "confirmed" | "rejected" | "cancelled";

export interface FlinkMatch {
  id: number;
  flink_id: number;
  professional_id: number;
  status: MatchStatus;
  status_label: string;
  checked_in_at: string | null;
  flink?: Flink;
  professional?: Professional;
  created_at: string;
}

export interface ScheduleBlock {
  id: number;
  flink_id: number | null;
  start_date_time: string;
  end_date_time: string;
  reason: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
}
