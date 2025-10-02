import React, { useEffect, useState } from "react";

import styles from "./PasswordProtection.module.css";

const PasswordProtection = ({ children }) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем сохраненную аутентификацию при загрузке
  useEffect(() => {
    const savedAuth = localStorage.getItem("sitePasswordAuth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Здесь задайте ваш пароль
    const correctPassword = "meract2025"; // Измените на ваш пароль

    if (password === correctPassword) {
      setIsAuthenticated(true);
      setError("");
      // Сохраняем аутентификацию в localStorage
      localStorage.setItem("sitePasswordAuth", "true");
    } else {
      setError("Неверный пароль");
      setPassword("");
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>MERACT</h1>
            <p className={styles.subtitle}>
              Введите пароль для доступа к сайту
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                className={styles.input}
                autoFocus
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.button}>
              Войти
            </button>
          </form>

          <div className={styles.footer}>
            <p>Для доступа к сайту требуется пароль</p>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default PasswordProtection;
