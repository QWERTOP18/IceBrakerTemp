import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {isAuthenticated && <Sidebar />}
      <main className={`flex-1 ${isAuthenticated ? 'lg:ml-64' : ''} transition-all duration-300`}>
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;