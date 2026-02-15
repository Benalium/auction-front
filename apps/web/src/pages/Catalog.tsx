import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { LayoutGrid, List, Filter } from "lucide-react";
import { api } from "../api/client";
import type { Lot } from "auction-api-client";
import { LotCard } from "../components/LotCard";

import styles from "./Catalog.module.css";

const CATEGORIES = ["Все категории", "Живопись", "Скульптура", "Фарфор", "Ювелирные изделия"];

export function Catalog() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState("Все категории");

  useEffect(() => {
    api.lots
      .list()
      .then(setLots)
      .catch(() => setLots([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = lots;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (lot) =>
          lot.name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [lots, query]);

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
            <div className={styles.searchInfo}>
              Найдено лотов: {filtered.length}
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
          ) : filtered.length === 0 ? (
            <p className={styles.empty}>Лотов не найдено</p>
          ) : (
            <div
              className={
                view === "grid"
                  ? styles.grid
                  : styles.list
              }
            >
              {filtered.map((lot) => (
                <LotCard key={lot.id} lot={lot} view={view} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
