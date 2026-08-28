import { api } from "./api";
import type { FlinkMatch, PaginatedResponse } from "./types";

export function listMyMatches(): Promise<PaginatedResponse<FlinkMatch>> {
  return api.get<PaginatedResponse<FlinkMatch>>("/matches");
}

export async function expressInterest(flinkId: number): Promise<FlinkMatch> {
  const response = await api.post<{ data: FlinkMatch }>("/matches", { flink_id: flinkId });
  return response.data;
}

export async function acceptMatch(matchId: number): Promise<FlinkMatch> {
  const response = await api.put<{ data: FlinkMatch }>(`/matches/${matchId}/accept`);
  return response.data;
}

export async function confirmMatch(matchId: number): Promise<FlinkMatch> {
  const response = await api.put<{ data: FlinkMatch }>(`/matches/${matchId}/confirm`);
  return response.data;
}

export async function checkInMatch(matchId: number, latitude: number, longitude: number): Promise<FlinkMatch> {
  const response = await api.post<{ data: FlinkMatch }>(`/matches/${matchId}/checkin`, { latitude, longitude });
  return response.data;
}

/**
 * Confirmação do profissional de que o serviço foi executado. O Flink só é
 * marcado como concluído (e o pagamento liberado) quando a empresa também
 * confirmar — ver PUT /flinks/{id}/complete e ConfirmCompletionAction no backend.
 */
export async function confirmMatchCompletion(matchId: number): Promise<FlinkMatch> {
  const response = await api.put<{ data: FlinkMatch }>(`/matches/${matchId}/confirm-completion`);
  return response.data;
}

export async function cancelMatch(matchId: number): Promise<FlinkMatch> {
  const response = await api.put<{ data: FlinkMatch }>(`/matches/${matchId}/cancel`);
  return response.data;
}
