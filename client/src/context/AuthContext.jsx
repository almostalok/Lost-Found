/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/Api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const currentUser = await authAPI.me();
        if (mounted && currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => { mounted = false };
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const data = await authAPI.login(credentials);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  };

  // Logout function
  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
