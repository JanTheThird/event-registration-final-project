import { useState, useEffect } from 'react';
import { useDB } from '../../utils/localdb/db';
import type { Event } from '../../utils/types/Index';

import NotificationBadge from '../student/components/student/NotificationBadge';
import RegisteredEventCard from '../student/components/student/RegisteredEventCard';
import AvailableEventCard from '../student/components/student/AvailableEventCard';
import EventsSection from '../student/components/student/EventsSection';
import { useAuth } from '../../utils/context/AuthContext';

export default function StudentPage() {
  const db = useDB();
  const { userId, logout } = useAuth();

  const [unread, setUnread] = useState(0);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  // ---------------------------
  // HELPER: Convert userId safely
  // ---------------------------
  const getUserIdNum = (): number | null => {
    if (!userId) return null;
    return parseInt(userId);
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
  useEffect(() => {
    refreshUnread();
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userIdNum) {
      refreshUnread();
    }
  }, [events.length, userId]);

  // ---------------------------
  // FIXED: refreshUnread
  // ---------------------------
  const refreshUnread = () => {
    if (!userIdNum) {
      setUnread(0);
      return;
    }
    
    const notifs = db.getNotifications().filter(n => n.userId === userIdNum); // ✅ Fixed!
    setUnread(notifs.filter(n => !n.read).length);
  };

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
  if (loading) {
    return <div className="student-container">Loading...</div>;
  }

  if (!userIdNum) {
    return (
      <div className="student-container">
        <h1>Please log in</h1>
        <button onClick={() => window.location.href = '/'}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="student-container">
      <div className="page-header">
        <NotificationBadge unread={unread} />
        <h1>Student Dashboard</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

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
    </div>
  );
}