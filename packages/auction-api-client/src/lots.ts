import type { ClientConfig } from "./client";
import { request } from "./client";
import type { CreateLotPayload, Lot } from "./types";

export function listLots(config: ClientConfig): Promise<Lot[]> {
  return request<Lot[]>(config, "/api/lots/");
}

export function getLot(config: ClientConfig, id: number): Promise<Lot> {
  return request<Lot>(config, `/api/lots/${id}/`);
}

export function createLot(
  config: ClientConfig,
  payload: CreateLotPayload
): Promise<Lot> {
  return request<Lot>(config, "/api/lots/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
