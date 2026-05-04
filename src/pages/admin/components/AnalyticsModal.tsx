import { Modal, Button, Stack } from 'react-bootstrap';
import type { Event } from '../../../utils/types/Index';

export interface EventAnalytics {
  totalRegistered: number;
  quota: number;
  status: 'success' | 'failed' | 'upcoming';
}

function statusLabel(status: EventAnalytics['status']): string {
  switch (status) {
    case 'upcoming':
      return 'Upcoming — analytics run after the event date';
    case 'success':
      return 'Quota met (successful turnout)';
    case 'failed':
      return 'Below quota';
  }
}

export default function AnalyticsModal({
  event,
  analytics,
  onClose,
}: {
  event: Event | null;
  analytics: EventAnalytics | null;
  onClose: () => void;
}) {
  const open = Boolean(event && analytics);

  return (
    <Modal show={open} onHide={onClose} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="h5">{event ? `${event.name} — analytics` : 'Analytics'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {event && analytics && (
          <Stack gap={3}>
            <div>
              <div className="text-muted small">Registered</div>
              <div className="fs-5">{analytics.totalRegistered}</div>
            </div>
            <div>
              <div className="text-muted small">Quota</div>
              <div className="fs-5">{analytics.quota}</div>
            </div>
            <div>
              <div className="text-muted small">Outcome</div>
              <div>{statusLabel(analytics.status)}</div>
            </div>
          </Stack>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
