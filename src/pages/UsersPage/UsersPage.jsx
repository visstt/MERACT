import { useState } from 'react';
import { Card, Button } from '../../shared/ui';
import styles from './UsersPage.module.css';

const mockUsers = [
  {
    id: 1,
    username: 'user123',
    email: 'user123@example.com',
    status: 'active',
    lastActive: '2024-01-15 14:30',
    warnings: 1,
    streamCount: 5,
    followers: 150
  },
  {
    id: 2,
    username: 'streamer456',
    email: 'streamer456@example.com',
    status: 'warning',
    lastActive: '2024-01-15 12:15',
    warnings: 2,
    streamCount: 25,
    followers: 1250
  },
  {
    id: 3,
    username: 'gamer789',
    email: 'gamer789@example.com',
    status: 'blocked',
    lastActive: '2024-01-14 09:45',
    warnings: 5,
    streamCount: 2,
    followers: 50
  }
];

export const UsersPage = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUserAction = (userId, action) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        switch (action) {
          case 'warn':
            return { ...user, warnings: user.warnings + 1, status: user.warnings >= 2 ? 'warning' : user.status };
          case 'block':
            return { ...user, status: 'blocked' };
          case 'unblock':
            return { ...user, status: 'active' };
          case 'delete':
            return null;
          default:
            return user;
        }
      }
      return user;
    }).filter(Boolean));
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
      active: { label: 'Активен', className: 'success' },
      warning: { label: 'Предупреждение', className: 'warning' },
      blocked: { label: 'Заблокирован', className: 'error' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return <span className={`${styles.statusBadge} ${styles[config.className]}`}>{config.label}</span>;
  };

  return (
    <div className={styles.usersPage}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Управление пользователями</h1>
          <p className={styles.subtitle}>Управление учетными записями и модерация пользователей</p>
        </div>
        <Button variant="primary">Экспорт данных</Button>
      </div>

      <Card padding="lg" className={styles.filtersCard}>
        <div className={styles.filters}>
          <div className={styles.searchGroup}>
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">Все статусы</option>
              <option value="active">Активные</option>
              <option value="warning">С предупреждениями</option>
              <option value="blocked">Заблокированные</option>
            </select>
          </div>
          
          {selectedUsers.length > 0 && (
            <div className={styles.bulkActions}>
              <span className={styles.selectedCount}>
                Выбрано: {selectedUsers.length}
              </span>
              <div className={styles.bulkButtons}>
                <Button 
                  variant="warning" 
                  size="sm"
                  onClick={() => handleBulkAction('warn')}
                >
                  Предупредить
                </Button>
                <Button 
                  variant="error" 
                  size="sm"
                  onClick={() => handleBulkAction('block')}
                >
                  Заблокировать
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedUsers([])}
                >
                  Отменить выбор
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card padding="none" className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Список пользователей ({filteredUsers.length})</h2>
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
                <th>Пользователь</th>
                <th>Статус</th>
                <th>Последняя активность</th>
                <th>Предупреждения</th>
                <th>Трансляции</th>
                <th>Подписчики</th>
                <th>Действия</th>
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
              <div className={styles.emptyTitle}>Пользователи не найдены</div>
              <div className={styles.emptyText}>
                Попробуйте изменить параметры поиска или фильтрации
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
