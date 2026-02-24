import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "../api/client";
import { formatApiError } from "../utils/formatApiError";

import styles from "./AddLot.module.css";

interface EditLotForm {
  name: string;
  startingPrice: string;
  endTime: string;
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function EditLot() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditLotForm>();

  useEffect(() => {
    if (!id) return;
    api.lots
      .get(Number(id))
      .then((lot) => {
        reset({
          name: lot.name,
          startingPrice: String(lot.starting_price),
          endTime: toDatetimeLocal(lot.end_time),
        });
      })
      .catch(() => navigate("/catalog", { replace: true }))
      .finally(() => setLoading(false));
  }, [id, reset, navigate]);

  const onSubmit = async (data: EditLotForm) => {
    if (!id) return;
    setError(null);
    const endTime = new Date(data.endTime).toISOString();
    try {
      await api.lots.update(Number(id), {
        name: data.name.trim(),
        starting_price: parseFloat(
          data.startingPrice.replace(/\s/g, "").replace(",", ".")
        ),
        end_time: endTime,
      });
      navigate(`/catalog/${id}`);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "body" in e
          ? formatApiError((e as { body: unknown }).body)
          : "Ошибка при сохранении";
      setError(msg);
    }
  };

  if (loading) return <p className={styles.title}>Загрузка...</p>;

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Изменить лот</h1>

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
            {isSubmitting ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </main>
  );
}
