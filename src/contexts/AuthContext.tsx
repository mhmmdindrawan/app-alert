// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'monitor';
  avatar?: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users untuk development
const MOCK_USERS: Array<User & { password: string }> = [
  {
    id: '1',
    name: 'Admin System',
    email: 'admin@parking.com',
    password: 'admin123',
    role: 'admin',
    avatar: '👨‍💼',
    permissions: ['view_alerts', 'manage_users', 'export_data', 'system_config']
  },
  {
    id: '2',
    name: 'Supervisor Parkir',
    email: 'supervisor@parking.com', 
    password: 'supervisor123',
    role: 'supervisor',
    avatar: '👨‍💻',
    permissions: ['view_alerts', 'manage_alerts', 'export_data']
  },
  {
    id: '3',
    name: 'Monitor Keamanan',
    email: 'monitor@parking.com',
    password: 'monitor123', 
    role: 'monitor',
    avatar: '👨‍🔒',
    permissions: ['view_alerts']
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved auth data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('fraud_alert_user');
    const savedToken = localStorage.getItem('fraud_alert_token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('fraud_alert_user');
        localStorage.removeItem('fraud_alert_token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if we're in development mode
      if (process.env.NODE_ENV === 'development') {
        // Mock authentication
        const mockUser = MOCK_USERS.find(u => u.email === email && u.password === password);
        
        if (mockUser) {
          const { password: _, ...userWithoutPassword } = mockUser;
          const mockToken = `mock-token-${mockUser.id}-${Date.now()}`;
          
          setUser(userWithoutPassword);
          setToken(mockToken);
          
          // Save to localStorage
          localStorage.setItem('fraud_alert_user', JSON.stringify(userWithoutPassword));
          localStorage.setItem('fraud_alert_token', mockToken);
          
          setIsLoading(false);
          return { success: true };
        } else {
          setIsLoading(false);
          return { success: false, error: 'Email atau password salah' };
        }
      } else {
        // Production API call
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setUser(data.user);
          setToken(data.token);
          
          // Save to localStorage
          localStorage.setItem('fraud_alert_user', JSON.stringify(data.user));
          localStorage.setItem('fraud_alert_token', data.token);
          
          setIsLoading(false);
          return { success: true };
        } else {
          setIsLoading(false);
          return { 
            success: false, 
            error: data.message || 'Login failed' 
          };
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fraud_alert_user');
    localStorage.removeItem('fraud_alert_token');
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!token) return false;
    
    try {
      if (process.env.NODE_ENV === 'development') {
        // Mock token refresh
        return true;
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/refresh`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setToken(data.token);
          localStorage.setItem('fraud_alert_token', data.token);
          return true;
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
    
    return false;
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};