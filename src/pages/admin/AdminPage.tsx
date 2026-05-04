import { useState, useEffect, useCallback } from 'react';
import { Container, Nav, Tab } from 'react-bootstrap';
import { useDB } from '../../utils/localdb/db';
import type { Event, User } from '../../utils/types/Index';

import AddUserForm from './components/AddUserForm';
import AddEventForm, { type EventFormData } from './components/AddEventForm';
import UserTable from './components/UserTable';
import EventCard from './components/EventCard';
import AnalyticsModal, { type EventAnalytics } from './components/AnalyticsModal';
import AdminNavbar from './components/AdminNavbar';

export default function AdminPage() {
  const db = useDB();

  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showAnalytics, setShowAnalytics] = useState<Event | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [adminSection, setAdminSection] = useState<'users' | 'events'>('events');

  const loadLists = useCallback(() => {
    setActiveUsers(db.getUsers());
    setInactiveUsers(db.getAllUsers().filter((u) => u.status === 'inactive'));
    setEvents(db.getEvents());
  }, [db]);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const refreshUsers = () => {
    setActiveUsers(db.getUsers());
    setInactiveUsers(db.getAllUsers().filter(u => u.status === 'inactive'));
  };

  const refreshEvents = () => {
    setEvents(db.getEvents());
  };

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
        status: 'upcoming' as const,
      };
    }
    const totalRegistered = db.getRegistrationCount(event.id);
    return {
      totalRegistered,
      quota: event.quota,
      status: totalRegistered >= event.quota ? ('success' as const) : ('failed' as const),
    };
  };

  const handleAddUser = (email: string, password: string, role: 'student' | 'admin') => {
    if (!email) return alert('Email is required');
    if (!password) return alert('Password is required');
    db.addUser(email, password, role);
    refreshUsers();
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

  const validateForm = (formData: EventFormData): string[] => {
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push('Name required');
    if (!formData.date) errors.push('Date required');
    if (formData.quota < 0) errors.push('Quota must be >= 0');
    if (!formData.location.trim()) errors.push('Location required');
    if (!formData.description.trim()) errors.push('Description required');
    return errors;
  };

  const handleAddEvent = (data: EventFormData) => {
    const errors = validateForm(data);
    if (errors.length) return alert(errors.join('\n'));
    db.addEvent(data);
    setEditingEvent(null);
    refreshEvents();
  };

  const handleUpdateEvent = (data: EventFormData) => {
    const errors = validateForm(data);
    if (errors.length) return alert(errors.join('\n'));
    if (!data.id) return alert('Event ID missing');
    const { id, ...rest } = data;
    db.updateEvent(id, rest);
    setEditingEvent(null);
    refreshEvents();
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm('Delete this event?')) {
      db.deleteEvent(eventId);
      refreshEvents();
    }
  };

  const showEventAnalytics = (event: Event) => {
    setAnalytics(getEventAnalytics(event));
    setShowAnalytics(event);
  };

  return (
    <>
      <AdminNavbar />
      <Container className="py-4">
        <h1 className="h3 mb-3">Admin dashboard</h1>

        <Tab.Container
          activeKey={adminSection}
          onSelect={(k) => {
            if (k === 'users' || k === 'events') setAdminSection(k);
          }}
        >
          <Nav variant="pills" className="mb-4 flex-wrap gap-2" role="tablist">
            <Nav.Item>
              <Nav.Link eventKey="users" role="tab">
                Users
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="events" role="tab">
                Events
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="users" className="pt-1" mountOnEnter unmountOnExit={false}>
              <AddUserForm onAdd={handleAddUser} />
              <hr className="my-4" />

              <UserTable
                title="Active Users"
                users={activeUsers}
                onToggle={handleToggleStatus}
              />

              <UserTable
                title="Inactive Users"
                users={inactiveUsers}
                onToggle={handleToggleStatus}
                onDelete={handleDeleteUser}
                showDelete
              />
            </Tab.Pane>

            <Tab.Pane eventKey="events" className="pt-1" mountOnEnter unmountOnExit={false}>
              <AddEventForm 
                onAdd={handleAddEvent}
                editingEvent={editingEvent}
                onUpdate={handleUpdateEvent}
                onCancel={handleCancelEdit}
              />
              <hr className="my-4" />

              <section>
                <h2 className="h4 mb-3">Events ({events.length})</h2>
                {events.length === 0 ? (
                  <p className="text-muted">No events yet. Add one above.</p>
                ) : (
                  events.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEdit={() => handleEditEvent(event)}
                      onDelete={() => handleDeleteEvent(event.id)}
                      onAnalytics={() => showEventAnalytics(event)}
                    />
                  ))
                )}
              </section>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        <AnalyticsModal
          event={showAnalytics}
          analytics={analytics}
          onClose={() => setShowAnalytics(null)}
        />
      </Container>
    </>
  );
}