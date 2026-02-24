import { Link, useNavigate } from "react-router-dom";
import { Bell, User, Menu, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";

import styles from "./Header.module.css";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate("/profile");
      setMobileMenuOpen(false);
    } else {
      navigate("/login");
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            Prestige Auction House
          </Link>

          <nav className={styles.nav}>
            <Link to="/catalog">Каталог</Link>
            <Link to="/about">О нас</Link>
            <Link to="/contacts">Контакты</Link>
          </nav>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="Уведомления"
              title="Уведомления"
            >
              <Bell size={20} />
              <span className={styles.badge}>2</span>
            </button>
            <button
              type="button"
              className={styles.themeBtn}
              onClick={toggleTheme}
              aria-label={theme === "light" ? "Тёмная тема" : "Светлая тема"}
              title={theme === "light" ? "Тёмная тема" : "Светлая тема"}
            >
              {theme === "light" ? (
                <Moon size={20} />
              ) : (
                <Sun size={20} />
              )}
            </button>
            {isAuthenticated && user && (
              <span className={styles.balance}>
                {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(user.balance ?? 0)} ₽
              </span>
            )}
            <button
              type="button"
              className={styles.profileBtn}
              onClick={handleProfileClick}
              aria-label="Профиль"
            >
              <User size={20} />
              {isAuthenticated && user && (
                <span className={styles.userName}>{user.username}</span>
              )}
            </button>
          </div>

          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Меню"
          >
            <Menu size={24} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <nav className={styles.mobileNav}>
              <Link to="/catalog" onClick={() => setMobileMenuOpen(false)}>
                Каталог
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
                О нас
              </Link>
              <Link to="/contacts" onClick={() => setMobileMenuOpen(false)}>
                Контакты
              </Link>
            </nav>
            <div className={styles.mobileActions}>
              {isAuthenticated ? (
                <>
                  {user && (
                    <p className={styles.mobileBalance}>
                      Баланс: {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(user.balance ?? 0)} ₽
                    </p>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={styles.mobileLink}
                  >
                    Профиль
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className={styles.logoutBtn}
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.mobileLink}
                >
                  Войти
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
