import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api, tokenStore } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { formatApiError } from "../utils/formatApiError";

import styles from "./AuthModals.module.css";

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

export function Register() {
  const { setUserFromTokens } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      const name = data.name.trim();
      const res = await api.auth.register({
        name,
        email: data.email,
        password: data.password,
        phone_number: data.phone || undefined,
      });
      const tokens = await api.auth.login(name, data.password);
      tokenStore.setTokens(tokens.access, tokens.refresh);
      setUserFromTokens(res.name ?? res.username, res.email, res.id);
      navigate("/");
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "body" in e
          ? formatApiError((e as { body: unknown }).body)
          : "Ошибка регистрации. Попробуйте снова.";
      setError(msg);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Регистрация</h1>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label htmlFor="reg-name">Имя</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              {...register("name", { required: "Введите имя" })}
            />
            {errors.name && (
              <span className={styles.fieldError}>
                {errors.name.message}
              </span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              {...register("email", {
                required: "Введите email",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Некорректный email",
                },
              })}
            />
            {errors.email && (
              <span className={styles.fieldError}>{errors.email.message}</span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="reg-phone">Телефон</label>
            <input
              id="reg-phone"
              type="tel"
              autoComplete="tel"
              {...register("phone")}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="reg-password">Пароль</label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              {...register("password", {
                required: "Введите пароль",
                minLength: {
                  value: 8,
                  message: "Минимум 8 символов",
                },
              })}
            />
            {errors.password && (
              <span className={styles.fieldError}>
                {errors.password.message}
              </span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="reg-confirm">Подтвердите пароль</label>
            <input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword", {
                required: "Подтвердите пароль",
                validate: (v) => v === password || "Пароли не совпадают",
              })}
            />
            {errors.confirmPassword && (
              <span className={styles.fieldError}>
                {errors.confirmPassword.message}
              </span>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                {...register("terms", {
                  required: "Необходимо согласие с условиями",
                })}
              />
              <span>Я согласен с условиями использования</span>
            </label>
            {errors.terms && (
              <span className={styles.fieldError}>{errors.terms.message}</span>
            )}
          </div>
          <div className={styles.actions}>
            <Link to="/" className={styles.secondaryBtn}>
              Назад
            </Link>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </div>
          <p className={styles.footer}>
            Уже есть аккаунт?{" "}
            <Link to="/login" className={styles.linkBtn}>
              Войти
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
