import { Button, ButtonGroup, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export default function NotificationHeader({
  onMarkAllRead,
  onClearAll,
}: {
  onMarkAllRead: () => void;
  onClearAll: () => void;
}) {
  const navigate = useNavigate();

  return (
    <Stack gap={3}>
      <Button variant="outline-secondary" onClick={() => navigate('/student')}>
        ← Back to dashboard
      </Button>

      <Stack
        direction="horizontal"
        className="justify-content-between align-items-center flex-wrap gap-2"
      >
        <h1 className="h3 mb-0">Notifications</h1>
        <ButtonGroup>
          <Button variant="outline-primary" size="sm" onClick={onMarkAllRead}>
            Mark all read
          </Button>
          <Button variant="outline-danger" size="sm" onClick={onClearAll}>
            Clear all
          </Button>
        </ButtonGroup>
      </Stack>
    </Stack>
  );
}
