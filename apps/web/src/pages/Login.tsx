import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../auth/AuthContext";
import { formatApiError } from "../utils/formatApiError";

import styles from "./AuthModals.module.css";

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      await login(data.username, data.password);
      navigate("/");
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "body" in e
          ? formatApiError((e as { body: unknown }).body)
          : "Ошибка входа. Проверьте логин и пароль.";
      setError(msg);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Вход</h1>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.field}>
            <label htmlFor="login-username">Имя</label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              {...register("username", {
                required: "Введите email или имя пользователя",
              })}
            />
            {errors.username && (
              <span className={styles.fieldError}>{errors.username.message}</span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="login-password">Пароль</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              {...register("password", { required: "Введите пароль" })}
            />
            {errors.password && (
              <span className={styles.fieldError}>{errors.password.message}</span>
            )}
          </div>
          <div className={styles.row}>
            <label className={styles.checkbox}>
              <input type="checkbox" {...register("remember")} />
              <span>Запомнить меня</span>
            </label>
            <button type="button" className={styles.linkBtn}>
              Забыли пароль?
            </button>
          </div>
          <div className={`${styles.actions} ${styles.actionsCentered}`}>
            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Вход..." : "Войти"}
            </button>
          </div>
          <p className={styles.footer}>
            Нет аккаунта?{" "}
            <Link to="/register" className={styles.linkBtn}>
              Зарегистрироваться
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
