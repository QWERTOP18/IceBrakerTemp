import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Trophy } from 'lucide-react';
import { format, parseISO } from 'date-fns';

import { userService, ratingService, matchService, categoryService } from '../../api';
import { UserResponse, RatingResponse, MatchResponse, UserRatingHistory, EnhancedMatch, CategoryResponse } from '../../types';
import RatingChart from '../ui/RatingChart';
import MatchList from '../ui/MatchList';

const RatingDetailPage: React.FC = () => {
  const { user_id, category_id } = useParams<{ user_id: string, category_id: string }>();
  
  const [user, setUser] = useState<UserResponse | null>(null);
  const [category, setCategory] = useState<CategoryResponse | null>(null);
  const [ratings, setRatings] = useState<UserRatingHistory[]>([]);
  const [matches, setMatches] = useState<EnhancedMatch[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      if (!user_id || !category_id) return;
      
      try {
        // Fetch user
        const userData = await userService.getUser(user_id);
        setUser(userData);
        
        // Fetch category
        const categoryData = await categoryService.getCategory(category_id);
        setCategory(categoryData);
        
        // For demonstration, we'll create mock rating history
        // In a real app, you would fetch all ratings for this user and category
        const mockRatingHistory: UserRatingHistory[] = [
          { date: "2023-01-01T12:00:00Z", rating: 1000 },
          { date: "2023-01-15T12:00:00Z", rating: 1025 },
          { date: "2023-02-01T12:00:00Z", rating: 1058 },
          { date: "2023-02-15T12:00:00Z", rating: 1022 },
          { date: "2023-03-01T12:00:00Z", rating: 1075 },
          { date: "2023-03-15T12:00:00Z", rating: 1105 },
          { date: "2023-04-01T12:00:00Z", rating: 1150 },
          { date: "2023-04-15T12:00:00Z", rating: 1132 },
          { date: "2023-05-01T12:00:00Z", rating: 1172 },
          { date: "2023-05-15T12:00:00Z", rating: 1203 },
          { date: "2023-06-01T12:00:00Z", rating: 1250 },
        ];
        setRatings(mockRatingHistory);
        
        // Fetch matches for this user in this category
        const matchesData = await matchService.getUserMatches(user_id);
        
        // Filter matches for the specific category
        const filteredMatches = matchesData.filter(match => match.category_id === category_id);
        
        // Create enhanced matches
        const enhancedMatches = await Promise.all(
          filteredMatches.map(async (match) => {
            const isWinner = match.winner_id === user_id;
            const opponentId = isWinner ? match.loser_id : match.winner_id;
            
            try {
              const opponent = await userService.getUser(opponentId);
              
              return {
                ...match,
                opponentName: opponent.name,
                opponentImage: opponent.user_image || null,
                categoryName: categoryData.name,
                isWinner,
                ratingChange: isWinner ? 15 : -15 // Mock rating change
              };
            } catch (error) {
              return {
                ...match,
                opponentName: 'Unknown',
                opponentImage: null,
                categoryName: categoryData.name,
                isWinner
              };
            }
          })
        );
        
        setMatches(enhancedMatches);
      } catch (error) {
        console.error('Error fetching rating data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user_id, category_id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }
  
  if (!user || !category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">User or category not found</h2>
        <Link to="/" className="mt-4 inline-block btn btn-primary">
          Go Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header with navigation and user info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <Link to={`/user/${user_id}`} className="flex items-center text-indigo-600 hover:text-indigo-800 mb-2">
            <ArrowLeft size={16} className="mr-1" />
            Back to User Profile
          </Link>
          <h1 className="text-2xl font-bold flex items-center">
            <User size={24} className="mr-2 text-indigo-600" />
            {user.name}'s {category.name} Rating
          </h1>
        </div>
        
        <div className="bg-white rounded-lg shadow px-4 py-3 flex items-center">
          <Trophy size={24} className="mr-3 text-yellow-500" />
          <div>
            <div className="text-sm text-gray-500">Current Rating</div>
            <div className="text-2xl font-bold text-indigo-600">
              {ratings.length > 0 ? Math.round(ratings[ratings.length - 1].rating) : 'N/A'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Rating chart */}
      <RatingChart 
        data={ratings} 
        categoryName={category.name} 
        color={category.color || "#4f46e5"} 
      />
      
      {/* Match history */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Match History</h2>
        
        {matches.length > 0 ? (
          <MatchList 
            matches={matches} 
            title={`${category.name} Matches`} 
          />
        ) : (
          <div className="card">
            <div className="card-body text-center py-12">
              <p className="text-gray-500">No matches found for this category</p>
              <Link to="/result" className="btn btn-primary mt-4">
                Record a Match
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingDetailPage;