import { useState } from 'react';
import { logger } from '../utils/logger';

const AUTH_BASE = `${import.meta.env.VITE_API_URL || 'https://hatirla-base.onrender.com'}/api/auth`;

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
};

function storeAuth(token: string, user: AuthUser) {
  localStorage.setItem('xotiji_token', token);
  localStorage.setItem('xotiji_uid', user.id);
  localStorage.setItem('xotiji_user', JSON.stringify(user));
}

export function getToken(): string | null {
  return localStorage.getItem('xotiji_token');
}

export function getUserId(): string | null {
  return localStorage.getItem('xotiji_uid');
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('xotiji_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem('xotiji_token');
  localStorage.removeItem('xotiji_uid');
  localStorage.removeItem('xotiji_user');
}

export function useAuth() {
  const [loading, setLoading] = useState(false);

  async function login(email: string, password: string): Promise<AuthUser | null> {
    try {
      setLoading(true);
      const res = await fetch(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      storeAuth(data.token, data.user as AuthUser);
      return data.user as AuthUser;
    } catch (err) {
      logger.error('AUTH LOGIN ERROR:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function register(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthUser | null> {
    try {
      setLoading(true);
      const res = await fetch(`${AUTH_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      storeAuth(data.token, data.user as AuthUser);
      return data.user as AuthUser;
    } catch (err) {
      logger.error('AUTH REGISTER ERROR:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { loading, login, register };
}
