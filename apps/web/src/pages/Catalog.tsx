import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LayoutGrid, List, Filter, Search, Plus } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import type { Lot } from "auction-api-client";
import { LotCard } from "../components/LotCard";

import styles from "./Catalog.module.css";

const CATEGORIES = ["Все категории", "Живопись", "Скульптура", "Фарфор", "Ювелирные изделия"];
const SEARCH_DEBOUNCE_MS = 400;

export function Catalog() {
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [searchInput, setSearchInput] = useState(initialQ);
  const isWorker = isAuthenticated && user?.role?.code === "worker";
  const [debouncedSearch, setDebouncedSearch] = useState(initialQ);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState("Все категории");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      debounceRef.current = null;
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    api.lots
      .list(debouncedSearch ? { search: debouncedSearch } : undefined)
      .then(setLots)
      .catch(() => setLots([]))
      .finally(() => setLoading(false));
    const next = debouncedSearch ? { q: debouncedSearch } : {};
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, setSearchParams]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Категории</h3>
          <ul className={styles.categories}>
            {CATEGORIES.map((cat) => (
              <li key={cat}>
                <button
                  type="button"
                  className={`${styles.catBtn} ${category === cat ? styles.catBtnActive : ""}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className={styles.content}>
          <div className={styles.toolbar}>
            {isWorker && (
              <Link to="/catalog/add" className={styles.addLotBtn}>
                <Plus size={18} />
                Добавить лот
              </Link>
            )}
            <div className={styles.searchWrap}>
              <Search size={18} className={styles.searchIcon} aria-hidden />
              <input
                type="search"
                placeholder="Поиск по названию..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={styles.searchInput}
                aria-label="Поиск"
              />
            </div>
            <div className={styles.toolbarActions}>
              <button
                type="button"
                className={styles.filterBtn}
                title="Фильтры"
              >
                <Filter size={18} />
                Фильтры
              </button>
              <div className={styles.viewToggle}>
                <button
                  type="button"
                  className={view === "grid" ? styles.viewActive : ""}
                  onClick={() => setView("grid")}
                  aria-label="Сетка"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  type="button"
                  className={view === "list" ? styles.viewActive : ""}
                  onClick={() => setView("list")}
                  aria-label="Список"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <p className={styles.loading}>Загрузка...</p>
          ) : lots.length === 0 ? (
            <p className={styles.empty}>Лотов не найдено</p>
          ) : (
            <div
              className={
                view === "grid"
                  ? styles.grid
                  : styles.list
              }
            >
              {lots.map((lot) => (
                <LotCard key={lot.id} lot={lot} view={view} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
