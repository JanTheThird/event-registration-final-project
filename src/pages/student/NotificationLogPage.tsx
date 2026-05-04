import { useState, useEffect } from 'react';
import { useDB } from '../../utils/localdb/db';
import type { Notification } from '../../utils/types/Index';

import NotificationHeader from '../student/components/notification/NotificationHeader';
import NotificationList from '../student/components/notification/NotificationList';

export default function NotificationLogPage() {
  const db = useDB();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const notifs = JSON.parse(localStorage.getItem('demoNotifications') || '[]');
    setNotifications(notifs);
  }, []);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('demoNotifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    if (confirm('Clear all logs?')) {
      setNotifications([]);
      localStorage.setItem('demoNotifications', '[]');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      <NotificationHeader
        onMarkAllRead={markAllRead}
        onClearAll={clearAll}
      />

      <div style={{ marginTop: '20px' }}>
        <NotificationList notifications={notifications} />
      </div>

    </div>
  );
}