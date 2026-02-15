// Auth
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  phone_number?: string;
  passport_number?: string;
  role_id?: number;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  message?: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

// Lots
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

export interface CreateLotPayload {
  name: string;
  starting_price: number;
  end_time: string;
  images_urls: string[];
}

// Bets
export interface CreateBetPayload {
  lot_id: number;
  value: number;
}

export interface BetResponse {
  id: number;
  value: number;
  user_id: number;
  lot_id: number;
  created_at: string;
}
