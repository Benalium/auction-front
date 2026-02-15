import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const FAVORITES_KEY = "auction_favorites";

function loadFavorites(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: number[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

interface FavoritesContextValue {
  favorites: number[];
  toggle: (lotId: number) => void;
  isFavorite: (lotId: number) => boolean;
  add: (lotId: number) => void;
  remove: (lotId: number) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<number[]>(loadFavorites);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  const toggle = useCallback((lotId: number) => {
    setFavorites((prev) =>
      prev.includes(lotId) ? prev.filter((id) => id !== lotId) : [...prev, lotId]
    );
  }, []);

  const isFavorite = useCallback(
    (lotId: number) => favorites.includes(lotId),
    [favorites]
  );

  const add = useCallback((lotId: number) => {
    setFavorites((prev) => (prev.includes(lotId) ? prev : [...prev, lotId]));
  }, []);

  const remove = useCallback((lotId: number) => {
    setFavorites((prev) => prev.filter((id) => id !== lotId));
  }, []);

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggle, isFavorite, add, remove }}
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
