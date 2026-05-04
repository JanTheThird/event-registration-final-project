import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Button, Nav, Tab } from 'react-bootstrap';
import { useDB } from '../../utils/localdb/db';
import type { Event } from '../../utils/types/Index';

import RegisteredEventCard from './components/student/RegisteredEventCard';
import AvailableEventCard from './components/student/AvailableEventCard';
import EventsSection from './components/student/EventsSection';
import { useAuth } from '../../utils/context/AuthContext';
import StudentNavbar from './components/StudentNavbar';

export default function StudentPage() {
  const db = useDB();
  const { userId, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [unread, setUnread] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [studentSection, setStudentSection] = useState<'registered' | 'upcoming'>('upcoming');

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
  const refreshUnread = useCallback(() => {
    if (!userIdNum) {
      setUnread(0);
      return;
    }

    const notifs = db.getNotifications().filter((n) => n.userId === userIdNum);
    setUnread(notifs.filter((n) => !n.read).length);
  }, [db, userIdNum]);

  useEffect(() => {
    refreshUnread();
  }, [refreshUnread, location.pathname]);

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
    <>
      <StudentNavbar unread={unread} />
      <Container className="py-4 student-container">
        <h1 className="h3 mb-3">Student dashboard</h1>

        <Tab.Container
          activeKey={studentSection}
          onSelect={(k) => {
            if (k === 'registered' || k === 'upcoming') setStudentSection(k);
          }}
        >
          <Nav variant="pills" className="mb-4 flex-wrap gap-2" role="tablist">
            <Nav.Item>
              <Nav.Link eventKey="upcoming" role="tab">
                Upcoming events
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="registered" role="tab">
                My registered events
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="upcoming" className="pt-1" mountOnEnter unmountOnExit={false}>
              <EventsSection title="Browse upcoming">
                {availableEvents.length === 0 ? (
                  <p className="text-muted">No upcoming events to join right now.</p>
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
            </Tab.Pane>

            <Tab.Pane eventKey="registered" className="pt-1" mountOnEnter unmountOnExit={false}>
              <EventsSection title="You are registered for">
                {registeredEvents.length === 0 ? (
                  <p className="text-muted">You have not registered for any upcoming events yet.</p>
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
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Container>
    </>
  );
}