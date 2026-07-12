import { api } from "./api";
import type { Flink, PaginatedResponse } from "./types";

export interface CreateFlinkData {
  activity_type: string;
  location: string;
  latitude: number;
  longitude: number;
  start_date_time: string;
  end_date_time: string;
  requirements?: string;
  net_value: number;
}

export type UpdateFlinkData = Partial<CreateFlinkData> & { status?: string };

export function listCompanyFlinks(companyId: number) {
  return api.get<PaginatedResponse<Flink>>(`/flinks/company/${companyId}`);
}

export function listActiveFlinks(params?: { latitude?: number; longitude?: number; radius_km?: number }) {
  return api.get<PaginatedResponse<Flink>>("/flinks/active", params);
}

export function getFlink(id: number) {
  return api.get<{ data: Flink }>(`/flinks/${id}`).then((r) => r.data);
}

export async function createFlink(data: CreateFlinkData): Promise<Flink> {
  const response = await api.post<{ data: Flink }>("/flinks", data);
  return response.data;
}

export async function updateFlink(id: number, data: UpdateFlinkData): Promise<Flink> {
  const response = await api.put<{ data: Flink }>(`/flinks/${id}`, data);
  return response.data;
}

export function deleteFlink(id: number) {
  return api.delete(`/flinks/${id}`);
}
