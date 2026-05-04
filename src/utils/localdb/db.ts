import dbData from './database.json' with { type: 'json' };
import type { Database, User, Event, Notification, Registration } from '../types/Index';

const STORAGE_KEY = 'app_local_db';

const loadDB = (): Database & { notifications: Notification[], registrations: Registration[] } => {
  const seedUsers = (dbData as Database).users;
  const fallbackPasswordsByEmail = new Map(
    seedUsers.map((user) => [user.email.toLowerCase(), user.password])
  );

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved) as Database & { notifications?: Notification[], registrations?: Registration[] };
    return {
      ...parsed,
      users: parsed.users.map((user) => ({
        ...user,
        password: user.password ?? fallbackPasswordsByEmail.get(user.email.toLowerCase()) ?? 'password123',
      })),
      notifications: parsed.notifications ?? [],
      registrations: parsed.registrations ?? [],
    };
  }
  return {
    ...(dbData as Database),
    notifications: [],
    registrations: []
  };
};

let db = loadDB();

export const useDB = () => {
  const saveDB = (): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  };

  // Update event quota based on registrations
  const updateEventQuota = (eventId: number) => {
    const event = db.events.find(e => e.id === eventId);
    if (!event) return;

    const registrationCount = db.registrations.filter(r => r.eventId === eventId).length;
    event.registeredCount = registrationCount; // ✅ Tracks registered users
    saveDB();
  };

  const getUsers = (): User[] => db.users.filter(u => u.status === 'active');
  const getAllUsers = (): User[] => db.users;
  const findUser = (id: number): User | undefined => db.users.find(u => u.id === id);
  const authenticateUser = (email: string, password: string): User | null => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = db.users.find(
      (u) =>
        u.email.toLowerCase() === normalizedEmail &&
        u.password === password &&
        u.status === 'active'
    );
    return user ?? null;
  };

  const addUser = (email: string, password: string, role: 'student' | 'admin'): User => {
    const newUser: User = {
      id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
      email,
      password,
      role,
      status: 'active',
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    db.users.push(newUser);
    saveDB();
    return newUser;
  };

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

  const getEvents = (): Event[] => db.events;
  const findEvent = (id: number): Event | undefined => db.events.find(e => e.id === id);

  const addEvent = (eventData: {
    name: string;
    date: string;
    quota: number;
    location: string;
    description: string;
  }): Event => {
    const newEvent: Event = {
      id: db.events.length > 0 ? Math.max(...db.events.map(e => e.id)) + 1 : 1,
      name: eventData.name,
      date: eventData.date,
      quota: eventData.quota,
      location: eventData.location,
      description: eventData.description,
      registeredCount: 0, // ✅ Start with 0 registered
      createdAt: new Date().toISOString().split('T')[0]
    };
    db.events.push(newEvent);
    saveDB();
    return newEvent;
  };

  const updateEvent = (eventId: number, updates: any): boolean => {
    const eventIndex = db.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return false;
    
    db.events[eventIndex] = { 
      ...db.events[eventIndex], 
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    saveDB();
    return true;
  };

  const deleteEvent = (eventId: number): boolean => {
    db.events = db.events.filter(e => e.id !== eventId);
    db.registrations = db.registrations.filter(r => r.eventId !== eventId);
    saveDB();
    return true;
  };

  const getNotifications = (): Notification[] => db.notifications || [];
  
  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ): Notification => {
    const newNotif: Notification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    };
    db.notifications.push(newNotif);
    saveDB();
    return newNotif;
  };

  const markNotificationRead = (id: number): boolean => {
    const notif = db.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.read = true;
    saveDB();
    return true;
  };

  const clearNotifications = () => { 
    db.notifications = []; 
    saveDB(); 
  };

  const getUserRegistrations = (userId: number): number[] => {
    return db.registrations
      .filter(r => r.userId === userId)
      .map(r => r.eventId);
  };

  const registerForEvent = (userId: number, eventId: number): boolean => {
    const alreadyRegistered = db.registrations.some(
      r => r.userId === userId && r.eventId === eventId
    );
    if (alreadyRegistered) return false;

    db.registrations.push({
      id: Date.now(),
      userId,
      eventId
    });
    
    updateEventQuota(eventId); // ✅ Auto-update event quota
    saveDB();
    return true;
  };

  const unregisterFromEvent = (userId: number, eventId: number): boolean => {
    const wasRegistered = db.registrations.some(
      r => r.userId === userId && r.eventId === eventId
    );
    
    if (!wasRegistered) return false;

    db.registrations = db.registrations.filter(
      r => !(r.userId === userId && r.eventId === eventId)
    );
    
    updateEventQuota(eventId); // ✅ Auto-update event quota
    saveDB();
    return true;
  };

  const getRegistrationCount = (eventId: number): number => {
    const event = db.events.find(e => e.id === eventId);
    return event?.registeredCount || 0; // ✅ Use cached count
  };

  return {
    getUsers,
    getAllUsers,
    findUser,
    authenticateUser,
    addUser,
    toggleUserStatus,
    deleteInactiveUser,
    getEvents,
    findEvent,
    addEvent,
    updateEvent,
    deleteEvent,
    getNotifications,
    addNotification,
    markNotificationRead,
    clearNotifications,
    getUserRegistrations,
    registerForEvent,
    unregisterFromEvent,
    getRegistrationCount,
    saveDB
  };
};