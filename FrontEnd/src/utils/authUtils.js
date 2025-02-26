// src/utils/authUtils.js
import { secureStorage } from './secureStorage';

export const getAuthToken = () => {
  const userSession = secureStorage.getItem('user_session');
  return userSession ? userSession.token : null;
};

export const getUserRole = () => {
  const userSession = secureStorage.getItem('user_session');
  return userSession ? userSession.role : null;
};

export const getUserEmail = () => {
    const userSession = secureStorage.getItem('user_session');
    return userSession ? userSession.email : null;
  };

export const isAuthenticated = () => {
  const userSession = secureStorage.getItem('user_session');
  
  if (!userSession) return false;
  
  // Periksa apakah token sudah kedaluwarsa
  return userSession.expiresAt > Date.now();
};
