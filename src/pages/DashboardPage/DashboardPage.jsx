import { Card, Button } from "../../shared/ui";
import styles from "./DashboardPage.module.css";

const statsData = [
  {
    title: "Active users",
    value: "12,543",
    trend: "up",
    icon: "👥",
  },
  {
    title: "Online streams",
    value: "1,234",
    trend: "up",
    icon: "📺",
  },
  {
    title: "Active guilds",
    value: "567",
    trend: "down",
    icon: "🏰",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "user_warning",
    message: "Warning to user @user123 for rule violation",
    time: "2 minutes ago",
    severity: "warning",
  },
  {
    id: 2,
    type: "stream_ended",
    message: 'Stream "Gaming Stream #1" was terminated by admin',
    time: "15 minutes ago",
    severity: "info",
  },
  {
    id: 3,
    type: "guild_created",
    message: 'New guild "Pro Gamers" created',
    time: "1 hour ago",
    severity: "success",
  },
  {
    id: 4,
    type: "user_blocked",
    message: "User @spammer456 was blocked",
    time: "2 hours ago",
    severity: "error",
  },
];

export const DashboardPage = () => {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Panel</h1>
        <p className={styles.subtitle}>Platform status overview</p>
      </div>

      <div className={styles.statsGrid}>
        {statsData.map((stat, index) => (
          <Card key={index} variant="elevated" className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statIcon}>{stat.icon}</span>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statTitle}>{stat.title}</div>
          </Card>
        ))}
      </div>

      <Card padding="lg" className={styles.activityCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Recent activity</h2>
          <Button variant="ghost" size="sm">
            Show all
          </Button>
        </div>

        <div className={styles.activityList}>
          {recentActivity.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div
                className={`${styles.activityDot} ${
                  styles[activity.severity]
                }`}
              />
              <div className={styles.activityContent}>
                <div className={styles.activityMessage}>
                  {activity.message}
                </div>
                <div className={styles.activityTime}>{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* <Card padding="lg" className={styles.quickActions}>
          <h2 className={styles.cardTitle}>Quick actions</h2>

          <div className={styles.actionsList}>
            <Button variant="primary" className={styles.actionButton}>
              🚫 Emergency block
            </Button>
            <Button variant="warning" className={styles.actionButton}>
              📺 Terminate all streams
            </Button>
            <Button variant="secondary" className={styles.actionButton}>
              📊 Generate report
            </Button>
            <Button variant="success" className={styles.actionButton}>
              ✅ Mass approval
            </Button>
          </div>
        </Card> */}
    </div>
  );
};
