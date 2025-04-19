import React, { useState, useEffect } from 'react';
import { Search, User as UserIcon } from 'lucide-react';
import { userService } from '../../api';
import { UserResponse } from '../../types';
import UserCard from '../ui/UserCard';

const SearchUsersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async () => {
    if (searchTerm.trim().length < 2) return;
    
    setLoading(true);
    setSearchPerformed(true);
    
    try {
      const results = await userService.searchUsers(searchTerm);
      setUsers(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center">
        <UserIcon className="mr-3 text-indigo-600" size={28} />
        Find Users
      </h1>
      
      {/* Search form */}
      <div className="card">
        <div className="card-body">
          <div className="flex">
            <div className="relative flex-grow">
              <input
                type="text"
                className="input pl-10 w-full"
                placeholder="Search by name or intra name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            <button
              onClick={handleSearch}
              className="btn btn-primary ml-2"
              disabled={searchTerm.trim().length < 2 || loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Search results */}
      {searchPerformed && (
        <div>
          <h2 className="text-lg font-medium mb-4">
            Search Results {users.length > 0 && `(${users.length})`}
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(user => (
                <UserCard key={user._id} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-gray-500">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchUsersPage;