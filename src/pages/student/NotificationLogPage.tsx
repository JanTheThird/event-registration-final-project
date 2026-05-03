// pages/notifications/NotificationLogPage.tsx
import React, { useState, useEffect } from 'react';
import { useDB } from '../../utils/localdb/db';
import type { Notification } from '../../utils/types/Index';

export default function NotificationLogPage() {
  const db = useDB();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'register' | 'unregister' | 'reminder_set'>('all');

  useEffect(() => {
    const notifs = db.getNotifications();
    setNotifications(notifs);
  }, []);

  // FIXED: Use DB methods instead of direct mutation
  const clearAll = () => {
    if (confirm('Clear all notifications?')) {
      db.clearNotifications?.(); // Use DB method
      setNotifications([]);
    }
  };

  const clearRead = () => {
    if (confirm('Clear all read notifications?')) {
      db.clearReadNotifications?.(); // Use DB method
      setNotifications(prev => prev.filter(n => !n.read));
    }
  };

  const markAllRead = () => {
    notifications.forEach(notif => {
      if (!notif.read) {
        db.markNotificationRead(notif.id); // Use DB method
      }
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(notif => 
    filter === 'all' || notif.type === filter
  );

  const getTypeColor = (type: Notification['type']): string => { // Fixed type
    switch (type) {
      case 'register': return '#28a745';
      case 'unregister': return '#dc3545';
      case 'reminder_set': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#333', margin: 0, display: 'inline-block' }}>📋 Notification Log</h1>
          <span style={{ 
            background: '#e3f2fd', 
            color: '#1976d2', 
            padding: '4px 12px', 
            borderRadius: '20px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            marginLeft: '15px'
          }}>
            {notifications.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={markAllRead} 
            style={{ 
              padding: '8px 16px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Mark All Read
          </button>
          <button 
            onClick={clearRead} 
            style={{ 
              padding: '8px 16px', 
              background: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Clear Read
          </button>
          <button 
            onClick={clearAll} 
            style={{ 
              padding: '8px 16px', 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Filter buttons - FIXED filter type */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {(['all', 'register', 'unregister', 'reminder_set'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            style={{
              padding: '10px 20px',
              background: filter === type ? '#007bff' : '#f8f9fa',
              color: filter === type ? 'white' : '#333',
              border: `2px solid ${filter === type ? '#007bff' : '#dee2e6'}`,
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: filter === type ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {type === 'all' ? `All (${notifications.length})` : 
             type === 'register' ? `Registrations (${notifications.filter(n => n.type === 'register').length})` : 
             type === 'unregister' ? `Unregistrations (${notifications.filter(n => n.type === 'unregister').length})` : 
             `Reminders (${notifications.filter(n => n.type === 'reminder_set').length})`}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div style={{ 
        maxHeight: '70vh', 
        overflowY: 'auto',
        background: '#f8f9fa',
        borderRadius: '16px',
        padding: '20px',
        border: '2px solid #e9ecef',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
      }}>
        {filteredNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📭</div>
            <h3 style={{ marginBottom: '10px' }}>No notifications yet</h3>
            <p style={{ fontSize: '18px', margin: 0 }}>
              Register for events or set reminders to see activity here!
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                display: 'flex',
                gap: '20px',
                padding: '20px',
                marginBottom: '15px',
                background: 'white',
                borderRadius: '12px',
                borderLeft: `5px solid ${getTypeColor(notif.type)}`,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                opacity: notif.read ? 0.7 : 1,
                transform: notif.read ? 'translateX(0)' : 'translateX(0)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                if (!notif.read) {
                  db.markNotificationRead(notif.id);
                  setNotifications(prev => 
                    prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                  );
                }
              }}
            >
              <div style={{ 
                minWidth: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: getTypeColor(notif.type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {notif.type === 'register' ? '✅' :
                 notif.type === 'unregister' ? '❌' :
                 '⏰'}
              </div>
              <div style={{ flex: 1, cursor: notif.read ? 'default' : 'pointer' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#333',
                  marginBottom: '5px',
                  lineHeight: '1.4'
                }}>
                  {notif.action}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Event ID: <strong>{notif.eventId}</strong> • 
                  <span style={{ fontFamily: 'monospace' }}>{formatTime(notif.timestamp)}</span>
                </div>
              </div>
              {!notif.read && (
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: '#28a745',
                  borderRadius: '50%',
                  alignSelf: 'flex-start',
                  boxShadow: '0 0 0 2px white'
                }} />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer stats */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        background: 'white', 
        borderRadius: '12px', 
        textAlign: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ color: '#666', fontSize: '14px' }}>
          Total: {notifications.length} | 
          Unread: {notifications.filter(n => !n.read).length} | 
          <span style={{ color: '#28a745', marginLeft: '10px', fontWeight: '500' }}>
            {filteredNotifications.length} shown
          </span>
        </div>
      </div>
    </div>
  );
}