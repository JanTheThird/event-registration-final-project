import { useNavigate } from 'react-router-dom';

export default function NotificationHeader({
  onMarkAllRead,
  onClearAll
}: {
  onMarkAllRead: () => void;
  onClearAll: () => void;
}) {
  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => navigate('/student')}>
        ← Back to Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Notification Log</h1>

        <div>
          <button onClick={onMarkAllRead}>
            Mark all read
          </button>
          <button onClick={onClearAll} style={{ color: 'red' }}>
            Clear All
          </button>
        </div>
      </div>
    </>
  );
}