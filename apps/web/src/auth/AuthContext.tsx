import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, tokenStore } from "../api/client";

interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  role?: { code: string } | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUserFromTokens: (username: string, email: string, id: number) => void;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "auction_user";

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.username != null) {
      return {
        id: typeof data.id === "number" ? data.id : 0,
        username: String(data.username),
        email: data?.email != null ? String(data.email) : "",
        balance: typeof data.balance === "number" ? data.balance : 0,
        role: data?.role ?? null,
      };
    }
  } catch {
    // ignore
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasToken = !!tokenStore.getAccessToken();
    if (!hasToken) {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const setUserState = useCallback((u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  }, []);

  const setUserFromTokens = useCallback(
    (username: string, email: string, id: number) => {
      setUserState({ id, username, email, balance: 0, role: null });
    },
    [setUserState]
  );

  const refreshUser = useCallback(async () => {
    if (!tokenStore.getAccessToken()) return;
    try {
      const me = await api.auth.getMe();
      const u: User = {
        id: me.id,
        username: me.username,
        email: me.email,
        balance: Number(me.balance),
        role: me.role ?? null,
      };
      setUserState(u);
    } catch {
      // ignore
    }
  }, [setUserState]);

  const login = useCallback(
    async (username: string, password: string) => {
      const res = await api.auth.login(username, password);
      tokenStore.setTokens(res.access, res.refresh);
      setUserFromTokens(username, "", 0);
      await refreshUser();
    },
    [setUserFromTokens, refreshUser]
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  useEffect(() => {
    if (tokenStore.getAccessToken()) {
      refreshUser();
    }
  }, [refreshUser]);

  const hasToken = !!tokenStore.getAccessToken();
  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: hasToken,
    login,
    logout,
    setUserFromTokens,
    setUser: setUserState,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
