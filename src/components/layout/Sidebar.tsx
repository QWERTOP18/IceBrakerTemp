import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Trophy, 
  Search, 
  PenSquare, 
  Menu, 
  X, 
  LogOut, 
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { logout } = useAuth();

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 lg:hidden bg-indigo-600 p-2 rounded-md text-white"
        aria-label="Toggle sidebar"
      >
        {isExpanded ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar w-64 ${isExpanded ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          {/* Logo/header */}
          <div className="px-4 py-6 flex items-center border-b border-indigo-800">
            <Trophy className="mr-2" size={24} />
            <h1 className="text-xl font-bold">IceBreaker</h1>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 py-4">
            <NavLink 
              to="/" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsExpanded(false)}
            >
              <Home className="mr-3" size={20} />
              <span>Home</span>
            </NavLink>

            <NavLink 
              to="/ranking" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsExpanded(false)}
            >
              <Trophy className="mr-3" size={20} />
              <span>Rankings</span>
            </NavLink>

            <NavLink 
              to="/result" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsExpanded(false)}
            >
              <PenSquare className="mr-3" size={20} />
              <span>Record Match</span>
            </NavLink>

            <div className="px-4 py-2 text-indigo-300 text-sm font-medium mt-6 mb-2">
              User
            </div>

            <NavLink 
              to="/user/search" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsExpanded(false)}
            >
              <Search className="mr-3" size={20} />
              <span>Find Users</span>
            </NavLink>

            <NavLink 
              to="/user/profile" 
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsExpanded(false)}
            >
              <User className="mr-3" size={20} />
              <span>My Profile</span>
            </NavLink>
          </nav>

          {/* Logout */}
          <div className="border-t border-indigo-800 p-4">
            <button 
              onClick={() => {
                logout();
                setIsExpanded(false);
              }}
              className="sidebar-item w-full justify-center"
            >
              <LogOut className="mr-3" size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;