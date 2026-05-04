import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Stack, Button } from 'react-bootstrap';
import { useDB } from '../../utils/localdb/db';
import type { Event } from '../../utils/types/Index';

import NotificationBadge from '../student/components/student/NotificationBadge';
import RegisteredEventCard from '../student/components/student/RegisteredEventCard';
import AvailableEventCard from '../student/components/student/AvailableEventCard';
import EventsSection from '../student/components/student/EventsSection';
import { useAuth } from '../../utils/context/AuthContext';

export default function StudentPage() {
  const db = useDB();
  const { userId, logout, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [unread, setUnread] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // ---------------------------
  // HELPER: Convert userId safely
  // ---------------------------
  const getUserIdNum = (): number | null => {
    if (!userId) return null;
    return userId;
  };

  // ---------------------------
  // DERIVED DATA (NO STATE)
  // ---------------------------
  const events: Event[] = db.getEvents().filter(e => e.date >= today);

  const userIdNum = getUserIdNum();
  const registeredIds = userIdNum
    ? db.getUserRegistrations(userIdNum) // ✅ Now passes number
    : [];

  const registeredEvents = events.filter(e =>
    registeredIds.includes(e.id)
  );

  const availableEvents = events.filter(e =>
    !registeredIds.includes(e.id)
  );

  // ---------------------------
  // EFFECTS
  // ---------------------------
  const refreshUnread = () => {
    if (!userIdNum) {
      setUnread(0);
      return;
    }
    
    const notifs = db.getNotifications().filter(n => n.userId === userIdNum); // ✅ Fixed!
    setUnread(notifs.filter(n => !n.read).length);
  };

  useEffect(() => {
    refreshUnread();
  }, [userId, location.pathname]);

  // ---------------------------
  // HELPERS
  // ---------------------------
  const getDaysUntil = (date: string) => {
    const d = new Date(date + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - now.getTime()) / 86400000);
  };

  const isRegistered = (eventId: number) =>
    registeredIds.includes(eventId);

  // ---------------------------
  // ACTIONS - ALL FIXED!
  // ---------------------------
  const toggleRegistration = (event: Event) => {
    if (!userIdNum) {
      alert('Please log in first!');
      return;
    }

    const exists = isRegistered(event.id);

    if (exists) {
      db.unregisterFromEvent(userIdNum, event.id); // ✅ Number
    } else {
      db.registerForEvent(userIdNum, event.id); // ✅ Number
    }

    db.addNotification({
      userId: userIdNum, // ✅ Number
      eventId: event.id,
      eventName: event.name,
      type: exists ? 'unregister' : 'register',
      action: exists
        ? `Unregistered: ${event.name}`
        : `Registered: ${event.name}`
    });

    refreshUnread();
  };

  const notifyLater = (event: Event, days: number) => {
    if (!userIdNum) {
      alert('Please log in first!');
      return;
    }

    db.addNotification({
      userId: userIdNum, // ✅ Number
      eventId: event.id,
      eventName: event.name,
      type: 'reminder_set',
      action: `Reminder set: ${event.name} (${days}d before)`
    });

    setOpenDropdown(null);
    refreshUnread();
  };

  // ---------------------------
  // RENDER
  // ---------------------------
  if (authLoading) {
    return (
      <Container className="py-5 text-center student-container">
        <div className="loading-spinner" aria-hidden />
        <p className="mt-3 text-muted mb-0">Loading session…</p>
      </Container>
    );
  }

  if (!userIdNum) {
    return (
      <Container className="py-5 student-container">
        <h1 className="h3">Please sign in</h1>
        <Button variant="primary" onClick={() => navigate('/')}>
          Go to sign in
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4 student-container">
      <Stack
        direction="horizontal"
        className="page-header flex-wrap justify-content-between align-items-center gap-3 mb-4"
      >
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <NotificationBadge unread={unread} />
          <h1 className="h3 mb-0">Student dashboard</h1>
        </div>
        <Button variant="outline-danger" size="sm" onClick={logout}>
          Log out
        </Button>
      </Stack>

      <EventsSection title="My Registered Events">
        {registeredEvents.length === 0 ? (
          <p>No registered events</p>
        ) : (
          registeredEvents.map(event => (
            <RegisteredEventCard
              key={event.id}
              event={event}
              daysUntil={getDaysUntil(event.date)}
              isDropdownOpen={openDropdown === event.id}
              onToggleDropdown={() =>
                setOpenDropdown(openDropdown === event.id ? null : event.id)
              }
              onUnregister={() => toggleRegistration(event)}
              onNotify={(d) => notifyLater(event, d)}
            />
          ))
        )}
      </EventsSection>

      <EventsSection title="Available Events">
        {availableEvents.length === 0 ? (
          <p>No available events</p>
        ) : (
          availableEvents.map(event => (
            <AvailableEventCard
              key={event.id}
              event={event}
              onRegister={() => toggleRegistration(event)}
            />
          ))
        )}
      </EventsSection>
    </Container>
  );
}