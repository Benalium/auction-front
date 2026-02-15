import type { ClientConfig } from "./client";
import { request } from "./client";
import type { BetResponse, CreateBetPayload } from "./types";

export function createBet(
  config: ClientConfig,
  payload: CreateBetPayload
): Promise<BetResponse> {
  return request<BetResponse>(config, "/api/bets/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
