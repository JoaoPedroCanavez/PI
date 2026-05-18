// src/services/auth.ts
import { fetchApi } from '../services/api';

// Tipagem de entrada (Opcional, mas altamente recomendado com TypeScript)
interface LoginCredentials {
  username: string;
  password: string;
}

// Tipagem de saída (O que o Django nos responde em caso de sucesso)
interface LoginResponse {
  message: string;
  role: 'instrutor' | 'aluno';
  username: string;
}

export interface UserMeResponse {
  id: number;
  username: string;
  email: string;
  role: "instrutor" | "aluno";
}

export async function loginUser(credentials: LoginCredentials) {
  return fetchApi<LoginResponse>('/user/login/', {
    method: 'POST',
    body: JSON.stringify(credentials), // O fetch nativo exige que transformemos o objeto em string
  });
}

export async function getMe() {
  return fetchApi<UserMeResponse>('/user/me/', {
    method: 'GET',
  });
}

export async function logoutUser() {
  return fetchApi('/user/logout/', {
    method: 'POST',
  });
}