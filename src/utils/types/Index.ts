export interface User {
  id: number;
  email: string;
  password: string;
  role: 'student' | 'admin';
  status: 'active' | 'inactive';
  lastUpdated: string;
}

export interface Event {
  id: number;
  name: string;
  date: string;
  quota: number;
  location: string;
  description: string;
  registeredCount?: number;
  createdAt: string;
  lastUpdated?: string;
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

export interface Registration {
  id: number;
  userId: number;
  eventId: number;
}

export interface Database {
  users: User[];
  events: Event[];
}

