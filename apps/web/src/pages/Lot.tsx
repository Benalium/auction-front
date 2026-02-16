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
  const { isAuthenticated } = useAuth();
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
      await api.bets.create({ lot_id: lot.id, value });
      setBidSuccess(true);
      setLot((prev) =>
        prev ? { ...prev, current_price: value } : prev
      );
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

          <p className={styles.estimate}>Эстимейт: —</p>

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
        </div>
      </div>
    </main>
  );
}
