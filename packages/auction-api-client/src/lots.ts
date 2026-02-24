import type { ClientConfig } from "./client";
import { request } from "./client";
import type { CreateLotPayload, Lot, UpdateLotPayload } from "./types";

export function listLots(
  config: ClientConfig,
  params?: { search?: string }
): Promise<Lot[]> {
  let path = "/api/lots/";
  if (params?.search?.trim()) {
    path += `?search=${encodeURIComponent(params.search.trim())}`;
  }
  return request<Lot[]>(config, path);
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

export function updateLot(
  config: ClientConfig,
  id: number,
  payload: UpdateLotPayload
): Promise<Lot> {
  return request<Lot>(config, `/api/lots/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function finishLot(config: ClientConfig, id: number): Promise<Lot> {
  return request<Lot>(config, `/api/lots/${id}/finish/`, {
    method: "POST",
  });
}

export function deleteLot(config: ClientConfig, id: number): Promise<void> {
  return request<void>(config, `/api/lots/${id}/`, {
    method: "DELETE",
  });
}
