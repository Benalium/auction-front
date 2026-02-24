import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import { api } from "../api/client";
import type { BetResponse, Lot } from "auction-api-client";
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

type TabId = "purchases" | "bids" | "favorites" | "settings";

export function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { favorites, toggle } = useFavorites();
  const [lots, setLots] = useState<Lot[]>([]);
  const [bets, setBets] = useState<BetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("purchases");
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [topUpError, setTopUpError] = useState<string | null>(null);

  useEffect(() => {
    api.lots
      .list()
      .then(setLots)
      .catch(() => setLots([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) {
      setBets([]);
      return;
    }
    setBidsLoading(true);
    api.bets
      .list()
      .then(setBets)
      .catch(() => setBets([]))
      .finally(() => setBidsLoading(false));
  }, [user?.id]);

  const purchases = user
    ? lots.filter((l) => l.winner_id === user.id)
    : [];
  const favoriteLots = lots.filter((l) => favorites.includes(l.id));
  const getLotName = (lotId: number) =>
    lots.find((l) => l.id === lotId)?.name ?? `Лот #${lotId}`;

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount.replace(/\s/g, "").replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      setTopUpError("Введите положительную сумму");
      return;
    }
    setTopUpError(null);
    setTopUpLoading(true);
    try {
      await api.auth.topUpBalance({ amount });
      await refreshUser();
      setTopUpAmount("");
    } catch {
      setTopUpError("Не удалось пополнить баланс");
    } finally {
      setTopUpLoading(false);
    }
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "purchases", label: "Мои покупки" },
    { id: "bids", label: "Активные ставки" },
    { id: "favorites", label: "Избранное" },
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
          <p className={styles.balanceLabel}>
            Баланс: <span className={styles.balanceValue}>{formatPrice(user?.balance ?? 0)}</span>
          </p>
          <form onSubmit={handleTopUp} className={styles.topUpForm}>
            <input
              type="text"
              placeholder="Сумма (₽)"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              className={styles.topUpInput}
              disabled={topUpLoading}
            />
            <button
              type="submit"
              className={styles.topUpBtn}
              disabled={topUpLoading}
            >
              {topUpLoading ? "Пополнение..." : "Пополнить баланс"}
            </button>
            {topUpError && <p className={styles.topUpError}>{topUpError}</p>}
          </form>
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
            {!user ? (
              <p className={styles.empty}>Войдите в аккаунт, чтобы видеть свои ставки</p>
            ) : bidsLoading ? (
              <p className={styles.loading}>Загрузка...</p>
            ) : bets.length === 0 ? (
              <p className={styles.empty}>У вас пока нет активных ставок</p>
            ) : (
              <div className={styles.bidsTable}>
                <div className={styles.bidsHeader}>
                  <span>Лот</span>
                  <span>Ставка</span>
                  <span>Дата</span>
                </div>
                {bets.map((bet) => (
                  <div key={bet.id} className={styles.bidsRow}>
                    <Link to={`/catalog/${bet.lot_id}`} className={styles.bidsLotLink}>
                      {getLotName(bet.lot_id)}
                    </Link>
                    <span className={styles.bidsValue}>
                      {formatPrice(Number(bet.value))}
                    </span>
                    <span className={styles.bidsDate}>
                      {new Date(bet.created_at).toLocaleString("ru-RU")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "favorites" && (
          <section>
            {loading ? (
              <p className={styles.loading}>Загрузка...</p>
            ) : favoriteLots.length === 0 ? (
              <p className={styles.empty}>В избранном пока ничего нет</p>
            ) : (
              <div className={styles.cardGrid}>
                {favoriteLots.map((lot) => (
                  <article key={lot.id} className={styles.card}>
                    <Link to={`/catalog/${lot.id}`} className={styles.cardLink}>
                      <div className={styles.cardImageWrap}>
                        <div className={styles.cardImage}>
                          <img
                            src={lot.images_urls?.[0] ?? "https://placehold.co/300x200/1f2937/9ca3af?text=Лот"}
                            alt={lot.name}
                          />
                          <button
                            type="button"
                            className={styles.cardHeart}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggle(lot.id);
                            }}
                            aria-label="Убрать из избранного"
                          >
                            <Heart size={20} fill="var(--color-primary)" stroke="var(--color-primary)" />
                          </button>
                        </div>
                      </div>
                      <div className={styles.cardBody}>
                        <span className={styles.cardCategory}>Живопись</span>
                        <h3>{lot.name}</h3>
                        <p className={styles.cardMeta}>Автор, год</p>
                        <p className={styles.cardPrice}>{formatPrice(lot.current_price ?? lot.starting_price)}</p>
                        <span className={styles.link}>Подробнее →</span>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "settings" && (
          <section className={styles.settings}>
            <button
              type="button"
              className={styles.quitButton}
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
            >
              Выйти из аккаунта
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
