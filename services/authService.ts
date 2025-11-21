
import { getUsers } from "./storageService";
import { User } from "../types";

const SESSION_KEY = "BARRA_USER_SESSION";

export const login = (email: string, password: string): boolean => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Store user info (excluding sensitive data ideally, but for this demo we store what's needed)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return true;
  }
  return false;
};

export const logout = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!sessionStorage.getItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = sessionStorage.getItem(SESSION_KEY);
  if (data) {
    return JSON.parse(data) as User;
  }
  return null;
};

export const isSuperAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
};
