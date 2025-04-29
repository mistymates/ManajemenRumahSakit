
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { users } from '@/data/mockData';

interface AuthContextType {
  user: User | null;
  login: (id: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Check if user is already authenticated on load
  useEffect(() => {
    const isAuth = sessionStorage.getItem('authenticated') === 'true';
    const savedUserId = sessionStorage.getItem('userId');
    
    if (isAuth && savedUserId) {
      const foundUser = users.find(u => u.id === savedUserId);
      if (foundUser) {
        setUser(foundUser);
      }
    }
  }, []);

  const login = (id: string): boolean => {
    const foundUser = users.find(u => u.id === id);
    if (foundUser) {
      setUser(foundUser);
      // Save user ID in sessionStorage
      sessionStorage.setItem('userId', id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('authenticated');
    sessionStorage.removeItem('userId');
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }
    
    return user.role === roles;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
