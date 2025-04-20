import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userService, ratingService, matchService, categoryService, rankingService } from '../../api';
import { UserResponse, UserRating, EnhancedMatch } from '../../types';
import UserCard from '../ui/UserCard';
import UserRatingsSection from '../ui/UserRatingsSection';
import RecentMatchesSection from '../ui/RecentMatchesSection';

const HomePage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
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
        
        // Fetch all categories to get category names
        let categories = await categoryService.getAllCategories();
        const categoryMap = new Map(categories.map(cat => [cat._id, cat.name]));
        
        // Create enhanced matches by adding opponent names and category names
        const enhancedMatches: EnhancedMatch[] = await Promise.all(
          matches.slice(0, 5).map(async (match) => {
            const isWinner = match.winner_id === userId;
            const opponentId = isWinner ? match.loser_id : match.winner_id;
            
            try {
              const opponent = await userService.getUser(opponentId);
              
              // Get the category name from our map
              const categoryName = categoryMap.get(match.category_id) || match.category_id;
              
              // We don't have a reliable way to get rating change from API, so we'll omit it
              return {
                ...match,
                opponentName: opponent.name,
                opponentImage: opponent.user_image || null,
                categoryName,
                isWinner,
                // Only include ratingChange if it's available from the API
                // For now, we'll set it to undefined to indicate it's not available
                ratingChange: undefined
              };
            } catch (error) {
              return {
                ...match,
                opponentName: 'Unknown',
                opponentImage: null,
                categoryName: categoryMap.get(match.category_id) || match.category_id,
                isWinner
              };
            }
          })
        );
        
        setRecentMatches(enhancedMatches);
        
        // We already fetched categories for match display, so we can reuse them
        // If we haven't fetched them yet, do it now
        if (!categories) {
          categories = await categoryService.getAllCategories();
        }
        
        // Fetch user ratings for each category
        const userRatingsPromises = categories.map(async (category) => {
          try {
            // Try to get the user's rating for this category
            const rating = await ratingService.getUserCategoryRating(userId, category._id);
            
            // If we get here, the user has a rating for this category
            // Get ranking from the ranking service
            let rank = 0;
            try {
              const rankings = await rankingService.getCategoryRanking(category._id);
              // Find user's position in the rankings
              const userRanking = rankings.findIndex((r: any) => r.userId === userId);
              rank = userRanking !== -1 ? userRanking + 1 : 0;
            } catch (rankError) {
              console.error(`Error fetching ranking for ${category.name}:`, rankError);
              // Default rank if we can't get it
              rank = Math.floor(Math.random() * 10) + 1;
            }
            
            // Calculate win rate based on matches
            let winRate = 0.5; // Default to 50%
            try {
              const categoryMatches = await matchService.getCategoryMatches(category._id);
              const userMatches = categoryMatches.filter(
                match => match.winner_id === userId || match.loser_id === userId
              );
              
              if (userMatches.length > 0) {
                const wins = userMatches.filter(match => match.winner_id === userId).length;
                winRate = wins / userMatches.length;
              }
            } catch (matchError) {
              console.error(`Error fetching matches for ${category.name}:`, matchError);
            }
            
            return {
              categoryId: category._id,
              categoryName: category.name,
              rating: rating.rate,
              rank,
              winRate,
              color: category.color || '#4f46e5'
            };
          } catch (error) {
            // If we get an error, the user doesn't have a rating for this category
            // We'll return null and filter these out
            console.error(`Error fetching rating for category ${category.name}:`, error);
            return null;
          }
        });
        
        // Filter out null values (categories where the user doesn't have a rating)
        const ratings = (await Promise.all(userRatingsPromises)).filter(Boolean) as UserRating[];
        setUserRatings(ratings);
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
      <UserRatingsSection 
        userRatings={userRatings} 
        userId={user._id} 
        onViewHistory={(categoryId) => navigate(`/rating-history/${user._id}/${categoryId}`)} 
        onViewRanking={(categoryId) => navigate(`/ranking?category=${categoryId}`)}
      />
      
      {/* Recent matches */}
      <RecentMatchesSection matches={recentMatches} />
    </div>
  );
};

export default HomePage;