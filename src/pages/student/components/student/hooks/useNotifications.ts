import { useState, useEffect, useCallback } from 'react';
import { useDB } from '../../../../../utils/localdb/db';

export default function useNotifications(userId: number | null) {
  const db = useDB();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }
    
    const userNotifications = db.getNotifications().filter(n => n.userId === userId);
    const unread = userNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [db, userId]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread]);

  return { unreadCount, refreshUnread };
}