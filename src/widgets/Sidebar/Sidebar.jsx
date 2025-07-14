import { useState } from 'react';
import styles from './Sidebar.module.css';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/'
  },
  {
    id: 'users',
    label: 'Управление пользователями',
    icon: '👥',
    path: '/users'
  },
  {
    id: 'streams',
    label: 'Трансляции',
    icon: '📺',
    path: '/streams'
  },
  {
    id: 'guilds',
    label: 'Гильдии',
    icon: '🏰',
    path: '/guilds'
  },
  {
    id: 'content',
    label: 'Контент и медиа',
    icon: '🎬',
    path: '/content'
  },
  {
    id: 'moderation',
    label: 'Модерация',
    icon: '🛡️',
    path: '/moderation'
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    icon: '📈',
    path: '/analytics'
  },
  {
    id: 'settings',
    label: 'Настройки системы',
    icon: '⚙️',
    path: '/settings'
  }
];

export const Sidebar = ({ activeItem, onItemClick, collapsed = false, onToggle }) => {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎮</span>
          {!collapsed && <span className={styles.logoText}>Meract Admin</span>}
        </div>
        <button 
          className={styles.toggleButton}
          onClick={onToggle}
          aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.id} className={styles.menuItem}>
              <button
                className={`${styles.menuButton} ${activeItem === item.id ? styles.active : ''}`}
                onClick={() => onItemClick(item.id, item.path)}
                title={collapsed ? item.label : ''}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!collapsed && <span className={styles.menuLabel}>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className={styles.footer}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>👤</div>
          {!collapsed && (
            <div className={styles.userDetails}>
              <div className={styles.userName}>Супер Админ</div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
