import type { Notification } from '../../../../utils/types/Index';

export default function NotificationItem({ notif }: {
  notif: Notification;
}) {
  return (
    <div style={{
      padding: '15px',
      borderBottom: '1px solid #eee',
      background: notif.read ? 'transparent' : '#f0f7ff',
      borderRadius: '8px',
      marginBottom: '10px'
    }}>
      <strong>{notif.action}</strong>
      <div style={{ fontSize: '12px', color: '#666' }}>
        {new Date(notif.timestamp).toLocaleString()}
      </div>
    </div>
  );
}