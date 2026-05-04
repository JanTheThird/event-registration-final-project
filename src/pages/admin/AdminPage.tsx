import { useState, useEffect } from 'react';
import { Button, Container, Stack } from 'react-bootstrap';
import { useDB } from '../../utils/localdb/db';
import { useAuth } from '../../utils/context/AuthContext';
import type { Event, User } from '../../utils/types/Index';

import AddUserForm from './components/AddUserForm';
import AddEventForm from './components/AddEventForm';
import UserTable from './components/UserTable';
import EventCard from './components/EventCard';
import AnalyticsModal from './components/AnalyticsModal';

interface EventAnalytics {
  totalRegistered: number;
  quota: number;
  isSuccess: boolean;
  status: 'success' | 'failed' | 'upcoming';
}

export default function AdminPage() {
  const db = useDB();
  const { logout } = useAuth();

  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [inactiveUsers, setInactiveUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [showAnalytics, setShowAnalytics] = useState<Event | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

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
    const totalRegistered = db.getRegistrationCount(event.id);
    return {
      totalRegistered,
      quota: event.quota,
      isSuccess: totalRegistered >= event.quota,
      status: totalRegistered >= event.quota ? 'success' : 'failed'
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

  const validateForm = (formData: any): string[] => {
    const errors: string[] = [];
    if (!formData.name.trim()) errors.push('Name required');
    if (!formData.date) errors.push('Date required');
    if (formData.quota < 0) errors.push('Quota must be >= 0');
    if (!formData.location.trim()) errors.push('Location required');
    if (!formData.description.trim()) errors.push('Description required');
    return errors;
  };

  const handleAddEvent = (data: any) => {
    const errors = validateForm(data);
    if (errors.length) return alert(errors.join('\n'));
    db.addEvent(data);
    setEditingEvent(null);
    refreshEvents();
  };

  const handleUpdateEvent = (data: any) => {
    const errors = validateForm(data);
    if (errors.length) return alert(errors.join('\n'));
    if (!data.id) return alert('Event ID missing');
    db.updateEvent(data.id, data);
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
    <Container className="py-4">
      <Stack
        direction="horizontal"
        className="justify-content-between align-items-center flex-wrap gap-3 mb-4"
      >
        <h1 className="h3 mb-0">Admin dashboard</h1>
        <Button variant="outline-danger" size="sm" onClick={logout}>
          Log out
        </Button>
      </Stack>

      <AddEventForm 
        onAdd={handleAddEvent}
        editingEvent={editingEvent}
        onUpdate={handleUpdateEvent}
        onCancel={handleCancelEdit}
      />
      <hr />

      <AddUserForm onAdd={handleAddUser} />
      <hr />

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

      <hr />

      <section>
        <h2>Events Management ({events.length})</h2>
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={() => handleEditEvent(event)}
            onDelete={() => handleDeleteEvent(event.id)}
            onAnalytics={() => showEventAnalytics(event)}
          />
        ))}
      </section>

      <AnalyticsModal
        event={showAnalytics}
        analytics={analytics}
        onClose={() => setShowAnalytics(null)}
      />
    </Container>
  );
}