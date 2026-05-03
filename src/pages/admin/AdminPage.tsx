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
    <div>
      <h1>Admin Dashboard</h1>
      
      {/* User Management Tables */}
      <div>
        <h2>
          Active Users ({activeUsers.length})
        </h2>
        <div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>
                    <span>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span>
                      ACTIVE
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleStatus(user.id)}
                    >
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2>
          Inactive Users ({inactiveUsers.length})
        </h2>
        <div>
          <table>
            <thead>
              <tr>
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
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>
                    <span>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span>
                      INACTIVE
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleStatus(user.id)}
                    >
                      Re-activate
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                  <td>
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
        <h2>Events Management ({events.length})</h2>
        <div>
          {events.map((event) => {
            const editingEvent = getEditingEvent(event.id);
            const isEditing = editingEvent?.editing;
            const eventStatus = getEventStatus(event);

            return (
              <div key={event.id}>
                {/* Event Header */}
                <div>
                  <div>
                    <h3>
                      {isEditing ? 'Editing: ' : ''}{event.name}
                    </h3>
                    {!isEditing && (
                      <div>
                        <span>
                          {eventStatus === 'past' ? 'Past Event' : 'Upcoming'}
                        </span>
                        <span>
                          {event.quota} spots
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    {!isEditing ? (
                      <>
                        <button 
                          onClick={() => showEventAnalytics(event)}
                        >
                          Analytics
                        </button>
                        <button 
                          onClick={() => startEdit(event)}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => cancelEdit(event.id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Event Preview (non-editing) */}
                {!isEditing && (
                  <div>
                    <div>
                      Location
                    </div>
                    <div>
                      {event.location}
                    </div>
                    <div>
                      Description
                    </div>
                    <div>
                      {event.description}
                    </div>
                  </div>
                )}

                {/* Edit Form */}
                {isEditing && editingEvent && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitEvent(event.id);
                  }}>
                    <div>
                      <label>
                        Event Name *
                      </label>
                      <input 
                        value={editingEvent.formData.name}
                        onChange={(e) => updateFormData(event.id, 'name', e.target.value)}
                      />
                    </div>

                    <div>
                      <div>
                        <label>
                          Date *
                        </label>
                        <input 
                          type="date"
                          value={editingEvent.formData.date}
                          onChange={(e) => updateFormData(event.id, 'date', e.target.value)}
                        />
                      </div>
                      <div>
                        <label>
                          Quota *
                        </label>
                        <input 
                          type="number"
                          min="0"
                          value={editingEvent.formData.quota}
                          onChange={(e) => updateFormData(event.id, 'quota', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div>
                      <label>
                        Location *
                      </label>
                      <input 
                        value={editingEvent.formData.location}
                        onChange={(e) => updateFormData(event.id, 'location', e.target.value)}
                      />
                    </div>

                    <div>
                      <label>
                        Description *
                      </label>
                      <textarea 
                        value={editingEvent.formData.description}
                        onChange={(e) => updateFormData(event.id, 'description', e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div>
                      <button 
                        type="button"
                        onClick={() => cancelEdit(event.id)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                      >
                        Save Changes
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
        <div>
          <div>
            <div>
              <h2>
                {showAnalytics.name} Analytics
              </h2>
              <button
                onClick={() => setShowAnalytics(null)}
              >
                ×
              </button>
            </div>

            <div>
              <div>
                <div>
                  <div>
                    {analytics.status === 'success' ? 'Yes' :
                     analytics.status === 'failed' ? 'No' : 'Pending'}
                  </div>
                  <div>
                    {analytics.status === 'upcoming' ? 'Upcoming' :
                     analytics.isSuccess ? 'SUCCESS' : 'FAILED'}
                  </div>
                </div>

                <div>
                  <div>
                    {analytics.totalRegistered}
                  </div>
                  <div>Total Registered</div>
                </div>

                <div>
                  <div>
                    {analytics.quota}
                  </div>
                  <div>Quota Needed</div>
                </div>
              </div>

              <div>
                <h4>Event Details:</h4>
                <p><strong>Date:</strong> {showAnalytics.date}</p>
                <p><strong>Location:</strong> {showAnalytics.location}</p>
                {analytics.status !== 'upcoming' && (
                  <p>
                    {analytics.isSuccess 
                      ? `SUCCESS! Quota (${analytics.quota}) was met with ${analytics.totalRegistered} registrations!`
                      : `FAILED. Only ${analytics.totalRegistered} registered out of ${analytics.quota} quota needed.`
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