import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, Share2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { formatApiError } from "../utils/formatApiError";
import { useFavorites } from "../hooks/useFavorites";
import { Countdown } from "../components/Countdown";

import styles from "./Lot.module.css";

function formatPrice(value: number): string {
  return (
    new Intl.NumberFormat("ru-RU", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + " ₽"
  );
}

export function Lot() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();
  const [lot, setLot] = useState<Awaited<ReturnType<typeof api.lots.get>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidValue, setBidValue] = useState("");
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.lots
      .get(Number(id))
      .then(setLot)
      .catch(() => setLot(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lot || !id) return;
    setBidError(null);
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const value = parseFloat(bidValue.replace(/\s/g, ""));
    const min = lot.current_price ?? lot.starting_price;
    if (isNaN(value) || value < min) {
      setBidError(`Минимальная ставка: ${formatPrice(min)}`);
      return;
    }
    try {
      const bet = await api.bets.create({ lot_id: lot.id, value });
      setBidSuccess(true);
      setLot((prev) => {
        if (!prev) return prev;
        const betForLot = {
          id: bet.id,
          value: bet.value,
          user_id: bet.user_id,
          created_at: bet.created_at,
        };
        return {
          ...prev,
          current_price: value,
          bets: [betForLot, ...(prev.bets ?? [])],
        };
      });
      setBidValue("");
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "body" in err
          ? formatApiError((err as { body: unknown }).body)
          : "Не удалось сделать ставку";
      setBidError(msg);
    }
  };

  if (loading) return <p className={styles.loading}>Загрузка...</p>;
  if (!lot) return <p className={styles.error}>Лот не найден</p>;

  const images = lot.images_urls ?? [];
  const mainImage = images[0] ?? "";
  const currentPrice = lot.current_price ?? lot.starting_price;
  const bets = lot.bets ?? [];
  const fav = isFavorite(lot.id);

  return (
    <main className={styles.main}>
      <Link to="/catalog" className={styles.back}>
        ← Вернуться в каталог
      </Link>

      <div className={styles.layout}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img
              src={mainImage}
              alt={lot.name}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x500/1f2937/9ca3af?text=Лот";
              }}
            />
          </div>
          {images.length > 1 && (
            <div className={styles.thumbnails}>
              {images.slice(0, 5).map((url, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.thumb}
                  onClick={() => {
                    const main = document.querySelector(
                      `.${styles.mainImage} img`
                    ) as HTMLImageElement;
                    if (main) main.src = url;
                  }}
                >
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.sidebar}>
          <span className={styles.category}>Живопись</span>
          <h1 className={styles.title}>{lot.name}</h1>
          <p className={styles.meta}>Автор, год (каталог)</p>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={() => toggle(lot.id)}
              aria-label={fav ? "Убрать из избранного" : "В избранное"}
            >
              <Heart
                size={20}
                fill={fav ? "var(--color-primary)" : "none"}
                stroke={fav ? "var(--color-primary)" : "currentColor"}
              />
              {fav ? "В избранном" : "В избранное"}
            </button>
            <button type="button" className={styles.iconBtn} aria-label="Поделиться">
              <Share2 size={20} />
              Поделиться
            </button>
          </div>

          <div className={styles.countdown}>
            <Countdown
              timeLeftSeconds={lot.time_left}
              endTime={lot.end_time}
              compact={false}
            />
          </div>

          <div className={styles.priceBlock}>
            <span className={styles.priceLabel}>Текущая ставка</span>
            <span className={styles.price}>{formatPrice(currentPrice)}</span>
          </div>

          <form onSubmit={handleBid} className={styles.bidForm}>
            <label htmlFor="bid-value">Ваша ставка</label>
            <input
              id="bid-value"
              type="text"
              placeholder={formatPrice(currentPrice)}
              value={bidValue}
              onChange={(e) => setBidValue(e.target.value)}
              className={styles.bidInput}
            />
            <button
              type="submit"
              className={styles.bidBtn}
              disabled={lot.winner_id != null}
            >
              Сделать ставку
            </button>
            {bidError && <p className={styles.bidError}>{bidError}</p>}
            {bidSuccess && (
              <p className={styles.bidSuccess}>Ставка принята!</p>
            )}
          </form>

          <div className={styles.infoBox}>
            Для участия в аукционе необходима регистрация и внесение депозита.
          </div>

          <section className={styles.betsSection}>
            <h2 className={styles.betsTitle}>Ставки по лоту</h2>
            {bets.length === 0 && (
              <p className={styles.betsStatus}>Ставок пока нет</p>
            )}
            {bets.length > 0 && (
              <div className={styles.betsTable}>
                <div className={styles.betsHeader}>
                  <span>Пользователь</span>
                  <span>Ставка</span>
                  <span>Время</span>
                </div>
                <div className={styles.betsBody}>
                  {bets.map((bet) => (
                    <div key={bet.id} className={styles.betsRow}>
                      <span className={styles.betsUser}>
                        ID {bet.user_id}
                        {user && user.id === bet.user_id && " (вы)"}
                      </span>
                      <span className={styles.betsValue}>
                        {formatPrice(bet.value)}
                      </span>
                      <span className={styles.betsTime}>
                        {new Date(bet.created_at).toLocaleString("ru-RU")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
