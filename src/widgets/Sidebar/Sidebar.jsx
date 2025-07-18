import { useState } from "react";
import styles from "./Sidebar.module.css";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "📊",
    path: "/",
  },
  {
    id: "users",
    label: "User Management",
    icon: "👥",
    path: "/users",
  },
  {
    id: "streams",
    label: "Streams",
    icon: "📺",
    path: "/streams",
  },
  {
    id: "guilds",
    label: "Guilds",
    icon: "🏰",
    path: "/guilds",
  },
  {
    id: "content",
    label: "Content & Media",
    icon: "🎬",
    path: "/content",
  },
  {
    id: "moderation",
    label: "Moderation",
    icon: "🛡️",
    path: "/moderation",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📈",
    path: "/analytics",
  },
  {
    id: "settings",
    label: "System Settings",
    icon: "⚙️",
    path: "/settings",
  },
];

export const Sidebar = ({
  activeItem,
  onItemClick,
  collapsed = false,
  onToggle,
}) => {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎮</span>
          {!collapsed && <span className={styles.logoText}>Meract Admin</span>}
        </div>
        <button
          className={styles.toggleButton}
          onClick={onToggle}
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.id} className={styles.menuItem}>
              <button
                className={`${styles.menuButton} ${
                  activeItem === item.path ? styles.active : ""
                }`}
                onClick={() => onItemClick(item.path)}
                title={collapsed ? item.label : ""}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                {!collapsed && (
                  <span className={styles.menuLabel}>{item.label}</span>
                )}
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
              <div className={styles.userName}>Super Admin</div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
