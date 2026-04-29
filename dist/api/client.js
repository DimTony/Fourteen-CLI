import { loadCredentials, saveCredentials, clearCredentials, } from "../utils/credentials.js";
const BASE_URL = process.env.INSIGHTA_API_URL ?? "";
const API_VERSION = process.env.INSIGHTA_API_VERSION ?? "";
let isRefreshing = false;
let refreshPromise = null;
async function request(path, options = {}, retry = true) {
    const creds = loadCredentials();
    const headers = {
        "Content-Type": "application/json",
        "X-API-Version": API_VERSION,
        ...options.headers,
    };
    if (creds?.accessToken) {
        headers.Authorization = `Bearer ${creds.accessToken}`;
    }
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
    });
    if (response.ok) {
        return response.json();
    }
    if (response.status === 401 && retry) {
        return handle401(path, options);
    }
    const errorBody = await safeJson(response);
    throw new Error(errorBody?.message || `Request failed with status ${response.status}`);
}
async function requestText(path, options = {}, retry = true) {
    const creds = loadCredentials();
    const headers = {
        "Content-Type": "application/json",
        "X-API-Version": API_VERSION,
        ...options.headers,
    };
    if (creds?.accessToken) {
        headers.Authorization = `Bearer ${creds.accessToken}`;
    }
    const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    if (response.ok) {
        return response.text();
    }
    if (response.status === 401 && retry) {
        const creds = loadCredentials();
        if (!creds?.refreshToken) {
            clearCredentials();
            promptRelogin();
            throw new Error("Session expired. No refresh token available.");
        }
        const newTokens = await getRefreshToken(creds.refreshToken);
        saveCredentials({
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token,
            username: creds.username,
        });
        return requestText(path, options, false);
    }
    const errorBody = await safeJson(response);
    throw new Error(errorBody?.message || `Request failed with status ${response.status}`);
}
async function handle401(path, options) {
    const creds = loadCredentials();
    if (!creds?.refreshToken) {
        clearCredentials();
        promptRelogin();
        throw new Error("Session expired. No refresh token available.");
    }
    try {
        const newTokens = await getRefreshToken(creds.refreshToken);
        saveCredentials({
            accessToken: newTokens.access_token,
            refreshToken: newTokens.refresh_token,
            username: creds.username,
        });
        return request(path, options, false);
    }
    catch (error) {
        clearCredentials();
        promptRelogin();
        throw new Error("Session expired. Please login again.");
    }
}
async function getRefreshToken(refreshToken) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-Version": API_VERSION,
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
        })
            .then(async (res) => {
            if (!res.ok) {
                const error = await res.text();
                throw new Error(`Refresh failed: ${error}`);
            }
            return res.json();
        })
            .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
        });
    }
    return refreshPromise;
}
async function safeJson(res) {
    try {
        return await res.json();
    }
    catch {
        return null;
    }
}
function promptRelogin() {
    console.error("\n✗ Session expired. Please run `insighta login` to authenticate again.\n");
    process.exit(1);
}
export const api = {
    get: (path) => request(path),
    getText: (path) => requestText(path),
    post: (path, body) => request(path, {
        method: "POST",
        body: JSON.stringify(body ?? {}),
    }),
    put: (path, body) => request(path, {
        method: "PUT",
        body: JSON.stringify(body ?? {}),
    }),
    delete: (path) => request(path, {
        method: "DELETE",
    }),
};
