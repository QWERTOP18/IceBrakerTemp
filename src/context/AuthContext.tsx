import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppContext, SignInRequest, SignUpRequest, UserResponse } from '../types';
import { authService } from '../api';

// Default context value
const defaultContext: AppContext = {
  currentUser: null,
  setCurrentUser: () => {},
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {}
};

// Create the context
const AuthContext = createContext<AppContext>(defaultContext);

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for stored user on initial load
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    
    if (storedUserId) {
      // In a real app, you would fetch the user details here
      // For now, we'll just set isAuthenticated
      setIsAuthenticated(true);
    }
  }, []);

  // Login function
  const login = async (credentials: SignInRequest) => {
    try {
      const user = await authService.signIn(credentials);
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user_id', user.id || user._id);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Signup function
  const signup = async (userData: SignUpRequest) => {
    try {
      const user = await authService.signUp(userData);
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user_id', user.id || user._id);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user_id');
  };

  // Context value
  const value = {
    currentUser,
    setCurrentUser,
    isAuthenticated,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};