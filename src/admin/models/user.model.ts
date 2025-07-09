// src/shared/models/user.model.ts

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserResponse {
  users: User[];
  total: number;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
  phone?: string;
}

export interface UpdateUserRequest {
  id: number;
  email?: string;
  name?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}