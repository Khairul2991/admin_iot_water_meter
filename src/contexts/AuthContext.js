// contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { secureStorage } from '../utils/secureStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const userSession = secureStorage.getItem('user_session');
      
      if (userSession) {
        // Cek apakah token sudah expired
        if (userSession.expiresAt > Date.now()) {
          setUser(userSession);
          setIsAuthenticated(true);
        } else {
          // Hapus session yang sudah expired
          secureStorage.removeItem('user_session');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    secureStorage.setItem('user_session', userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    secureStorage.removeItem('user_session');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook untuk menggunakan auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
