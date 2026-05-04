import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDB } from '../../utils/localdb/db';
import type { Event } from '../../utils/types/Index';

export default function StudentPage() {
  const db = useDB();
  const navigate = useNavigate();
  const [allUpcomingEvents, setAllUpcomingEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [openNotificationDropdown, setOpenNotificationDropdown] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshUnreadCount = useCallback(() => {
    const raw = localStorage.getItem('demoNotifications');
    const notifications = raw ? JSON.parse(raw) : [];
    const unread = notifications.filter((n: any) => !n.read).length;
    setUnreadCount(unread);
  }, []);

  useEffect(() => {
    refreshEvents();
    refreshUnreadCount();
    const interval = setInterval(refreshUnreadCount, 5000);
    return () => clearInterval(interval);
  }, [today, refreshUnreadCount]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setOpenNotificationDropdown(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  const refreshEvents = () => {
    const events = db.getEvents();
    const future = events.filter(event => event.date >= today);
    setAllUpcomingEvents(future);
    
    const saved = localStorage.getItem('demoRegisteredEvents');
    if (saved) {
      const parsedIds: number[] = JSON.parse(saved);
      setRegisteredEvents(future.filter(e => parsedIds.includes(e.id)));
    } else {
      setRegisteredEvents(future.slice(0, 2));
    }
  };

  const getDaysUntil = (date: string): number => {
    const eventDate = new Date(date + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isRegistered = (eventId: number) => registeredEvents.some(e => e.id === eventId);

 const toggleRegistration = (event: Event) => {
  const registering = !isRegistered(event.id);
  const currentUserId = 1;

    if (registering) {
    db.registerForEvent(currentUserId, event.id); // Update DB
  } else {
    db.unregisterFromEvent(currentUserId, event.id); // Update DB
  }
  let updated;
  if (registering) {
    updated = [...registeredEvents, event];
  } else {
    updated = registeredEvents.filter(e => e.id !== event.id);
  }
  

    setRegisteredEvents(updated);
    localStorage.setItem('demoRegisteredEvents', JSON.stringify(updated.map(e => e.id)));

    const notifs = JSON.parse(localStorage.getItem('demoNotifications') || '[]');
    notifs.push({
      id: Date.now(),
      action: registering ? `Registered: ${event.name}` : `Unregistered: ${event.name}`,
      type: registering ? 'register' : 'unregister',
      read: false,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('demoNotifications', JSON.stringify(notifs));
    
    alert(registering ? `Registered for "${event.name}"!` : `Unregistered from "${event.name}"`);
    refreshUnreadCount();
  };

  const handleNotifyLater = (event: Event, days: number) => {
    const notifs = JSON.parse(localStorage.getItem('demoNotifications') || '[]');
    notifs.push({
      id: Date.now(),
      action: `Reminder set: ${event.name} (${days}d before)`,
      type: 'reminder_set',
      read: false,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('demoNotifications', JSON.stringify(notifs));
    
    alert(`Reminder scheduled for "${event.name}"!`);
    setOpenNotificationDropdown(null);
    refreshUnreadCount();
  };

  return (
    <div className="student-container">
      <div onClick={() => navigate('/notifications')} className="notif-badge-float">
        Notifications {unreadCount > 0 && <span className="unread-dot">{unreadCount}</span>}
      </div>

      <h1>Student Dashboard</h1>

      <section>
        <h2>My Registered Events</h2>
        <div className="events-grid">
          {registeredEvents.map(event => {
            const daysUntil = getDaysUntil(event.date);
            const isOpen = openNotificationDropdown === event.id;
            return (
              <div key={event.id} className="card-base card-registered" style={{ borderColor: daysUntil <= 3 ? '#ff4d4f' : '#1890ff' }}>
                <h3>{event.name}</h3>
                <p>{event.date} ({daysUntil} days left)</p>
                <div className="btn-flex-row">
                  <button onClick={() => toggleRegistration(event)} className="btn-unregister">Unregister</button>
                  <div className="relative-wrapper"  ref={isOpen ? dropdownRef : null}>
                    <button onClick={() => setOpenNotificationDropdown(isOpen ? null : event.id)} className="btn-notify">Notify Later</button>
                    {isOpen && (
                      <div className="custom-dropdown-menu">
                        <div onClick={() => handleNotifyLater(event, 1)} className="dropdown-action-item">1 Day Before</div>
                        <div onClick={() => handleNotifyLater(event, 7)} className="dropdown-action-item">1 Week Before</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginTop: '40px' }}>
        <h2>Available Events</h2>
        <div className="events-grid">
          {allUpcomingEvents.filter(e => !isRegistered(e.id)).map(event => (
            <div key={event.id} className="card-base card-available">
              <h3>{event.name}</h3>
              <p>{event.date}</p>
              <button onClick={() => toggleRegistration(event)} className="btn-register-main">Register</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
