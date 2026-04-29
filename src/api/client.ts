import {
  loadCredentials,
  saveCredentials,
  clearCredentials,
} from "../utils/credentials.js";

const BASE_URL = process.env.INSIGHTA_API_URL ?? "";
const API_VERSION = process.env.INSIGHTA_API_VERSION ?? "";

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const creds = loadCredentials();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Version": API_VERSION,
    ...(options.headers as Record<string, string>),
  };

  if (creds?.accessToken) {
    headers.Authorization = `Bearer ${creds.accessToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.ok) {
    return response.json() as Promise<T>;
  }

  if (response.status === 401 && retry) {
    return handle401<T>(path, options);
  }

  const errorBody = await safeJson(response);
  throw new Error(
    errorBody?.message || `Request failed with status ${response.status}`,
  );
}

async function requestText(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<string> {
  const creds = loadCredentials();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Version": API_VERSION,
    ...(options.headers as Record<string, string>),
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
  throw new Error(
    errorBody?.message || `Request failed with status ${response.status}`,
  );
}

async function handle401<T>(path: string, options: RequestInit): Promise<T> {
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

    return request<T>(path, options, false);
  } catch (error) {
    clearCredentials();
    promptRelogin();
    throw new Error("Session expired. Please login again.");
  }
}

async function getRefreshToken(refreshToken: string) {
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

  return refreshPromise!;
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function promptRelogin(): void {
  console.error(
    "\n✗ Session expired. Please run `insighta login` to authenticate again.\n",
  );
  process.exit(1);
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  getText: (path: string) => requestText(path),

  post: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "POST",
      body: JSON.stringify(body ?? {}),
    }),

  put: <T>(path: string, body?: any) =>
    request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body ?? {}),
    }),

  delete: <T>(path: string) =>
    request<T>(path, {
      method: "DELETE",
    }),
};