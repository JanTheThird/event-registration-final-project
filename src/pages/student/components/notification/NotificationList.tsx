import type { Notification } from '../../../../utils/types/Index';
import NotificationItem from './NotificationItem';

export default function NotificationList({
  notifications
}: {
  notifications: Notification[];
}) {
  if (notifications.length === 0) {
    return <p>No notifications yet.</p>;
  }

  return (
    <>
      {notifications.map(n => (
        <NotificationItem key={n.id} notif={n} />
      ))}
    </>
  );
}