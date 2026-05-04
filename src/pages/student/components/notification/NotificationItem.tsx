import type { Notification } from '../../../../utils/types/Index';
import { Badge, ListGroup } from 'react-bootstrap';

export default function NotificationItem({
  notif,
  onMarkRead,
}: {
  notif: Notification;
  onMarkRead: (id: number) => void;
}) {
  return (
    <ListGroup.Item
      className={notif.read ? '' : 'bg-light'}
      action={!notif.read}
      onClick={() => {
        if (!notif.read) onMarkRead(notif.id);
      }}
      style={{ cursor: notif.read ? 'default' : 'pointer' }}
    >
      <div className="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div className="fw-semibold">{notif.action}</div>
          <div className="small text-muted mt-1">
            {new Date(notif.timestamp).toLocaleString()}
          </div>
        </div>
        {!notif.read && (
          <Badge bg="primary" pill>
            New
          </Badge>
        )}
      </div>
    </ListGroup.Item>
  );
}
