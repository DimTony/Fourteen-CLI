import { api } from "../api/client.js";
export async function login(params) {
    return await api.get(`/auth/github`);
}
export async function whoami() {
    return await api.get(`/auth/me`);
}
export async function logout(refreshToken) {
    return await api.post(`/auth/logout`, { refresh_token: refreshToken });
}
