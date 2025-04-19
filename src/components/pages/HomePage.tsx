import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService, ratingService, matchService, rankingService } from '../../api';
import { UserResponse, UserRating, MatchResponse, EnhancedMatch } from '../../types';
import UserCard from '../ui/UserCard';
import MatchList from '../ui/MatchList';

const HomePage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [recentMatches, setRecentMatches] = useState<EnhancedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      
      try {
        const userId = localStorage.getItem('user_id');
        if (!userId) return;
        
        // Fetch user data if not already in context
        let userData = currentUser;
        if (!userData) {
          userData = await userService.getUser(userId);
          setUser(userData);
        } else {
          setUser(currentUser);
        }
        
        // Fetch user matches
        const matches = await matchService.getUserMatches(userId);
        
        // Create enhanced matches by adding opponent names
        // In a real app, you would have an API endpoint that returns this data pre-processed
        const enhancedMatches: EnhancedMatch[] = await Promise.all(
          matches.slice(0, 5).map(async (match) => {
            const isWinner = match.winner_id === userId;
            const opponentId = isWinner ? match.loser_id : match.winner_id;
            
            try {
              const opponent = await userService.getUser(opponentId);
              const category = await ratingService.getUserCategoryRating(userId, match.category_id);
              
              return {
                ...match,
                opponentName: opponent.name,
                opponentImage: opponent.user_image || null,
                categoryName: match.category_id, // In a real app, get the actual category name
                isWinner,
                ratingChange: 15 // Mock rating change, would be calculated or provided by API
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
        // In a real app, you would fetch actual ratings from the API
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
    
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [currentUser, isAuthenticated]);
  
  if (!isAuthenticated || !user) {
    return null; // Will redirect to auth page via route protection
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-pulse flex flex-col items-center">
          <div className="rounded-full bg-gray-200 h-16 w-16 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header with user info */}
      <div className="mb-8">
        <UserCard 
          user={user}
        />
      </div>
      
      {/* Category ratings */}
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
                    to={`/rating/user/${user._id}/category/${rating.categoryId}`}
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
      
      {/* Recent matches */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Activity className="mr-2 text-indigo-600" size={24} />
          Recent Activity
        </h2>
        
        <MatchList matches={recentMatches} />
        
        <div className="mt-4 text-center">
          <Link to="/result" className="btn btn-primary">
            Record New Match
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;