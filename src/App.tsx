import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';

// Pages
import HomePage from './components/pages/HomePage';
import AuthPage from './components/pages/AuthPage';
import UserDetailPage from './components/pages/UserDetailPage';
import RatingDetailPage from './components/pages/RatingDetailPage';
import MatchRecordPage from './components/pages/MatchRecordPage';
import RankingPage from './components/pages/RankingPage';
import SearchUsersPage from './components/pages/SearchUsersPage';
import McpChatPage from './components/pages/McpChatPage';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Authentication check component
const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  
  // Check for stored user_id on initial load
  useEffect(() => {
    // This is handled by the AuthProvider
  }, []);
  
  return (
    <Routes>
      {/* Auth routes */}
      <Route 
        path="/auth" 
        element={
          <AuthCheck>
            <AuthPage />
          </AuthCheck>
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <HomePage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/user/:id" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <UserDetailPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/rating/user/:user_id/category/:category_id" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <RatingDetailPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/result" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <MatchRecordPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/ranking" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <RankingPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/user/search" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <SearchUsersPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/mcpchat" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <McpChatPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect all other routes */}
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? "/" : "/auth"} replace />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;