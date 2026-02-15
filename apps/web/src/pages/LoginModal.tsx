import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../auth/AuthContext";
import { Modal } from "../components/Modal";

import styles from "./AuthModals.module.css";

interface LoginForm {
  username: string;
  password: string;
  remember: boolean;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
}

export function LoginModal({
  isOpen,
  onClose,
  onOpenRegister,
}: LoginModalProps) {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      await login(data.username, data.password);
      reset();
      onClose();
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "body" in e
          ? String((e as { body: unknown }).body)
          : "Ошибка входа. Проверьте логин и пароль.";
      setError(msg);
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Вход">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.field}>
          <label htmlFor="login-username">Email или имя пользователя</label>
          <input
            id="login-username"
            type="text"
            autoComplete="username"
            {...register("username", { required: "Введите email или имя пользователя" })}
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
            {isSubmitting ? "Вход..." : "Войти"}
          </button>
        </div>
        <p className={styles.footer}>
          Нет аккаунта?{" "}
          <button
            type="button"
            className={styles.linkBtn}
            onClick={onOpenRegister}
          >
            Зарегистрироваться
          </button>
        </p>
      </form>
    </Modal>
  );
}
