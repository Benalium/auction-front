import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Lot } from "auction-api-client";
import { useAuth } from "../auth/AuthContext";
import { useFavorites } from "../hooks/useFavorites";

import styles from "./Profile.module.css";

function formatPrice(value: number): string {
  return (
    new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + " ₽"
  );
}

type TabId = "purchases" | "bids" | "settings";

export function Profile() {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("purchases");

  useEffect(() => {
    api.lots
      .list()
      .then(setLots)
      .catch(() => setLots([]))
      .finally(() => setLoading(false));
  }, []);

  const purchases = user
    ? lots.filter((l) => l.winner_id === user.id)
    : [];

  const tabs: { id: TabId; label: string }[] = [
    { id: "purchases", label: "Мои покупки" },
    { id: "bids", label: "Активные ставки" },
    { id: "settings", label: "Настройки" },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.banner}>
        <div className={styles.avatar} />
        <div className={styles.bannerInfo}>
          <h1 className={styles.name}>{user?.username ?? "Александр Петров"}</h1>
          <p className={styles.email}>{user?.email ?? "user@example.com"}</p>
          <p className={styles.meta}>Участник с 2023</p>
          <p className={styles.meta}>{purchases.length} покупок</p>
          <Link to="/favorites" className={styles.favoritesLink}>
            Избранное ({favorites.length})
          </Link>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === "purchases" && (
          <section>
            {loading ? (
              <p className={styles.loading}>Загрузка...</p>
            ) : purchases.length === 0 ? (
              <p className={styles.empty}>У вас пока нет покупок</p>
            ) : (
              <div className={styles.cardGrid}>
                {purchases.map((lot) => (
                  <article key={lot.id} className={styles.card}>
                    <Link to={`/catalog/${lot.id}`} className={styles.cardLink}>
                      <div className={styles.cardImage}>
                        <img
                          src={lot.images_urls?.[0] ?? "https://placehold.co/300x200/1f2937/9ca3af?text=Лот"}
                          alt={lot.name}
                        />
                      </div>
                      <div className={styles.cardBody}>
                        <span className={styles.cardCategory}>Живопись</span>
                        <h3>{lot.name}</h3>
                        <p className={styles.cardMeta}>Автор, год</p>
                        <p className={styles.cardPrice}>{formatPrice(lot.current_price ?? lot.starting_price)}</p>
                        <span className={styles.status}>Доставлен</span>
                        <span className={styles.link}>Подробнее →</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "bids" && (
          <section>
            <p className={styles.stub}>Скоро</p>
          </section>
        )}

        {activeTab === "settings" && (
          <section>
            <p className={styles.stub}>Настройки профиля — в разработке</p>
          </section>
        )}
      </div>
    </main>
  );
}
