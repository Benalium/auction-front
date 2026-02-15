import type { ClientConfig } from "./client";
import { request } from "./client";
import type { RegisterPayload, RegisterResponse, TokenResponse } from "./types";

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
