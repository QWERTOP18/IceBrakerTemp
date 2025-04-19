import React from 'react';
import { Link } from 'react-router-dom';
import { UserResponse } from '../../types';

interface UserCardProps {
  user: UserResponse;
  rank?: number;
  rating?: number;
  categoryId?: string;
  winRate?: number;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  rank, 
  rating, 
  categoryId,
  winRate 
}) => {
  return (
    <Link to={`/user/${user._id}`} className="block">
      <div className="card hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center p-4">
          {/* User Avatar */}
          <div className="flex-shrink-0 mr-4">
            {user.user_image ? (
              <img 
                src={user.user_image} 
                alt={user.name} 
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {user.name}
            </h3>
            <p className="text-sm text-gray-500">
              @{user.intra_name}
            </p>
          </div>
          
          {/* Rating & Rank (if provided) */}
          {(rating !== undefined || rank !== undefined) && (
            <div className="ml-4 text-right">
              {rating !== undefined && (
                <div className="text-lg font-bold text-indigo-600">
                  {rating.toFixed(0)}
                </div>
              )}
              {rank !== undefined && (
                <div className="text-sm font-medium text-gray-500">
                  Rank #{rank}
                </div>
              )}
              {winRate !== undefined && (
                <div className="text-xs mt-1">
                  <span className={`font-medium ${winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                    {(winRate * 100).toFixed(0)}% Win
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Additional Stats (if category is provided) */}
        {categoryId && (rating !== undefined || rank !== undefined) && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-between">
            <Link 
              to={`/rating/user/${user._id}/category/${categoryId}`}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View Rating History
            </Link>
          </div>
        )}
      </div>
    </Link>
  );
};

export default UserCard;