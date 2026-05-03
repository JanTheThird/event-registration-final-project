import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDB } from '../../utils/localdb/db';
import type { Notification } from '../../utils/types/Index';

export default function NotificationLogPage() {
  const db = useDB();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const notifs = JSON.parse(localStorage.getItem('demoNotifications') || '[]');
    setNotifications(notifs);
  }, []);

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('demoNotifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    if (confirm('Clear all logs?')) {
      setNotifications([]);
      localStorage.setItem('demoNotifications', '[]');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => navigate('/student')} style={{ marginBottom: '20px', cursor: 'pointer' }}>
        ← Back to Dashboard
      </button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Notification Log</h1>
        <div>
          <button onClick={markAllRead} style={{ marginRight: '10px' }}>Mark all read</button>
          <button onClick={clearAll} style={{ color: 'red' }}>Clear All</button>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        {notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          notifications.map(n => (
            <div key={n.id} style={{ 
              padding: '15px', borderBottom: '1px solid #eee', 
              background: n.read ? 'transparent' : '#f0f7ff',
              borderRadius: '8px', marginBottom: '10px'
            }}>
              <strong>{n.action}</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>{new Date(n.timestamp).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
