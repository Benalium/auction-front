import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const FAVORITES_KEY = "auction_favorites";

function loadLocalFavorites(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalFavorites(ids: number[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

interface FavoritesContextValue {
  favorites: number[];
  toggle: (lotId: number) => void;
  isFavorite: (lotId: number) => boolean;
  add: (lotId: number) => void;
  remove: (lotId: number) => void;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<number[]>(loadLocalFavorites);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      api.favorites
        .list()
        .then(setFavorites)
        .catch(() => setFavorites([]))
        .finally(() => setIsLoading(false));
    } else {
      setFavorites(loadLocalFavorites());
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      saveLocalFavorites(favorites);
    }
  }, [isAuthenticated, favorites]);

  const toggle = useCallback(
    async (lotId: number) => {
      if (isAuthenticated) {
        const isFav = favorites.includes(lotId);
        if (isFav) {
          try {
            await api.favorites.remove(lotId);
            setFavorites((prev) => prev.filter((id) => id !== lotId));
          } catch {
            // keep state on error
          }
        } else {
          try {
            await api.favorites.add(lotId);
            setFavorites((prev) => (prev.includes(lotId) ? prev : [...prev, lotId]));
          } catch {
            // keep state on error
          }
        }
      } else {
        setFavorites((prev) =>
          prev.includes(lotId) ? prev.filter((id) => id !== lotId) : [...prev, lotId]
        );
      }
    },
    [isAuthenticated, favorites]
  );

  const add = useCallback(
    async (lotId: number) => {
      if (isAuthenticated) {
        try {
          await api.favorites.add(lotId);
          setFavorites((prev) => (prev.includes(lotId) ? prev : [...prev, lotId]));
        } catch {
          // keep state on error
        }
      } else {
        setFavorites((prev) => (prev.includes(lotId) ? prev : [...prev, lotId]));
      }
    },
    [isAuthenticated]
  );

  const remove = useCallback(
    async (lotId: number) => {
      if (isAuthenticated) {
        try {
          await api.favorites.remove(lotId);
          setFavorites((prev) => prev.filter((id) => id !== lotId));
        } catch {
          // keep state on error
        }
      } else {
        setFavorites((prev) => prev.filter((id) => id !== lotId));
      }
    },
    [isAuthenticated]
  );

  const isFavorite = useCallback(
    (lotId: number) => favorites.includes(lotId),
    [favorites]
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggle, isFavorite, add, remove, isLoading }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}
