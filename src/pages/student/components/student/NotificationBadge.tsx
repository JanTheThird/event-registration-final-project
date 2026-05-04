import { useNavigate } from 'react-router-dom';
import { Badge, Button } from 'react-bootstrap';

export default function NotificationBadge({
  unread,
}: {
  unread: number;
}) {
  const navigate = useNavigate();

  return (
    <Button
      variant="primary"
      className="rounded-pill d-inline-flex align-items-center gap-2"
      onClick={() => navigate('/notifications')}
    >
      Notifications
      {unread > 0 && (
        <Badge bg="light" text="dark" pill>
          {unread}
        </Badge>
      )}
    </Button>
  );
}
