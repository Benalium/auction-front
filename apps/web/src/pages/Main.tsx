import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Lot } from "auction-api-client";
import { LotCard } from "../components/LotCard";

import styles from "./Main.module.css";

export function Main() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.lots
      .list()
      .then(setLots)
      .catch(() => setLots([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = lots.slice(0, 6);

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Prestige Auction House
        </h1>
        <p className={styles.heroSub}>
          Аукционный дом премиум-класса. Уникальные лоты искусства и коллекционных предметов.
        </p>
        <div className={styles.heroActions}>
          <Link to="/catalog" className={styles.primaryCta}>
            Смотреть лоты
          </Link>
          <Link to="/register" className={styles.secondaryCta}>
            Зарегистрироваться
          </Link>
        </div>
      </section>

      <section className={styles.section}>
        {loading ? (
          <p className={styles.loading}>Загрузка...</p>
        ) : featured.length === 0 ? (
          <p className={styles.empty}>Лотов пока нет</p>
        ) : (
          <div className={styles.grid}>
            {featured.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))}
          </div>
        )}
        {!loading && lots.length > 0 && (
          <div className={styles.more}>
            <Link to="/catalog" className={styles.moreLink}>
              Смотреть весь каталог
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
