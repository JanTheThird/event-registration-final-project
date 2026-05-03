// pages/admin/AdminPage.tsx
import { useState, useEffect } from 'react';
import { useDB } from '../../utils/localdb/db';
import type { User, Event } from '../../utils/types/Index';

interface EventFormData {
  name: string;
  date: string;
  quota: number;
  location: string;
  description: string;
}

interface EditingEvent {
  id: number;
  editing: boolean;
  formData: EventFormData;
}

export default function AdminPage() {
  const db = useDB();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvents, setEditingEvents] = useState<EditingEvent[]>([]);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setActiveUsers(db.getUsers());
    setInactiveUsers(db.getAllUsers().filter(u => u.status === 'inactive'));
    setEvents(db.getEvents());
  };

  const refreshUsers = () => {
    setActiveUsers(db.getUsers());
    setInactiveUsers(db.getAllUsers().filter(u => u.status === 'inactive'));
  };

  const refreshEvents = () => {
    setEvents(db.getEvents());
  };

  const handleToggleStatus = (id: number) => {
    db.toggleUserStatus(id);
    refreshUsers();
  };

  const handleDeleteUser = (id: number) => {
    if (confirm('Delete this inactive user?')) {
      db.deleteInactiveUser(id);
      refreshUsers();
    }
  };

  const startEdit = (event: Event) => {
    setEditingEvents(prev => {
      const existing = prev.find(e => e.id === event.id);
      if (existing) {
        return prev.map(e => 
          e.id === event.id 
            ? { ...e, editing: true }
            : e
        );
      }
      return [...prev, {
        id: event.id,
        editing: true,
        formData: {
          name: event.name,
          date: event.date, // Your dates are already in YYYY-MM-DD format
          quota: event.quota,
          location: event.location,
          description: event.description,
        }
      }];
    });
  };

  const cancelEdit = (eventId: number) => {
    setEditingEvents(prev => 
      prev.filter(e => e.id !== eventId)
    );
  };

  const validateForm = (formData: EventFormData): string[] => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push('Name required');
    if (!formData.date) errors.push('Date required');
    if (isNaN(formData.quota) || formData.quota < 0) errors.push('Quota must be 0 or greater');
    if (!formData.location.trim()) errors.push('Location required');
    if (!formData.description.trim()) errors.push('Description required');
    
    return errors;
  };

  const handleSubmitEvent = (eventId: number) => {
    const editingEvent = editingEvents.find(e => e.id === eventId);
    if (!editingEvent) return;

    const errors = validateForm(editingEvent.formData);
    if (errors.length > 0) {
      alert('Please fix the following errors:\n• ' + errors.join('\n• '));
      return;
    }

    // Update the event in the DB
    const eventIndex = db.getEvents().findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      db.getEvents()[eventIndex] = {
        ...db.getEvents()[eventIndex],
        name: editingEvent.formData.name,
        date: editingEvent.formData.date,
        quota: editingEvent.formData.quota,
        location: editingEvent.formData.location,
        description: editingEvent.formData.description,
      };
      db.saveDB();
    }

    cancelEdit(eventId);
    refreshEvents();
  };

  const updateFormData = (eventId: number, field: keyof EventFormData, value: string | number) => {
    setEditingEvents(prev =>
      prev.map(e =>
        e.id === eventId
          ? { ...e, formData: { ...e.formData, [field]: value } }
          : e
      )
    );
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm('Delete this event?')) {
      // Remove from DB
      const eventIndex = db.getEvents().findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        db.getEvents().splice(eventIndex, 1);
        db.saveDB();
        refreshEvents();
        cancelEdit(eventId);
      }
    }
  };

  const getEditingEvent = (eventId: number): EditingEvent | undefined => {
    return editingEvents.find(e => e.id === eventId);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Admin Dashboard</h1>
      
      {/* Active Users */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#28a745', marginBottom: '20px' }}>
          Active Users ({activeUsers.length})
        </h2>
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#d4edda' }}>
                <th style={{ padding: '15px 12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '15px 12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '15px 12px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '15px 12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '15px 12px', textAlign: 'left' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{user.id}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      color: user.role === 'admin' ? '#fd7e14' : '#0d6efd',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                      ACTIVE
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleToggleStatus(user.id)}
                      style={{ 
                        background: '#dc3545', 
                        color: 'white', 
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
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
      </div>

      {/* Inactive Users */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>
          Inactive Users ({inactiveUsers.length})
        </h2>
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8d7da' }}>
                <th style={{ padding: '15px 12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '15px 12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '15px 12px', textAlign: 'left' }}>Role</th>
                <th style={{ padding: '15px 12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '15px 12px', textAlign: 'left' }}>Actions</th>
                <th style={{ padding: '15px 12px', textAlign: 'left' }}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {inactiveUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{user.id}</td>
                  <td style={{ padding: '12px' }}>{user.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      color: user.role === 'admin' ? '#fd7e14' : '#0d6efd',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
                      INACTIVE
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleToggleStatus(user.id)}
                      style={{ 
                        background: '#28a745', 
                        color: 'white', 
                        border: 'none',
                        padding: '8px 12px',
                        marginRight: '8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
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
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                    {user.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Events */}
      <section>
        <h2 style={{ color: '#0d6efd', marginBottom: '20px' }}>Events Management ({events.length})</h2>
        <div style={{ display: 'grid', gap: '25px' }}>
          {events.map((event) => {
            const editingEvent = getEditingEvent(event.id);
            const isEditing = editingEvent?.editing;

            return (
              <div key={event.id} style={{
                padding: '25px',
                border: `2px solid ${isEditing ? '#0d6efd' : '#e0e0e0'}`,
                borderRadius: '16px',
                background: isEditing ? '#e3f2fd' : 'white',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                {/* Event Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: isEditing ? '24px' : '28px', 
                      color: isEditing ? '#0d6efd' : '#333',
                      fontWeight: isEditing ? '600' : '700'
                    }}>
                      {isEditing ? 'Editing: ' : ''}{event.name}
                    </h3>
                    {!isEditing && (
                      <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '16px' }}>
                        {event.location} • {event.date} • {event.quota} spots
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {!isEditing ? (
                      <>
                        <button 
                          onClick={() => startEdit(event)}
                          style={{
                            padding: '10px 20px',
                            background: '#0d6efd',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px'
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                          style={{
                            padding: '10px 20px',
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => cancelEdit(event.id)}
                        style={{
                          padding: '10px 20px',
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '14px'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit Form */}
                {isEditing && editingEvent && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitEvent(event.id);
                  }} style={{ display: 'grid', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                        Event Name *
                      </label>
                      <input 
                        value={editingEvent.formData.name}
                        onChange={(e) => updateFormData(event.id, 'name', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '14px', 
                          borderRadius: '8px', 
                          border: '2px solid #e0e0e0',
                          fontSize: '16px',
                          transition: 'border-color 0.2s'
                        }}
                        placeholder="Enter event name"
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                          Date *
                        </label>
                        <input 
                          type="date"
                          value={editingEvent.formData.date}
                          onChange={(e) => updateFormData(event.id, 'date', e.target.value)}
                          style={{ 
                            width: '100%', 
                            padding: '14px', 
                            borderRadius: '8px', 
                            border: '2px solid #e0e0e0',
                            fontSize: '16px'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                          Quota *
                        </label>
                        <input 
                          type="number"
                          min="0"
                          value={editingEvent.formData.quota}
                          onChange={(e) => updateFormData(event.id, 'quota', parseInt(e.target.value) || 0)}
                          style={{ 
                            width: '100%', 
                            padding: '14px', 
                            borderRadius: '8px', 
                            border: '2px solid #e0e0e0',
                            fontSize: '16px'
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                        Location *
                      </label>
                      <input 
                        value={editingEvent.formData.location}
                        onChange={(e) => updateFormData(event.id, 'location', e.target.value)}
                        style={{ 
                          width: '100%', 
                          padding: '14px', 
                          borderRadius: '8px', 
                          border: '2px solid #e0e0e0',
                          fontSize: '16px'
                        }}
                        placeholder="Enter location"
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                        Description *
                      </label>
                      <textarea 
                        value={editingEvent.formData.description}
                        onChange={(e) => updateFormData(event.id, 'description', e.target.value)}
                        rows={4}
                        style={{ 
                          width: '100%', 
                          padding: '14px', 
                          borderRadius: '8px', 
                          border: '2px solid #e0e0e0',
                          fontSize: '16px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                        placeholder="Enter event description"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button"
                        onClick={() => cancelEdit(event.id)}
                        style={{
                          padding: '14px 28px',
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: '500'
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        style={{
                          padding: '14px 28px',
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '16px',
                          fontWeight: '600'
                        }}
                      >
                        💾 Save Changes
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}