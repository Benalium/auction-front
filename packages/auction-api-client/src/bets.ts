import type { ClientConfig } from "./client";
import { request } from "./client";
import type { BetResponse, CreateBetPayload } from "./types";

/**
 * GET /api/bets/ — list current user's active bets (requires auth).
 */
export function listBets(config: ClientConfig): Promise<BetResponse[]> {
  return request<BetResponse[]>(config, "/api/bets/");
}

export function createBet(
  config: ClientConfig,
  payload: CreateBetPayload
): Promise<BetResponse> {
  return request<BetResponse>(config, "/api/bets/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
