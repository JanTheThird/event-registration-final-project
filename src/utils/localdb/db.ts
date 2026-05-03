// utils/database/db.ts
import dbData from './database.json' with { type: 'json' };
import type { Database, User, Event } from '../types/Index';

let db: Database = { ...dbData as Database };

export const useDB = () => {
  // USERS - STATUS + DELETE ONLY
  const getUsers = (): User[] => db.users.filter(u => u.status === 'active');
  const getAllUsers = (): User[] => db.users; // Includes inactive
  const findUser = (id: number): User | undefined => 
    db.users.find(u => u.id === id);

  // Toggle Status (Active ↔ Inactive)
  const toggleUserStatus = (id: number): User | null => {
    const user = findUser(id);
    if (!user) return null;
    
    user.status = user.status === 'active' ? 'inactive' : 'active';
    user.lastUpdated = new Date().toISOString().split('T')[0];
    saveDB();
    return user;
  };

  // Delete User (Only inactive users)
  const deleteInactiveUser = (id: number): boolean => {
    const user = findUser(id);
    if (!user || user.status === 'active') return false;
    
    db.users = db.users.filter(u => u.id !== id);
    saveDB();
    return true;
  };

  // EVENTS
  const getEvents = (): Event[] => db.events;
  const findEvent = (id: number): Event | undefined => 
    db.events.find(e => e.id === id);

  const saveDB = (): void => {
    console.log('🌍 DB Updated:', { 
      activeUsers: db.users.filter(u => u.status === 'active').length,
      totalUsers: db.users.length,
      events: db.events.length 
    });
  };

  return {
    getUsers,        // Active users only
    getAllUsers,     // All users (active + inactive)
    findUser,
    toggleUserStatus,
    deleteInactiveUser,
    getEvents,
    findEvent,
    saveDB
  };
};