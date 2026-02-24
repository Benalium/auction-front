import type { ClientConfig } from "./client";
import { request } from "./client";
import type {
  MeResponse,
  RegisterPayload,
  RegisterResponse,
  TokenResponse,
  TopUpBalancePayload,
} from "./types";

export function register(config: ClientConfig, payload: RegisterPayload): Promise<RegisterResponse> {
  return request(config, "/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(
  config: ClientConfig,
  username: string,
  password: string
): Promise<TokenResponse> {
  return request(config, "/api/token/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function refreshToken(
  config: ClientConfig,
  refresh: string
): Promise<TokenResponse> {
  return request(config, "/api/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}

export function getMe(config: ClientConfig): Promise<MeResponse> {
  return request(config, "/api/auth/me/");
}

export function topUpBalance(
  config: ClientConfig,
  payload: TopUpBalancePayload
): Promise<MeResponse> {
  return request(config, "/api/auth/balance/top-up/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
