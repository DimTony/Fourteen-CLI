import { api } from "../api/client.js";

export async function login(params: any) {
  return await api.get(`/auth/github`);
}

export async function whoami() {
  return await api.get(`/auth/me`);
}

export async function logout(refreshToken: string) {
  return await api.post(`/auth/logout`, { refresh_token: refreshToken });
}
