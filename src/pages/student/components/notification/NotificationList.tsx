import type { Notification } from '../../../../utils/types/Index';
import NotificationItem from './NotificationItem';
import { ListGroup } from 'react-bootstrap';

export default function NotificationList({
  notifications,
  onMarkRead,
}: {
  notifications: Notification[];
  onMarkRead: (id: number) => void;
}) {
  if (notifications.length === 0) {
    return (
      <p className="text-muted text-center py-5 mb-0">
        No notifications yet. Register for an event or set a reminder to see
        activity here.
      </p>
    );
  }

  return (
    <ListGroup variant="flush" className="shadow-sm rounded border">
      {notifications.map((n) => (
        <NotificationItem key={n.id} notif={n} onMarkRead={onMarkRead} />
      ))}
    </ListGroup>
  );
}
