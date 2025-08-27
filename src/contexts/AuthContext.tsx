import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api';
import type { User, LoginCredentials, RegisterData, LoginResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_role') as 'customer' | 'admin' | null;
    const username = localStorage.getItem('username');

    if (token && userRole && username) {
      // Create a basic user object from stored data
      setUser({
        id: 0, // Will be updated when we fetch profile
        username,
        email: '',
        first_name: '',
        last_name: '',
        role: userRole,
      });
      
      // Fetch full profile data
      apiClient.getProfile()
        .then(setUser)
        .catch(() => {
          // If profile fetch fails, clear auth data
          localStorage.clear();
          setUser(null);
        });
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.login(credentials);
    
    // Create user object from login response
    const userProfile = await apiClient.getProfile();
    setUser(userProfile);
    
    return response;
  };

  const register = async (userData: RegisterData): Promise<User> => {
    const newUser = await apiClient.register(userData);
    return newUser;
  };

  const logout = async (): Promise<void> => {
    await apiClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated,
      isAdmin,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}