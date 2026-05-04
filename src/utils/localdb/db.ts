// utils/database/db.ts
import dbData from './database.json' with { type: 'json' };
import type { Database, User, Event, Notification } from '../types/Index';

let db: Database & { notifications: Notification[] } = { 
  ...(dbData as Database),
  notifications: [] 
};

export const useDB = () => {

  
  const getUsers = (): User[] => db.users.filter(u => u.status === 'active');

  const getAllUsers = (): User[] => db.users;

  const findUser = (id: number): User | undefined =>
    db.users.find(u => u.id === id);

  const toggleUserStatus = (id: number): User | null => {
    const user = findUser(id);
    if (!user) return null;

    user.status = user.status === 'active' ? 'inactive' : 'active';
    user.lastUpdated = new Date().toISOString().split('T')[0];
    saveDB();
    return user;
  };

  const deleteInactiveUser = (id: number): boolean => {
    const user = findUser(id);
    if (!user || user.status === 'active') return false;

    db.users = db.users.filter(u => u.id !== id);
    saveDB();
    return true;
  };

  // ======================
  // EVENTS
  // ======================
  const getEvents = (): Event[] => db.events;

  const findEvent = (id: number): Event | undefined =>
    db.events.find(e => e.id === id);

  const updateEvent = (eventId: number, updates: Partial<Event>): boolean => {
    const eventIndex = db.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return false;

    db.events[eventIndex] = {
      ...db.events[eventIndex],
      ...updates
    };

    saveDB();
    return true;
  };

  const deleteEvent = (eventId: number): boolean => {
    const eventIndex = db.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return false;

    db.events.splice(eventIndex, 1);
    saveDB();
    return true;
  };

  // ======================
  // NOTIFICATIONS
  // ======================
  const getNotifications = (): Notification[] => db.notifications || [];

  const addNotification = (
    notification: Omit<Notification, 'id'>
  ): Notification => {
    const { read, ...rest } = notification;

    const newNotif: Notification = {
      id: Date.now(),
      read: false,
      ...rest,
      timestamp: new Date().toISOString()
    };

    db.notifications = [...(db.notifications || []), newNotif];
    saveDB();

    console.log('🔔 New notification:', newNotif.action);
    return newNotif;
  };

  const markNotificationRead = (notificationId: number): boolean => {
    const notifIndex = db.notifications?.findIndex(n => n.id === notificationId);

    if (notifIndex === -1 || notifIndex === undefined) return false;

    db.notifications![notifIndex].read = true;
    saveDB();
    return true;
  };

  const clearNotifications = (): void => {
    db.notifications = [];
    saveDB();
  };

  const clearReadNotifications = (): void => {
    db.notifications = db.notifications?.filter(n => !n.read) || [];
    saveDB();
  };

  // ======================
  // SAVE
  // ======================
  const saveDB = (): void => {
    console.log('🌍 DB Updated:', {
      activeUsers: db.users.filter(u => u.status === 'active').length,
      totalUsers: db.users.length,
      events: db.events.length,
      notifications: db.notifications?.length || 0
    });
  };

  const addUser = (email: string, role: 'student' | 'admin'): User => {
  const newUser: User = {
    id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
    email,
    role,
    status: 'active',
    lastUpdated: new Date().toISOString().split('T')[0]
  };
  db.users.push(newUser);
  saveDB();
  return newUser;
};

const addEvent = (eventData: Omit<Event, 'id' | 'createdAt'>): Event => {
  const newEvent: Event = {
    id: db.events.length > 0 ? Math.max(...db.events.map(e => e.id)) + 1 : 1,
    ...eventData,
    createdAt: new Date().toISOString().split('T')[0]
  };
  db.events.push(newEvent);
  saveDB();
  return newEvent;
};

  // ======================
  // RETURN ALL METHODS
  // ======================
  return {
    // USERS
    getUsers,
    getAllUsers,
    findUser,
    toggleUserStatus,
    deleteInactiveUser,

    // EVENTS
    getEvents,
    findEvent,
    updateEvent,
    deleteEvent,

    // NOTIFICATIONS
    getNotifications,
    addNotification,
    markNotificationRead,
    clearNotifications,
    clearReadNotifications,
    addUser,
    addEvent,

    // SAVE
    saveDB
  };
};