import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useDB } from '../../utils/localdb/db';
import type { Notification } from '../../utils/types/Index';
import { useAuth } from '../../utils/context/AuthContext';

import NotificationHeader from './components/notification/NotificationHeader';
import NotificationList from './components/notification/NotificationList';

export default function NotificationLogPage() {
  const db = useDB();
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = () => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    const mine = db
      .getNotifications()
      .filter((n) => n.userId === userId)
      .slice()
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    setNotifications(mine);
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- db API reads live module state; userId drives reload
  }, [userId]);

  const markAllRead = () => {
    if (!userId) return;
    db.markAllNotificationsReadForUser(userId);
    refresh();
  };

  const clearAll = () => {
    if (!userId) return;
    if (confirm('Clear all notifications for your account?')) {
      db.clearNotificationsForUser(userId);
      refresh();
    }
  };

  const markOneRead = (id: number) => {
    db.markNotificationRead(id);
    refresh();
  };

  return (
    <Container className="py-4" style={{ maxWidth: 720 }}>
      <NotificationHeader
        onMarkAllRead={markAllRead}
        onClearAll={clearAll}
      />

      <div className="mt-3">
        <NotificationList
          notifications={notifications}
          onMarkRead={markOneRead}
        />
      </div>
    </Container>
  );
}
