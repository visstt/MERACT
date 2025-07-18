import { useState } from 'react';
import { Button } from '../../shared/ui';
import styles from './Header.module.css';

export const Header = ({ title, sidebarCollapsed, onToggleSidebar, isSidebarOpen, user }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
  };

  const userName = user?.login || user?.email || 'Admin';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div
          className={styles.burger + (isSidebarOpen ? ' ' + styles.open : '')}
          onClick={onToggleSidebar}
          aria-label="Open menu"
        >
          <span className={styles.burgerLine + ' ' + styles.burgerLine1}></span>
          <span className={styles.burgerLine + ' ' + styles.burgerLine2}></span>
          <span className={styles.burgerLine + ' ' + styles.burgerLine3}></span>
        </div>
        <h1 className={styles.title}>{title}</h1>
      </div>
      
      <div className={styles.right}>
        
        <div className={styles.actions}>
          <button 
            className={styles.actionButton}
            onClick={toggleTheme}
            title={isDarkMode ? 'Light theme' : 'Dark theme'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          
          <div className={styles.userMenu}>
            <button className={styles.userButton}>
              <div className={styles.userAvatar}>👤</div>
              <span className={styles.userName}>{userName}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
