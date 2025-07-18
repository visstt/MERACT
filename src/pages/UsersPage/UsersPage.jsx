import { useState, useEffect } from 'react';
import { Card, Button } from '../../shared/ui';
import styles from './UsersPage.module.css';
import api from '../../shared/lib/axios';

const STATUS_MAP = {
  ACTIVE: 'active',
  WARNED: 'warning',
  BLOCKED: 'blocked',
};

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isMobileCardView, setIsMobileCardView] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/user/all-users');
        // Convert data to required UI format
        setUsers(res.data.map(u => ({
          id: u.id,
          username: u.login || u.email,
          email: u.email,
          status: STATUS_MAP[u.status] || 'active',
          lastActive: u.lastActivity,
          warnings: u.warnings,
          streamCount: u.streams,
          followers: u.followers,
        })).sort((a, b) => a.email.localeCompare(b.email)));
      } catch (e) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobileCardView(window.innerWidth <= 480);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUserAction = async (userId, action) => {
    let url = '';
    if (action === 'warn') url = `/user/issue-warning?userId=${userId}`;
    if (action === 'block') url = `/user/block-user?userId=${userId}`;
    if (action === 'unblock') url = `/user/unblock-user?userId=${userId}`;
    if (action === 'delete') url = `/user/delete-user?userId=${userId}`;
    try {
      await api.post(url);
      // Refresh users after action
      const res = await api.get('/user/all-users');
      setUsers(res.data.map(u => ({
        id: u.id,
        username: u.login || u.email,
        email: u.email,
        status: STATUS_MAP[u.status] || 'active',
        lastActive: u.lastActivity,
        warnings: u.warnings,
        streamCount: u.streams,
        followers: u.followers,
      })).sort((a, b) => a.email.localeCompare(b.email)));
    } catch (e) {
      alert('Action failed');
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = (action) => {
    selectedUsers.forEach(userId => {
      handleUserAction(userId, action);
    });
    setSelectedUsers([]);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Active', className: 'success' },
      warning: { label: 'Warning', className: 'warning' },
      blocked: { label: 'Blocked', className: 'error' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return <span className={`${styles.statusBadge} ${styles[config.className]}`}>{config.label}</span>;
  };

  return (
    <div className={styles.usersPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Manage accounts and moderate users</p>
        </div>
        <Button variant="primary">Export data</Button>
      </div>

      <Card padding="lg" className={styles.filtersCard}>
        <div className={styles.filters}>
          <div className={styles.searchGroup}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="warning">With warnings</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          
          {selectedUsers.length > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectedCount}>
                Selected: {selectedUsers.length}
              </span>
              <div className={styles.bulkButtons}>
                <Button 
                  variant="warning" 
                  size="sm"
                  onClick={() => handleBulkAction('warn')}
                >
                  Warn
                </Button>
                <Button 
                  variant="error" 
                  size="sm"
                  onClick={() => handleBulkAction('block')}
                >
                  Block
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                >
                  Cancel selection
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {!isMobileCardView && (
        <Card padding="none" className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>User list ({filteredUsers.length})</h2>
          </div>
          
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    />
                  </th>
                  <th>User</th>
                  <th>Status</th>
                  <th>Last active</th>
                  <th>Warnings</th>
                  <th>Streams</th>
                  <th>Followers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className={selectedUsers.includes(user.id) ? styles.selected : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={styles.username}>{user.username}</div>
                          <div className={styles.email}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td className={styles.lastActive}>{user.lastActive}</td>
                    <td>
                      <span className={`${styles.warningBadge} ${user.warnings > 0 ? styles.hasWarnings : ''}`}>
                        {user.warnings}
                      </span>
                    </td>
                    <td>{user.streamCount}</td>
                    <td>{user.followers.toLocaleString()}</td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'warn')}
                          disabled={user.status === 'blocked'}
                        >
                          ⚠️
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, user.status === 'blocked' ? 'unblock' : 'block')}
                        >
                          {user.status === 'blocked' ? '✅' : '🚫'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'delete')}
                        >
                          🗑️
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👥</div>
                <div className={styles.emptyTitle}>Users not found</div>
                <div className={styles.emptyText}>
                  Try changing search or filter parameters
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
      {isMobileCardView && (
        <div className={styles.userCards}>
          {filteredUsers.map(user => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userCardHeader}>
                <div className={styles.userCardAvatar}>{user.username.charAt(0).toUpperCase()}</div>
                <div className={styles.userCardInfo}>
                  <div className={styles.userCardName}>{user.username}</div>
                  <div className={styles.userCardEmail}>{user.email}</div>
                </div>
                <div>{getStatusBadge(user.status)}</div>
              </div>
              <div className={styles.userCardRow}>
                <span>Last active: {user.lastActive}</span>
                <span>Warnings: {user.warnings}</span>
              </div>
              <div className={styles.userCardRow}>
                <span>Streams: {user.streamCount}</span>
                <span>Followers: {user.followers.toLocaleString()}</span>
              </div>
              <div className={styles.userCardActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUserAction(user.id, 'warn')}
                  disabled={user.status === 'blocked'}
                >
                  ⚠️
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUserAction(user.id, user.status === 'blocked' ? 'unblock' : 'block')}
                >
                  {user.status === 'blocked' ? '✅' : '🚫'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUserAction(user.id, 'delete')}
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👥</div>
              <div className={styles.emptyTitle}>Users not found</div>
              <div className={styles.emptyText}>
                Try changing search or filter parameters
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
