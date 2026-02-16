import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, User, Menu, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";

import styles from "./Header.module.css";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

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
            <Link to="/favorites">Избранное</Link>
            <Link to="/about">О нас</Link>
            <Link to="/contacts">Контакты</Link>
            {isAuthenticated && (
              <Link to="/catalog/add">Добавить лот</Link>
            )}
          </nav>

          <form className={styles.search} onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Поиск"
            />
            <button type="submit" className={styles.searchBtn} aria-label="Искать">
              <Search size={18} />
            </button>
          </form>

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
              <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>
                Избранное
              </Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
                О нас
              </Link>
              <Link to="/contacts" onClick={() => setMobileMenuOpen(false)}>
                Контакты
              </Link>
              {isAuthenticated && (
                <Link to="/catalog/add" onClick={() => setMobileMenuOpen(false)}>
                  Добавить лот
                </Link>
              )}
            </nav>
            <form className={styles.mobileSearch} onSubmit={handleSearch}>
              <input
                type="search"
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchBtn}>
                <Search size={18} />
              </button>
            </form>
            <div className={styles.mobileActions}>
              {isAuthenticated ? (
                <>
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
