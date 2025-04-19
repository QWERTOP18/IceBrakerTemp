import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, User as UserIcon, Calendar, Award } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { userService, matchService } from '../../api';
import { UserResponse, UserRating, EnhancedMatch } from '../../types';
import MatchList from '../ui/MatchList';

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [recentMatches, setRecentMatches] = useState<EnhancedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      if (!id) return;
      
      try {
        // Fetch user data
        const userData = await userService.getUser(id);
        setUser(userData);
        
        // Fetch user matches
        const matches = await matchService.getUserMatches(id);
        
        // Create enhanced matches
        const enhancedMatches: EnhancedMatch[] = await Promise.all(
          matches.slice(0, 10).map(async (match) => {
            const isWinner = match.winner_id === id;
            const opponentId = isWinner ? match.loser_id : match.winner_id;
            
            try {
              const opponent = await userService.getUser(opponentId);
              
              return {
                ...match,
                opponentName: opponent.name,
                opponentImage: opponent.user_image || null,
                categoryName: match.category_id, // In a real app, get the actual category name
                isWinner,
                ratingChange: isWinner ? 15 : -15 // Mock rating change
              };
            } catch (error) {
              return {
                ...match,
                opponentName: 'Unknown',
                opponentImage: null,
                categoryName: match.category_id,
                isWinner
              };
            }
          })
        );
        
        setRecentMatches(enhancedMatches);
        
        // Create mock user ratings for demonstration
        setUserRatings([
          {
            categoryId: 'chess',
            categoryName: 'Chess',
            rating: 1250,
            rank: 4,
            winRate: 0.65,
            color: '#4f46e5'
          },
          {
            categoryId: 'pingpong',
            categoryName: 'Ping Pong',
            rating: 1100,
            rank: 7,
            winRate: 0.45,
            color: '#0ea5e9'
          },
          {
            categoryId: 'pong',
            categoryName: 'Pong',
            rating: 1400,
            rank: 2,
            winRate: 0.8,
            color: '#ef4444'
          }
        ]);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-8"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">User not found</h2>
        <Link to="/" className="mt-4 inline-block btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Navigation */}
      <div className="mb-4">
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          Back to Home
        </Link>
      </div>
      
      {/* User profile card */}
      <div className="card">
        <div className="sm:flex items-start p-6">
          {/* User Avatar */}
          <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
            {user.user_image ? (
              <img 
                src={user.user_image} 
                alt={user.name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.name}
            </h1>
            <p className="text-indigo-600 text-lg mb-4">
              @{user.intra_name}
            </p>
            
            <div className="flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center">
                <Mail size={18} className="mr-2" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={18} className="mr-2" />
                <span>Joined {format(parseISO(user.created_at), 'MMMM yyyy')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* User ratings */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Ratings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userRatings.map(rating => (
            <div key={rating.categoryId} className="card">
              <div className="card-body">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium" style={{ color: rating.color }}>
                    {rating.categoryName}
                  </h3>
                  <span className="badge badge-primary">#{rating.rank}</span>
                </div>
                
                <div className="text-3xl font-bold mb-2">
                  {rating.rating.toFixed(0)}
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    rating.winRate && rating.winRate >= 0.5 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {rating.winRate && (rating.winRate * 100).toFixed(0)}% Win Rate
                  </span>
                  
                  <Link 
                    to={`/rating/user/${user._id}/category/${rating.categoryId}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View History
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent matches */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Matches</h2>
        
        {recentMatches.length > 0 ? (
          <MatchList matches={recentMatches} />
        ) : (
          <div className="card">
            <div className="card-body text-center py-8">
              <p className="text-gray-500">No matches found for this user</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Challenge button */}
      <div className="text-center">
        <Link to={`/result?opponent=${user._id}`} className="btn btn-primary">
          <Award className="mr-2" size={20} />
          Challenge {user.name}
        </Link>
      </div>
    </div>
  );
};

export default UserDetailPage;