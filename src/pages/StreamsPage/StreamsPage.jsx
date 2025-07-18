import { useState } from 'react';
import { Card, Button } from '../../shared/ui';
import styles from './StreamsPage.module.css';

const mockStreams = [
  {
    id: 1,
    title: 'Gaming Stream #1',
    streamer: 'ProGamer123',
    viewers: 1234,
    duration: '2:30:15',
    status: 'live',
    category: 'Gaming',
    thumbnailUrl: null,
    startTime: '2024-01-15 12:00:00'
  },
  {
    id: 2,
    title: 'Music Session',
    streamer: 'MusicLover456',
    viewers: 567,
    duration: '1:45:20',
    status: 'live',
    category: 'Music',
    thumbnailUrl: null,
    startTime: '2024-01-15 13:15:00'
  },
  {
    id: 3,
    title: 'Terminated Stream',
    streamer: 'ViolatingUser',
    viewers: 0,
    duration: '0:15:30',
    status: 'terminated',
    category: 'Gaming',
    thumbnailUrl: null,
    startTime: '2024-01-15 14:00:00'
  }
];

export const StreamsPage = () => {
  const [streams, setStreams] = useState(mockStreams);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredStreams = streams.filter(stream => {
    const matchesStatus = statusFilter === 'all' || stream.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || stream.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  const handleStreamAction = (streamId, action) => {
    setStreams(streams.map(stream => {
      if (stream.id === streamId) {
        switch (action) {
          case 'terminate':
            return { ...stream, status: 'terminated', viewers: 0 };
          case 'warn':
            // Would send warning to streamer
            return stream;
          default:
            return stream;
        }
      }
      return stream;
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      live: { label: 'Live', className: 'success' },
      terminated: { label: 'Terminated', className: 'error' },
      paused: { label: 'Paused', className: 'warning' }
    };
    
    const config = statusConfig[status] || statusConfig.live;
    return <span className={`${styles.statusBadge} ${styles[config.className]}`}>{config.label}</span>;
  };

  const terminateAllStreams = () => {
    setStreams(streams.map(stream => 
      stream.status === 'live' 
        ? { ...stream, status: 'terminated', viewers: 0 }
        : stream
    ));
  };

  return (
    <div className={styles.streamsPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Stream Management</h1>
          <p className={styles.subtitle}>Monitoring and moderation of active streams</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="warning" onClick={terminateAllStreams}>
            Terminate all streams
          </Button>
          <Button variant="primary">Stream statistics</Button>
        </div>
      </div>

      <div className={styles.statsCards}>
        <Card padding="lg" className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>📺</span>
            <span className={styles.statValue}>{streams.filter(s => s.status === 'live').length}</span>
          </div>
          <div className={styles.statLabel}>Active streams</div>
        </Card>
        
        <Card padding="lg" className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>👥</span>
            <span className={styles.statValue}>
              {streams.filter(s => s.status === 'live').reduce((sum, s) => sum + s.viewers, 0).toLocaleString()}
            </span>
          </div>
          <div className={styles.statLabel}>Total viewers</div>
        </Card>
        
        <Card padding="lg" className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statIcon}>🛡️</span>
            <span className={styles.statValue}>{streams.filter(s => s.status === 'terminated').length}</span>
          </div>
          <div className={styles.statLabel}>Terminated by admin</div>
        </Card>
      </div>

      <Card padding="lg" className={styles.filtersCard}>
        <div className={styles.filters}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All statuses</option>
            <option value="live">Live</option>
            <option value="terminated">Terminated</option>
            <option value="paused">Paused</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All categories</option>
            <option value="Gaming">Gaming</option>
            <option value="Music">Music</option>
            <option value="Art">Art</option>
            <option value="Talk">Talk</option>
          </select>
        </div>
      </Card>

      <Card padding="none" className={styles.streamsCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Active streams ({filteredStreams.length})</h2>
        </div>
        
        <div className={styles.streamsList}>
          {filteredStreams.map((stream) => (
            <div key={stream.id} className={styles.streamItem}>
              <div className={styles.streamThumbnail}>
                <div className={styles.thumbnailPlaceholder}>
                  📺
                </div>
                {stream.status === 'live' && (
                  <div className={styles.liveIndicator}>LIVE</div>
                )}
              </div>
              
              <div className={styles.streamInfo}>
                <h3 className={styles.streamTitle}>{stream.title}</h3>
                <div className={styles.streamMeta}>
                  <span className={styles.streamerName}>@{stream.streamer}</span>
                  <span className={styles.category}>{stream.category}</span>
                  {getStatusBadge(stream.status)}
                </div>
                <div className={styles.streamStats}>
                  <span>👥 {stream.viewers.toLocaleString()} viewers</span>
                  <span>⏱️ {stream.duration}</span>
                  <span>🕒 {stream.startTime}</span>
                </div>
              </div>
              
              <div className={styles.streamActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  title="View stream"
                >
                  👁️
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title="View chat"
                >
                  💬
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStreamAction(stream.id, 'warn')}
                  title="Warn streamer"
                  disabled={stream.status !== 'live'}
                >
                  ⚠️
                </Button>
                <Button
                  variant="error"
                  size="sm"
                  onClick={() => handleStreamAction(stream.id, 'terminate')}
                  disabled={stream.status !== 'live'}
                >
                  🛑 Terminate
                </Button>
              </div>
            </div>
          ))}
          
          {filteredStreams.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📺</div>
              <div className={styles.emptyTitle}>No streams found</div>
              <div className={styles.emptyText}>
                No streams match the selected filters
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
