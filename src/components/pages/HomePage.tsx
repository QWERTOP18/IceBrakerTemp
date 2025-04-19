import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService, ratingService, matchService } from '../../api';
import { UserResponse, UserRating, EnhancedMatch } from '../../types';
import UserCard from '../ui/UserCard';
import UserRatingsSection from '../ui/UserRatingsSection';
import RecentMatchesSection from '../ui/RecentMatchesSection';

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
              await ratingService.getUserCategoryRating(userId, match.category_id);
              
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
      <UserRatingsSection userRatings={userRatings} userId={user._id} />
      
      {/* Recent matches */}
      <RecentMatchesSection matches={recentMatches} />
    </div>
  );
};

export default HomePage;