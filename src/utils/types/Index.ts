export interface User {
  id: number;
  email: string;
  role: 'student' | 'admin';
  status: 'active' | 'inactive';
  lastUpdated: string;
}

export interface Event {
  id: number;
  name: string;
  date: string;
  location: string;
  description: string;
  quota: number;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  type: 'register' | 'unregister' | 'reminder_set';
  eventId: number;
  eventName: string;
  action: string;
  timestamp: string;
  read: boolean;
}

export interface Database {
  users: User[];
  events: Event[];
}

