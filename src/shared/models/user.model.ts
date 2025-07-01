export interface User {
    id: number;
    email: string;
    role: 'user' | 'admin'; // User's role (user or admin for future admin panel)
    name?: string;       // Optional user name
  }