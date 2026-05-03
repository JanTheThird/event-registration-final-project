// pages/admin/AdminPage.tsx
import { useState, useEffect } from 'react';
import { useDB } from '../../utils/localdb/db';
import type { Event, User } from '../../utils/types/Index';

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

interface EventAnalytics {
  totalRegistered: number;
  quota: number;
  isSuccess: boolean;
  status: 'success' | 'failed' | 'upcoming';
}

export default function AdminPage() {
  const db = useDB();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvents, setEditingEvents] = useState<EditingEvent[]>([]);
  const [showAnalytics, setShowAnalytics] = useState<Event | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);

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

  // Event status and analytics
  const getEventStatus = (event: Event): 'upcoming' | 'past' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today ? 'upcoming' : 'past';
  };

  const getEventAnalytics = (event: Event): EventAnalytics => {
    const status = getEventStatus(event);
    
    if (status === 'upcoming') {
      return {
        totalRegistered: 0,
        quota: event.quota,
        isSuccess: false,
        status: 'upcoming'
      };
    }

    // Mock registered count - in real app, you'd get this from registrations
    const totalRegistered = Math.floor(Math.random() * (event.quota + 10));
    
    return {
      totalRegistered,
      quota: event.quota,
      isSuccess: totalRegistered >= event.quota,
      status: totalRegistered >= event.quota ? 'success' : 'failed'
    };
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
          date: event.date,
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
      const eventIndex = db.getEvents().findIndex(e => e.id === eventId);
      if (eventIndex !== -1) {
        db.getEvents().splice(eventIndex, 1);
        db.saveDB();
        refreshEvents();
        cancelEdit(eventId);
      }
    }
  };

  const showEventAnalytics = (event: Event) => {
    const analyticsData = getEventAnalytics(event);
    setAnalytics(analyticsData);
    setShowAnalytics(event);
  };

  const getEditingEvent = (eventId: number): EditingEvent | undefined => {
    return editingEvents.find(e => e.id === eventId);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#333', marginBottom: '30px' }}>Admin Dashboard</h1>
      
      {/* User Management Tables - same as before */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#28a745', marginBottom: '20px' }}>
          Active Users ({activeUsers.length})
        </h2>
        {/* Active users table - unchanged */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          marginBottom: '30px'
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
                        fontSize: '14px'
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
                      fontWeight: 'bold'
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
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer'
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
            const eventStatus = getEventStatus(event);

            return (
              <div key={event.id} style={{
                padding: '25px',
                border: `3px solid ${isEditing ? '#0d6efd' : eventStatus === 'past' ? '#dc3545' : '#28a745'}`,
                borderRadius: '16px',
                background: isEditing 
                  ? '#e3f2fd' 
                  : eventStatus === 'past' 
                    ? '#fdf2f2' 
                    : '#f0fdf4',
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
                      <div style={{ margin: '8px 0 0 0' }}>
                        <span style={{ 
                          padding: '6px 12px',
                          background: eventStatus === 'past' ? '#fee2e2' : '#dcfce7',
                          color: eventStatus === 'past' ? '#dc2626' : '#166534',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}>
                          {eventStatus === 'past' ? '📅 Past Event' : '📅 Upcoming'}
                        </span>
                        <span style={{ 
                          marginLeft: '10px',
                          padding: '6px 12px',
                          background: '#e0e7ff',
                          color: '#1e40af',
                          borderRadius: '20px',
                          fontSize: '14px'
                        }}>
                          {event.quota} spots
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {!isEditing ? (
                      <>
                        <button 
                          onClick={() => showEventAnalytics(event)}
                          style={{
                            padding: '10px 20px',
                            background: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            fontSize: '14px'
                          }}
                        >
                          📊 Analytics
                        </button>
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
                          fontWeight: '500'
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Event Preview (non-editing) */}
                {!isEditing && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '20px', 
                    marginBottom: '20px',
                    padding: '20px',
                    background: 'rgba(255,255,255,0.7)',
                    borderRadius: '12px'
                  }}>
                    <div>
                      <div style={{ fontWeight: '600', color: '#666', marginBottom: '8px' }}>📍 Location</div>
                      <div style={{ fontSize: '18px', color: '#333' }}>{event.location}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: '#666', marginBottom: '8px' }}>📝 Description</div>
                      <div style={{ fontSize: '16px', color: '#555', lineHeight: '1.5' }}>
                        {event.description}
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Form */}
                {isEditing && editingEvent && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitEvent(event.id);
                  }} style={{ display: 'grid', gap: '20px' }}>
                    {/* Form fields - same as before */}
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
                          fontSize: '16px'
                        }}
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
                          resize: 'vertical'
                        }}
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
                          fontSize: '16px'
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

      {/* Analytics Modal */}
      {showAnalytics && analytics && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{
              padding: '30px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, color: '#333', fontSize: '28px' }}>
                📊 {showAnalytics.name} Analytics
              </h2>
              <button
                onClick={() => setShowAnalytics(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                  e.currentTarget.style.color = '#333';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#666';
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '30px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div style={{
                  padding: '20px',
                  background: analytics.status === 'success' ? '#dcfce7' : 
                             analytics.status === 'failed' ? '#fee2e2' : '#fef3c7',
                  borderRadius: '12px',
                  textAlign: 'center',
                  border: `3px solid ${
                    analytics.status === 'success' ? '#22c55e' :
                    analytics.status === 'failed' ? '#ef4444' : '#eab308'
                  }`
                }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#333' }}>
                    {analytics.status === 'success' ? '✅' :
                     analytics.status === 'failed' ? '❌' : '⏳'}
                  </div>
                  <div style={{ fontSize: '16px', color: '#666', marginTop: '8px' }}>
                    {analytics.status === 'upcoming' ? 'Upcoming' :
                     analytics.isSuccess ? 'SUCCESS' : 'FAILED'}
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px',
                  border: '2px solid #3b82f6'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
                    {analytics.totalRegistered}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Total Registered</div>
                </div>

                <div style={{
                  padding: '20px',
                  background: 'rgba(219, 234, 254, 0.5)',
                  borderRadius: '12px',
                  border: '2px solid #3b82f6'
                }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e40af' }}>
                    {analytics.quota}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>Quota Needed</div>
                </div>
              </div>

              <div style={{
                padding: '20px',
                background: '#f8fafc',
                borderRadius: '12px',
                borderLeft: '4px solid #3b82f6'
              }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>Event Details:</h4>
                <p><strong>Date:</strong> {showAnalytics.date}</p>
                <p><strong>Location:</strong> {showAnalytics.location}</p>
                {analytics.status !== 'upcoming' && (
                  <p style={{ 
                    fontSize: '16px', 
                    fontWeight: '500',
                    color: analytics.isSuccess ? '#22c55e' : '#ef4444',
                    marginTop: '15px'
                  }}>
                    {analytics.isSuccess 
                      ? `🎉 SUCCESS! Quota (${analytics.quota}) was met with ${analytics.totalRegistered} registrations!`
                      : `😞 FAILED. Only ${analytics.totalRegistered} registered out of ${analytics.quota} quota needed.`
                    }
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}