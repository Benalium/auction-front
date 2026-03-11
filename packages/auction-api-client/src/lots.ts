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
  // If images are provided, use multipart/form-data; otherwise send JSON as before.
  if (payload.images && payload.images.length > 0) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("starting_price", String(payload.starting_price));
    formData.append("end_time", payload.end_time);
    // For now, when uploading files мы не отправляем images_urls —
    // backend сам заполнит их путями к загруженным файлам.
    for (const file of payload.images) {
      formData.append("images", file);
    }
    return request<Lot>(config, "/api/lots/", {
      method: "POST",
      body: formData,
    });
  }

  const { images, ...jsonPayload } = payload;
  return request<Lot>(config, "/api/lots/", {
    method: "POST",
    body: JSON.stringify(jsonPayload),
  });
}

export function updateLot(
  config: ClientConfig,
  id: number,
  payload: UpdateLotPayload
): Promise<Lot> {
  if (payload.images && payload.images.length > 0) {
    const formData = new FormData();
    if (payload.name != null) {
      formData.append("name", payload.name);
    }
    if (payload.starting_price != null) {
      formData.append("starting_price", String(payload.starting_price));
    }
    if (payload.end_time != null) {
      formData.append("end_time", payload.end_time);
    }
    for (const file of payload.images) {
      formData.append("images", file);
    }
    // images_urls при multipart можно не указывать: backend добавит новые URL.
    return request<Lot>(config, `/api/lots/${id}/`, {
      method: "PATCH",
      body: formData,
    });
  }

  const { images, ...jsonPayload } = payload;
  return request<Lot>(config, `/api/lots/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(jsonPayload),
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
