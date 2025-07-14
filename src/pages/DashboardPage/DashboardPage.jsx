import { Card, Button } from '../../shared/ui';
import styles from './DashboardPage.module.css';

const statsData = [
  {
    title: 'Активные пользователи',
    value: '12,543',
    change: '+12%',
    trend: 'up',
    icon: '👥'
  },
  {
    title: 'Онлайн трансляции',
    value: '1,234',
    change: '+8%',
    trend: 'up',
    icon: '📺'
  },
  {
    title: 'Активные гильдии',
    value: '567',
    change: '-3%',
    trend: 'down',
    icon: '🏰'
  },
  {
    title: 'Модерация (сегодня)',
    value: '23',
    change: '+5%',
    trend: 'up',
    icon: '🛡️'
  }
];

const recentActivity = [
  {
    id: 1,
    type: 'user_warning',
    message: 'Предупреждение пользователю @user123 за нарушение правил',
    time: '2 минуты назад',
    severity: 'warning'
  },
  {
    id: 2,
    type: 'stream_ended',
    message: 'Трансляция "Gaming Stream #1" была завершена админом',
    time: '15 минут назад',
    severity: 'info'
  },
  {
    id: 3,
    type: 'guild_created',
    message: 'Создана новая гильдия "Pro Gamers"',
    time: '1 час назад',
    severity: 'success'
  },
  {
    id: 4,
    type: 'user_blocked',
    message: 'Пользователь @spammer456 заблокирован',
    time: '2 часа назад',
    severity: 'error'
  }
];

export const DashboardPage = () => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Панель управления</h1>
        <p className={styles.subtitle}>Обзор состояния платформы</p>
      </div>

      <div className={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <Card key={index} variant="elevated" className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>{stat.icon}</span>
              <span className={`${styles.statChange} ${styles[stat.trend]}`}>
                {stat.change}
              </span>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statTitle}>{stat.title}</div>
          </Card>
        ))}
      </div>

      <div className={styles.contentGrid}>
        <Card padding="lg" className={styles.activityCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Последние действия</h2>
            <Button variant="ghost" size="sm">Показать все</Button>
          </div>
          
          <div className={styles.activityList}>
            {recentActivity.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={`${styles.activityDot} ${styles[activity.severity]}`} />
                <div className={styles.activityContent}>
                  <div className={styles.activityMessage}>{activity.message}</div>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className={styles.quickActions}>
          <h2 className={styles.cardTitle}>Быстрые действия</h2>
          
          <div className={styles.actionsList}>
            <Button variant="primary" className={styles.actionButton}>
              🚫 Экстренная блокировка
            </Button>
            <Button variant="warning" className={styles.actionButton}>
              📺 Завершить все трансляции
            </Button>
            <Button variant="secondary" className={styles.actionButton}>
              📊 Генерировать отчет
            </Button>
            <Button variant="success" className={styles.actionButton}>
              ✅ Массовое одобрение
            </Button>
          </div>
        </Card>

        <Card padding="lg" className={styles.systemStatus}>
          <h2 className={styles.cardTitle}>Состояние системы</h2>
          
          <div className={styles.statusList}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Сервер трансляций</span>
              <span className={`${styles.statusBadge} ${styles.online}`}>Онлайн</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>База данных</span>
              <span className={`${styles.statusBadge} ${styles.online}`}>Онлайн</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>CDN</span>
              <span className={`${styles.statusBadge} ${styles.warning}`}>Медленно</span>
            </div>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>API Gateway</span>
              <span className={`${styles.statusBadge} ${styles.online}`}>Онлайн</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
