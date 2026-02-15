export type BaseUrl = string | (() => string);

export type TokenStore = {
  getAccessToken: () => string | null;
  setTokens: (access: string, refresh: string) => void;
  clear: () => void;
  getRefreshToken: () => string | null;
};

export interface ClientConfig {
  baseUrl: BaseUrl;
  tokenStore?: TokenStore;
  onTokenRefresh?: (newAccess: string) => void;
}

export function getBaseUrl(config: ClientConfig): string {
  return typeof config.baseUrl === "function" ? config.baseUrl() : config.baseUrl;
}

export async function request<T>(
  config: ClientConfig,
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const base = getBaseUrl(config);
  const url = path.startsWith("http") ? path : `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const token = config.tokenStore?.getAccessToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 && config.tokenStore?.getRefreshToken()) {
    const refreshed = await tryRefresh(config);
    if (refreshed) {
      return request(config, path, options);
    }
  }
  if (!res.ok) {
    const text = await res.text();
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`API error ${status}`);
    this.name = "ApiError";
  }
}

async function tryRefresh(config: ClientConfig): Promise<boolean> {
  const refresh = config.tokenStore?.getRefreshToken();
  if (!refresh) return false;
  try {
    const base = getBaseUrl(config);
    const res = await fetch(`${base.replace(/\/$/, "")}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    const { access, refresh: newRefresh } = data as { access: string; refresh: string };
    config.tokenStore?.setTokens(access, newRefresh);
    config.onTokenRefresh?.(access);
    return true;
  } catch {
    return false;
  }
}
