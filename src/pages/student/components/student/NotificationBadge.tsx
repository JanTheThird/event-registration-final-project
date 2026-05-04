import { useNavigate } from 'react-router-dom';

export default function NotificationBadge({ unread }: {
  unread: number;
}) {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate('/notifications')} className="notif-badge-float">
      Notifications {unread > 0 && <span className="unread-dot">{unread}</span>}
    </div>
  );
}