import {
  type ClientConfig,
  type TokenStore,
  type RegisterPayload,
  type RegisterResponse,
  type TokenResponse,
  type MeResponse,
  type TopUpBalancePayload,
  type Lot,
  type CreateLotPayload,
  type UpdateLotPayload,
  type BetResponse,
  type CreateBetPayload,
  register as authRegister,
  login as authLogin,
  refreshToken as authRefreshToken,
  getMe as authGetMe,
  topUpBalance as authTopUpBalance,
  listLots,
  getLot,
  createLot,
  updateLot,
  finishLot,
  deleteLot,
  listBets,
  createBet,
  listFavorites,
  addFavorite,
  removeFavorite,
} from "auction-api-client";

const TOKEN_KEY = "auction_tokens";

const tokenStore: TokenStore = {
  getAccessToken: () => {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data.access ?? null;
    } catch {
      return null;
    }
  },
  getRefreshToken: () => {
    try {
      const raw = localStorage.getItem(TOKEN_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data.refresh ?? null;
    } catch {
      return null;
    }
  },
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(TOKEN_KEY, JSON.stringify({ access, refresh }));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
  },
};

const baseUrl = import.meta.env.VITE_API_URL ?? "";

export const apiConfig: ClientConfig = {
  baseUrl: baseUrl.replace(/\/$/, ""),
  tokenStore,
};

export const api = {
  auth: {
    register: (payload: RegisterPayload) =>
      authRegister(apiConfig, payload) as Promise<RegisterResponse>,
    login: (username: string, password: string) =>
      authLogin(apiConfig, username, password) as Promise<TokenResponse>,
    refreshToken: (refresh: string) =>
      authRefreshToken(apiConfig, refresh) as Promise<TokenResponse>,
    getMe: () => authGetMe(apiConfig) as Promise<MeResponse>,
    topUpBalance: (payload: TopUpBalancePayload) =>
      authTopUpBalance(apiConfig, payload) as Promise<MeResponse>,
  },
  lots: {
    list: (params?: { search?: string }) =>
      listLots(apiConfig, params) as Promise<Lot[]>,
    get: (id: number) => getLot(apiConfig, id) as Promise<Lot>,
    create: (payload: CreateLotPayload) =>
      createLot(apiConfig, payload) as Promise<Lot>,
    update: (id: number, payload: UpdateLotPayload) =>
      updateLot(apiConfig, id, payload) as Promise<Lot>,
    finish: (id: number) => finishLot(apiConfig, id) as Promise<Lot>,
    delete: (id: number) => deleteLot(apiConfig, id),
  },
  bets: {
    list: () => listBets(apiConfig) as Promise<BetResponse[]>,
    create: (payload: CreateBetPayload) =>
      createBet(apiConfig, payload) as Promise<BetResponse>,
  },
  favorites: {
    list: () => listFavorites(apiConfig) as Promise<number[]>,
    add: (lotId: number) => addFavorite(apiConfig, lotId),
    remove: (lotId: number) => removeFavorite(apiConfig, lotId),
  },
};

export { tokenStore };
