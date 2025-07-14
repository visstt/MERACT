import { useState } from 'react';
import { Sidebar } from '../widgets/Sidebar';
import { Header } from '../widgets/Header';
import { DashboardPage } from '../pages/DashboardPage';
import { UsersPage } from '../pages/UsersPage';
import { StreamsPage } from '../pages/StreamsPage';
import styles from './App.module.css';

const pageComponents = {
  dashboard: DashboardPage,
  users: UsersPage,
  streams: StreamsPage,
  guilds: () => <div className={styles.placeholder}>Страница гильдий - в разработке</div>,
  content: () => <div className={styles.placeholder}>Страница контента - в разработке</div>,
  moderation: () => <div className={styles.placeholder}>Страница модерации - в разработке</div>,
  analytics: () => <div className={styles.placeholder}>Страница аналитики - в разработке</div>,
  settings: () => <div className={styles.placeholder}>Страница настроек - в разработке</div>
};

const pageTitles = {
  dashboard: 'Dashboard',
  users: 'Управление пользователями',
  streams: 'Трансляции',
  guilds: 'Гильдии',
  content: 'Контент и медиа',
  moderation: 'Модерация',
  analytics: 'Аналитика',
  settings: 'Настройки системы'
};

export const App = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handlePageChange = (pageId) => {
    setCurrentPage(pageId);
    // Close mobile sidebar when page changes
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const CurrentPageComponent = pageComponents[currentPage] || pageComponents.dashboard;

  return (
    <div className={styles.app}>
      <div className={`${styles.sidebarContainer} ${sidebarOpen ? styles.open : ''}`}>
        <Sidebar 
          activeItem={currentPage}
          onItemClick={handlePageChange}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
      </div>
      
      {sidebarOpen && <div className={styles.overlay} onClick={toggleSidebar} />}
      
      <div className={`${styles.mainContent} ${sidebarCollapsed ? styles.expanded : ''}`}>
        <Header 
          title={pageTitles[currentPage]}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        
        <main className={styles.pageContent}>
          <CurrentPageComponent />
        </main>
      </div>
    </div>
  );
};
