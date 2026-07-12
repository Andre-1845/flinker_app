import { api, setToken } from "./api";
import type { User } from "./types";

interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterProfessionalData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  cpf: string;
  phone: string;
  address?: string;
  pix_key?: string;
}

export interface RegisterCompanyData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  cnpj: string;
  responsible_name: string;
  responsible_cpf: string;
  phone: string;
  address?: string;
  pix_key?: string;
}

export async function login(email: string, password: string): Promise<User> {
  const response = await api.post<AuthResponse>("/auth/login", { email, password });
  setToken(response.token);
  return response.user;
}

export async function registerProfessional(data: RegisterProfessionalData): Promise<User> {
  const response = await api.post<AuthResponse>("/auth/register/professional", data);
  setToken(response.token);
  return response.user;
}

export async function registerCompany(data: RegisterCompanyData): Promise<User> {
  const response = await api.post<AuthResponse>("/auth/register/company", data);
  setToken(response.token);
  return response.user;
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } finally {
    setToken(null);
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get<{ data: User }>("/users/me");
  return response.data;
}
