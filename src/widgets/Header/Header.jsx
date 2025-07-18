import { useState } from 'react';
import { Button } from '../../shared/ui';
import styles from './Header.module.css';

export const Header = ({ title, sidebarCollapsed, onToggleSidebar }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button 
          className={styles.mobileMenuButton}
          onClick={onToggleSidebar}
          aria-label="Open menu"
        >
          ☰
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      
      <div className={styles.right}>
        <div className={styles.search}>
          <input 
            type="text" 
            placeholder="Search..."
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>
            🔍
          </button>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={toggleTheme}
            title={isDarkMode ? 'Light theme' : 'Dark theme'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          <button className={styles.actionButton} title="Notifications">
            🔔
            <span className={styles.badge}>3</span>
          </button>
          
          <div className={styles.userMenu}>
            <button className={styles.userButton}>
              <div className={styles.userAvatar}>👤</div>
              <span className={styles.userName}>Admin</span>
              <span className={styles.dropdownIcon}>▼</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
