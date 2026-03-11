import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "../api/client";
import { formatApiError } from "../utils/formatApiError";

import styles from "./AddLot.module.css";

interface AddLotForm {
  name: string;
  startingPrice: string;
  endTime: string;
  imageUrls: string;
}

export function AddLot() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddLotForm>();

  const onSubmit = async (data: AddLotForm) => {
    setError(null);
    const endTime = new Date(data.endTime).toISOString();
    const images_urls = (data.imageUrls ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      await api.lots.create({
        name: data.name.trim(),
        starting_price: parseFloat(
          data.startingPrice.replace(/\s/g, "").replace(",", ".")
        ),
        end_time: endTime,
        images_urls,
      });
      navigate("/catalog");
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "body" in e
          ? formatApiError((e as { body: unknown }).body)
          : "Ошибка при добавлении лота";
      setError(msg);
    }
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Добавить лот</h1>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label htmlFor="name">Название *</label>
          <input
            id="name"
            type="text"
            {...register("name", { required: "Введите название" })}
          />
          {errors.name && (
            <span className={styles.fieldError}>{errors.name.message}</span>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="startingPrice">Начальная цена (₽) *</label>
          <input
            id="startingPrice"
            type="text"
            placeholder="100 000"
            {...register("startingPrice", { required: "Введите начальную цену" })}
          />
          {errors.startingPrice && (
            <span className={styles.fieldError}>
              {errors.startingPrice.message}
            </span>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="endTime">Дата и время окончания *</label>
          <input
            id="endTime"
            type="datetime-local"
            {...register("endTime", { required: "Укажите дату окончания" })}
          />
          {errors.endTime && (
            <span className={styles.fieldError}>{errors.endTime.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="imageUrls">Ссылки на фото (по одной на строку)</label>
          <textarea
            id="imageUrls"
            rows={3}
            placeholder="https://example.com/photo1.jpg"
            {...register("imageUrls")}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => navigate(-1)}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Добавление..." : "Добавить лот"}
          </button>
        </div>
      </form>
    </main>
  );
}
