// pages/admin/AdminPage.tsx
import { useState, useEffect } from 'react';
import { useDB } from '../../utils/localdb/db';
import type { User, Event } from '../../utils/types/Index';

export default function AdminPage() {
  const db = useDB();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    setActiveUsers(db.getUsers());
    setInactiveUsers(db.getAllUsers().filter(u => u.status === 'inactive'));
    setEvents(db.getEvents());
  }, []);

  const handleToggleStatus = (id: number) => {
    db.toggleUserStatus(id);
    // Refresh both lists
    setActiveUsers(db.getUsers());
    setInactiveUsers(db.getAllUsers().filter(u => u.status === 'inactive'));
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('Delete this inactive user?')) {
      db.deleteInactiveUser(id);
      setInactiveUsers(db.getAllUsers().filter(u => u.status === 'inactive'));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px' }}>
      <h1>Admin Dashboard</h1>
      
      {/* Active Users */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Active Users ({activeUsers.length})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
          <thead>
            <tr style={{ background: '#d4edda' }}>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>
                  <span style={{ 
                    color: user.role === 'admin' ? 'orange' : 'blue',
                    fontWeight: 'bold'
                  }}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span style={{ color: 'green', fontWeight: 'bold' }}>
                    ACTIVE
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleToggleStatus(user.id)}
                    style={{ 
                      background: '#dc3545', 
                      color: 'white', 
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inactive Users */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Inactive Users ({inactiveUsers.length})</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8d7da' }}>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {inactiveUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>
                  <span style={{ 
                    color: user.role === 'admin' ? 'orange' : 'blue',
                    fontWeight: 'bold'
                  }}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span style={{ color: 'red', fontWeight: 'bold' }}>
                    INACTIVE
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleToggleStatus(user.id)}
                    style={{ 
                      background: '#28a745', 
                      color: 'white', 
                      border: 'none',
                      padding: '6px 12px',
                      marginRight: '5px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Re-activate
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    style={{ 
                      background: '#6c757d', 
                      color: 'white', 
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </td>
                <td>{user.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Events */}
      <div>
        <h2>Events ({events.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {events.map((event) => (
            <div key={event.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              borderRadius: '8px' 
            }}>
              <h3>{event.name}</h3>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Location:</strong> {event.location}</p>
              <p><strong>Quota:</strong> {event.quota}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}