import { useState } from "react";
import { useForm } from "react-hook-form";
import { api, tokenStore } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Modal } from "../components/Modal";

import styles from "./AuthModals.module.css";

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
}

export function RegisterModal({
  isOpen,
  onClose,
  onOpenLogin,
}: RegisterModalProps) {
  const { setUserFromTokens } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterForm>();

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      const username = `${data.firstName} ${data.lastName}`.trim();
      const res = await api.auth.register({
        username,
        email: data.email,
        password: data.password,
        phone_number: data.phone || undefined,
      });
      const tokens = await api.auth.login(username, data.password);
      tokenStore.setTokens(tokens.access, tokens.refresh);
      setUserFromTokens(res.username, res.email, res.id);
      reset();
      onClose();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "body" in e
          ? String((e as { body: unknown }).body)
          : "Ошибка регистрации. Попробуйте снова.";
      setError(msg);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Регистрация">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.row2}>
          <div className={styles.field}>
            <label htmlFor="reg-firstName">Имя</label>
            <input
              id="reg-firstName"
              type="text"
              autoComplete="given-name"
              {...register("firstName", { required: "Введите имя" })}
            />
            {errors.firstName && (
              <span className={styles.fieldError}>{errors.firstName.message}</span>
            )}
          </div>
          <div className={styles.field}>
            <label htmlFor="reg-lastName">Фамилия</label>
            <input
              id="reg-lastName"
              type="text"
              autoComplete="family-name"
              {...register("lastName", { required: "Введите фамилию" })}
            />
            {errors.lastName && (
              <span className={styles.fieldError}>{errors.lastName.message}</span>
            )}
          </div>
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
            <span className={styles.fieldError}>{errors.password.message}</span>
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
              validate: (v) =>
                v === password || "Пароли не совпадают",
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
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleClose}
          >
            Отмена
          </button>
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
          <button
            type="button"
            className={styles.linkBtn}
            onClick={onOpenLogin}
          >
            Войти
          </button>
        </p>
      </form>
    </Modal>
  );
}
