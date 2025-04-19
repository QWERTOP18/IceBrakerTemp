import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Activity } from 'lucide-react';
import { UserRating } from '../../types';

interface UserRatingsSectionProps {
  userRatings: UserRating[];
  userId: string;
}

const UserRatingsSection: React.FC<UserRatingsSectionProps> = ({ userRatings, userId }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Trophy className="mr-2 text-indigo-600" size={24} />
        Your Ratings
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {userRatings.map(rating => (
          <div key={rating.categoryId} className="card">
            <div className="card-header flex justify-between">
              <h3 className="text-lg font-medium" style={{ color: rating.color }}>
                {rating.categoryName}
              </h3>
              <span className="badge badge-primary">Rank #{rating.rank}</span>
            </div>
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 text-gray-500" size={20} />
                  <div className="text-2xl font-bold">{rating.rating.toFixed(0)}</div>
                </div>
                <div className="flex items-center">
                  <Activity className="mr-2 text-gray-500" size={20} />
                  <div className={`text-lg font-semibold ${
                    rating.winRate && rating.winRate >= 0.5 
                    ? 'text-green-600' 
                    : 'text-red-600'
                  }`}>
                    {rating.winRate && (rating.winRate * 100).toFixed(0)}% Win
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <Link 
                  to={`/rating/user/${userId}/category/${rating.categoryId}`}
                  className="btn btn-outline text-sm"
                >
                  View History
                </Link>
                <Link 
                  to={`/ranking?category=${rating.categoryId}`}
                  className="btn btn-outline text-sm"
                >
                  View Ranking
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserRatingsSection;
