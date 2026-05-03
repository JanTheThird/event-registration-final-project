// pages/student/StudentPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed from next/router
import { useDB } from '../../utils/localdb/db';
import type { Event } from '../../utils/types/Index';

export default function StudentPage() {
  const db = useDB();
  const navigate = useNavigate(); // Hook for navigation
  const [allUpcomingEvents, setAllUpcomingEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [today] = useState(new Date().toISOString().split('T')[0]);
  const [openNotificationDropdown, setOpenNotificationDropdown] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync unread notifications count from localStorage
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
    let updated;
    const registering = !isRegistered(event.id);

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
      action: registering ? `✅ Registered: ${event.name}` : `❌ Unregistered: ${event.name}`,
      type: registering ? 'register' : 'unregister',
      read: false,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('demoNotifications', JSON.stringify(notifs));
    
    alert(registering ? `🎉 Registered for "${event.name}"!` : `✅ Unregistered from "${event.name}"`);
    refreshUnreadCount();
  };

  const handleNotifyLater = (event: Event, days: number) => {
    const notifs = JSON.parse(localStorage.getItem('demoNotifications') || '[]');
    notifs.push({
      id: Date.now(),
      action: `⏰ Reminder set: ${event.name} (${days}d before)`,
      type: 'reminder_set',
      read: false,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('demoNotifications', JSON.stringify(notifs));
    
    alert(`⏰ Reminder scheduled for "${event.name}"!`);
    setOpenNotificationDropdown(null);
    refreshUnreadCount();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      {/* Floating Notification Badge */}
      <div 
        onClick={() => navigate('/notifications')}
        style={{
          position: 'fixed', top: '20px', right: '20px', cursor: 'pointer',
          background: '#007bff', color: 'white', padding: '10px 20px', borderRadius: '30px',
          fontWeight: 'bold', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 1000
        }}
      >
        🔔 Notifications {unreadCount > 0 && <span style={{ background: 'red', borderRadius: '50%', padding: '2px 8px', marginLeft: '5px' }}>{unreadCount}</span>}
      </div>

      <h1>Student Dashboard</h1>

      <section>
        <h2>My Registered Events</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {registeredEvents.map(event => {
            const daysUntil = getDaysUntil(event.date);
            const isOpen = openNotificationDropdown === event.id;
            return (
              <div key={event.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '12px', background: '#f8f9fa' }}>
                <h3>{event.name}</h3>
                <p>📅 {event.date} ({daysUntil} days left)</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => toggleRegistration(event)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>Unregister</button>
                  <div style={{ position: 'relative' }} ref={isOpen ? dropdownRef : null}>
                    <button onClick={() => setOpenNotificationDropdown(isOpen ? null : event.id)} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>⏰ Notify Later</button>
                    {isOpen && (
                      <div style={{ position: 'absolute', top: '100%', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 10, width: '150px' }}>
                        <div onClick={() => handleNotifyLater(event, 1)} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>1 Day Before</div>
                        <div onClick={() => handleNotifyLater(event, 7)} style={{ padding: '10px', cursor: 'pointer' }}>1 Week Before</div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {allUpcomingEvents.filter(e => !isRegistered(e.id)).map(event => (
            <div key={event.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '12px' }}>
              <h3>{event.name}</h3>
              <p>📅 {event.date}</p>
              <button onClick={() => toggleRegistration(event)} style={{ background: '#28a745', color: 'white', border: 'none', width: '100%', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Register</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
