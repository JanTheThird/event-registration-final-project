import { useMemo, useCallback } from 'react';
import { useDB } from '../../../../../utils/localdb/db';
import type { Event } from '../../../../../utils/types/Index';

export default function useEventActions(userId: number | null) {
  const db = useDB();

  const events = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return db.getEvents().filter(e => e.date >= today);
  }, [db]);

  const registeredIds = useMemo(() => 
    userId ? db.getUserRegistrations(userId) : [],
    [userId, db]
  );

  const registeredEvents = useMemo(() =>
    events.filter(e => registeredIds.includes(e.id)),
    [events, registeredIds]
  );

  const availableEvents = useMemo(() =>
    events.filter(e => !registeredIds.includes(e.id)),
    [events, registeredIds]
  );

  const getDaysUntil = useCallback((date: string): number => {
    const eventDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  const toggleRegistration = useCallback((event: Event) => {
    if (!userId) {
      alert('Please log in first!');
      return;
    }

    const isCurrentlyRegistered = registeredIds.includes(event.id);
    
    if (isCurrentlyRegistered) {
      db.unregisterFromEvent(userId, event.id);
      db.addNotification({
        userId,
        eventId: event.id,
        eventName: event.name,
        type: 'unregister',
        action: `Unregistered from: ${event.name}`
      });
    } else {
      db.registerForEvent(userId, event.id);
      db.addNotification({
        userId,
        eventId: event.id,
        eventName: event.name,
        type: 'register',
        action: `Registered for: ${event.name}`
      });
    }
  }, [userId, registeredIds, db]);

  const notifyLater = useCallback((event: Event, days: number) => {
    if (!userId) return;
    
    db.addNotification({
      userId,
      eventId: event.id,
      eventName: event.name,
      type: 'reminder_set',
      action: `Reminder set: ${event.name} (${days} days before)`
    });
  }, [userId, db]);

  return {
    events,
    registeredEvents,
    availableEvents,
    toggleRegistration,
    notifyLater,
    getDaysUntil
  };
}
