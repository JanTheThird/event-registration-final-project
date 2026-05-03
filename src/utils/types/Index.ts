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

export interface Database {
  users: User[];
  events: Event[];
}