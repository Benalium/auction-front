import type { ClientConfig } from "./client";
import { request } from "./client";

/**
 * GET /api/favorites/ — list favorite lot IDs (requires auth).
 */
export function listFavorites(config: ClientConfig): Promise<number[]> {
  return request<number[]>(config, "/api/favorites/");
}

/**
 * POST /api/favorites/ — add lot to favorites (body: { lot_id }). Requires auth.
 */
export function addFavorite(
  config: ClientConfig,
  lotId: number
): Promise<{ lot_id: number; added: boolean }> {
  return request<{ lot_id: number; added: boolean }>(config, "/api/favorites/", {
    method: "POST",
    body: JSON.stringify({ lot_id: lotId }),
  });
}

/**
 * DELETE /api/favorites/:id/ — remove lot from favorites. Requires auth.
 */
export function removeFavorite(
  config: ClientConfig,
  lotId: number
): Promise<void> {
  return request<void>(config, `/api/favorites/${lotId}/`, {
    method: "DELETE",
  });
}
