import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { userService } from '../../api';
import { UserResponse } from '../../types';

interface UserSearchProps {
  onSelectUser: (user: UserResponse) => void;
  placeholder?: string;
  excludeUserId?: string;
}

const UserSearch: React.FC<UserSearchProps> = ({ 
  onSelectUser, 
  placeholder = "Search users...",
  excludeUserId 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 2) {
      setIsSearching(true);
      setShowResults(true);
    } else {
      setUsers([]);
      setShowResults(false);
    }
  };

  // Fetch users based on search term
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length >= 2) {
        try {
          const results = await userService.searchUsers(searchTerm);
          // Filter out the excluded user if provided
          const filteredResults = excludeUserId 
            ? results.filter(user => user._id !== excludeUserId) 
            : results;
          setUsers(filteredResults);
        } catch (error) {
          console.error('Error searching users:', error);
        } finally {
          setIsSearching(false);
        }
      }
    };

    const debounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        searchUsers();
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, excludeUserId]);

  // Handle click outside search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle user selection
  const handleSelectUser = (user: UserResponse) => {
    onSelectUser(user);
    setSearchTerm('');
    setUsers([]);
    setShowResults(false);
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder={placeholder}
          className="input pl-10"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
      </div>

      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              Searching...
            </div>
          ) : users.length > 0 ? (
            <ul>
              {users.map(user => (
                <li 
                  key={user._id} 
                  onClick={() => handleSelectUser(user)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  {user.user_image ? (
                    <img 
                      src={user.user_image} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center mr-2">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">@{user.intra_name}</div>
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No users found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default UserSearch;