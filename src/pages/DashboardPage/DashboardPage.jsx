import { useState, useEffect } from 'react';
import { Card, Button } from "../../shared/ui";
import styles from "./DashboardPage.module.css";
import api from '../../shared/lib/axios';

export const DashboardPage = () => {
  const [stats, setStats] = useState({ activeUsers: '-', activeStreams: '-', activeGuilds: '-' });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/user/statistic-blocks');
        setStats(res.data);
      } catch {}
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/user/activity-logs');
        setActivity(res.data);
      } catch {
        setError('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Panel</h1>
        <p className={styles.subtitle}>Platform status overview</p>
      </div>

      <div className={styles.statsGrid}>
        <Card variant="elevated" className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>👥</span>
          </div>
          <div className={styles.statValue}>{stats.activeUsers}</div>
          <div className={styles.statTitle}>Active users</div>
        </Card>
        <Card variant="elevated" className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>📺</span>
          </div>
          <div className={styles.statValue}>{stats.activeStreams}</div>
          <div className={styles.statTitle}>Online streams</div>
        </Card>
        <Card variant="elevated" className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>🏰</span>
          </div>
          <div className={styles.statValue}>{stats.activeGuilds}</div>
          <div className={styles.statTitle}>Active guilds</div>
        </Card>
      </div>

      <Card padding="lg" className={styles.activityCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Recent activity</h2>
          <Button variant="ghost" size="sm">
            Show all
          </Button>
        </div>

        <div className={styles.activityList}>
          {loading ? (
            <div className={styles.activityMessage}>Loading...</div>
          ) : error ? (
            <div className={styles.activityMessage}>{error}</div>
          ) : activity.length === 0 ? (
            <div className={styles.activityMessage}>No activity logs</div>
          ) : [...activity].reverse().map((log, i) => {
              let dotClass = styles.info;
              const action = log.action?.toLowerCase() || '';
              if (action.includes('unblocked')) dotClass = styles.success;
              else if (action.includes('warning')) dotClass = styles.warning;
              else if (action.includes('blocked')) dotClass = styles.error;
              return (
                <div key={log.id || i} className={styles.activityItem}>
                  <div className={`${styles.activityDot} ${dotClass}`} />
                  <div className={styles.activityContent}>
                    <div className={styles.activityMessage}>{log.action}</div>
                    <div className={styles.activityTime}>{log.timeAgo}</div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
};
