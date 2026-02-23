// Auth

/** Request body for POST /api/auth/register/ */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone_number?: string;
  passport_number?: string;
  role_id?: number;
}

/** Response from POST /api/auth/register/ */
export interface RegisterResponse {
  id: number;
  username: string;
  name?: string;
  email: string;
  message?: string;
}

/** Response from POST /api/token/ (login) and POST /api/token/refresh/ */
export interface TokenResponse {
  access: string;
  refresh: string;
}

// Lots

/** Response from GET /api/lots/ (list item) and GET /api/lots/:id/; also response from POST /api/lots/ */
export interface Lot {
  id: number;
  name: string;
  starting_price: number;
  current_price: number;
  end_time: string;
  time_left?: number;
  images_urls: string[];
  winner_id?: number | null;
  seller_id?: number | null;
}

/** Request body for POST /api/lots/ */
export interface CreateLotPayload {
  name: string;
  starting_price: number;
  end_time: string;
  images_urls: string[];
}

// Bets

/** Request body for POST /api/bets/ */
export interface CreateBetPayload {
  lot_id: number;
  value: number;
}

/** Response from POST /api/bets/ */
export interface BetResponse {
  id: number;
  value: number;
  user_id: number;
  lot_id: number;
  created_at: string;
}
