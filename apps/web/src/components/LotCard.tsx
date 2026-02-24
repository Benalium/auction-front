import { Link, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import type { Lot } from "auction-api-client";
import { useAuth } from "../auth/AuthContext";
import { useFavorites } from "../hooks/useFavorites";
import { Countdown } from "./Countdown";

import styles from "./LotCard.module.css";

interface LotCardProps {
  lot: Lot;
  view?: "grid" | "list";
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + " ₽";
}

export function LotCard({ lot, view = "grid" }: LotCardProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();
  const fav = isFavorite(lot.id);
  const imgUrl = lot.images_urls?.[0] ?? "/placeholder-lot.jpg";

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    toggle(lot.id);
  };

  const content = (
    <>
      <div className={styles.imageWrap}>
        <img
          src={imgUrl}
          alt={lot.name}
          className={styles.image}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/400x300/1f2937/9ca3af?text=Лот";
          }}
        />
        <span className={styles.category}>Живопись</span>
        <button
          type="button"
          className={styles.heart}
          onClick={handleHeartClick}
          aria-label={fav ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <Heart
            size={20}
            fill={fav ? "var(--color-primary)" : "none"}
            stroke={fav ? "var(--color-primary)" : "currentColor"}
          />
        </button>
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{lot.name}</h3>
        <p className={styles.meta}>Автор, год (каталог)</p>
        <p className={styles.price}>{formatPrice(lot.current_price ?? lot.starting_price)}</p>
        <Countdown
          timeLeftSeconds={lot.time_left ?? 0}
          endTime={lot.end_time}
          compact
        />
        <span className={styles.link}>Подробнее →</span>
      </div>
    </>
  );

  if (view === "list") {
    return (
      <article className={styles.cardList}>
        <Link to={`/catalog/${lot.id}`} className={styles.linkList}>
          {content}
        </Link>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <Link to={`/catalog/${lot.id}`} className={styles.link}>
        {content}
      </Link>
    </article>
  );
}
