import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Lot } from "auction-api-client";
import { useFavorites } from "../hooks/useFavorites";
import { LotCard } from "../components/LotCard";

import styles from "./Favorites.module.css";

export function Favorites() {
  const { favorites } = useFavorites();
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.lots
      .list()
      .then((all) => setLots(all.filter((l) => favorites.includes(l.id))))
      .catch(() => setLots([]))
      .finally(() => setLoading(false));
  }, [favorites]);

  return (
    <main className={styles.main}>
      <Link to="/profile" className={styles.back}>
        ← Вернуться в профиль
      </Link>

      <h1 className={styles.title}>Избранное</h1>
      <p className={styles.subtitle}>
        {favorites.length} лотов в вашем списке желаний
      </p>

      {loading ? (
        <p className={styles.loading}>Загрузка...</p>
      ) : lots.length === 0 ? (
        <p className={styles.empty}>
          В избранном пока ничего нет. Добавьте лоты из каталога.
        </p>
      ) : (
        <div className={styles.grid}>
          {lots.map((lot) => (
            <LotCard key={lot.id} lot={lot} />
          ))}
        </div>
      )}
    </main>
  );
}
