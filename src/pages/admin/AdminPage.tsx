import { useState, useEffect } from 'react';
import { useDB } from '../../utils/localdb/db';
import type { Event, User } from '../../utils/types/Index';

import AddUserForm from './components/AddUserForm';
import AddEventForm from './components/AddEventForm';
import UserTable from './components/UserTable';
import EventCard from './components/EventCard';
import AnalyticsModal from './components/AnalyticsModal';

interface EventFormData {
  name: string;
  date: string;
  quota: number;
  location: string;
  description: string;
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
  const [showAnalytics, setShowAnalytics] = useState<Event | null>(null);
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);

  useEffect(() => {
    refreshData();
  }, []);

  // ---------------------------
  // DATA REFRESH
  // ---------------------------
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

  // ---------------------------
  // EVENT ANALYTICS
  // ---------------------------
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

  // ---------------------------
  // USER HANDLERS
  // ---------------------------
  const handleAddUser = (email: string, role: 'student' | 'admin') => {
    if (!email) return alert('Email is required');
    db.addUser(email, role);
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

  // ---------------------------
  // EVENT HANDLERS
  // ---------------------------
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
    refreshEvents();
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

  // ---------------------------
  // RENDER
  // ---------------------------
  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Forms */}
      <AddUserForm onAdd={handleAddUser} />
      <hr />
      <AddEventForm onAdd={handleAddEvent} />

      <hr />

      {/* Users */}
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

      {/* Events */}
      <section>
        <h2>Events Management ({events.length})</h2>

        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={() => alert('Edit not yet extracted')}
            onDelete={() => handleDeleteEvent(event.id)}
            onAnalytics={() => showEventAnalytics(event)}
          />
        ))}
      </section>

      {/* Modal */}
      <AnalyticsModal
        event={showAnalytics}
        analytics={analytics}
        onClose={() => setShowAnalytics(null)}
      />
    </div>
  );
}