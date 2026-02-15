import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "../api/client";

import styles from "./AddLot.module.css";

interface AddLotForm {
  name: string;
  author: string;
  year: string;
  category: string;
  description: string;
  startingPrice: string;
  endTime: string;
  imagesUrls: string;
}

const CATEGORIES = ["Живопись", "Скульптура", "Фарфор", "Ювелирные изделия", "Другое"];

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
    const imagesUrls = data.imagesUrls
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const extra = [data.author, data.year, data.category, data.description]
      .filter(Boolean)
      .join(". ");
    const name = extra ? `${data.name}. ${extra}` : data.name;
    const endTime = new Date(data.endTime).toISOString();

    try {
      await api.lots.create({
        name,
        starting_price: parseFloat(data.startingPrice.replace(/\s/g, "").replace(",", ".")),
        end_time: endTime,
        images_urls: imagesUrls.length > 0 ? imagesUrls : ["https://placehold.co/400x300/1f2937/9ca3af?text=Лот"],
      });
      navigate("/catalog");
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "body" in e
          ? String((e as { body: unknown }).body)
          : "Ошибка при добавлении лота";
      setError(msg);
    }
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Добавить лот</h1>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Основная информация</h2>
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
          <div className={styles.row2}>
            <div className={styles.field}>
              <label htmlFor="author">Автор *</label>
              <input id="author" type="text" {...register("author", { required: "Введите автора" })} />
              {errors.author && (
                <span className={styles.fieldError}>{errors.author.message}</span>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="year">Год *</label>
              <input
                id="year"
                type="text"
                placeholder="например 1890"
                {...register("year", { required: "Введите год" })}
              />
              {errors.year && (
                <span className={styles.fieldError}>{errors.year.message}</span>
              )}
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor="category">Категория *</label>
            <select id="category" {...register("category", { required: "Выберите категорию" })}>
              <option value="">Выберите</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <span className={styles.fieldError}>{errors.category.message}</span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="description">Описание *</label>
            <textarea
              id="description"
              rows={4}
              {...register("description", { required: "Введите описание" })}
            />
            {errors.description && (
              <span className={styles.fieldError}>{errors.description.message}</span>
            )}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Ценообразование</h2>
          <div className={styles.field}>
            <label htmlFor="startingPrice">Начальная цена (₽) *</label>
            <input
              id="startingPrice"
              type="text"
              placeholder="100 000"
              {...register("startingPrice", { required: "Введите начальную цену" })}
            />
            {errors.startingPrice && (
              <span className={styles.fieldError}>{errors.startingPrice.message}</span>
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
            <label htmlFor="imagesUrls">URL изображений (каждый с новой строки)</label>
            <textarea
              id="imagesUrls"
              rows={3}
              placeholder="https://example.com/image1.jpg"
              {...register("imagesUrls")}
            />
          </div>
        </section>

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
