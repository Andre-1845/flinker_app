import { api } from "./api";
import type { ScheduleBlock } from "./types";

export async function listMySchedule(): Promise<ScheduleBlock[]> {
  const response = await api.get<{ data: ScheduleBlock[] }>("/schedule");
  return response.data;
}

export async function blockSchedule(data: {
  start_date_time: string;
  end_date_time: string;
  reason?: string;
}): Promise<ScheduleBlock> {
  const response = await api.post<{ data: ScheduleBlock }>("/schedule/block", data);
  return response.data;
}
