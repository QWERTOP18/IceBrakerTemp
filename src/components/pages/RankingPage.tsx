import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Trophy, ChevronRight, Search } from 'lucide-react';
import { userService, rankingService } from '../../api';
import { RankingItem, CategoryOption } from '../../types';
import CategorySelector from '../ui/CategorySelector';

const RankingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Load initial category from URL params and fetch rankings immediately
  useEffect(() => {
    const categoryId = searchParams.get('category');
    
    if (categoryId) {
      // If we have a category ID in the URL, use it and fetch rankings immediately
      if (!selectedCategory || selectedCategory.id !== categoryId) {
        setSelectedCategory(prev => {
          if (prev?.id !== categoryId) {
            // Fetch rankings immediately with the category ID from URL
            fetchRankings(categoryId);
            return { id: categoryId, name: '' }; // Temporary object, will be replaced by CategorySelector
          }
          return prev;
        });
      }
    } else {
      // If no category in URL, we'll select the first one when categories are loaded
      // This will be handled by the CategorySelector component
    }
  }, [searchParams.get('category')]); // Only depend on the category param
  
  // Memoize the handleCategorySelect function to prevent recreating it on every render
  const handleCategorySelect = React.useCallback((category: CategoryOption) => {
    setSelectedCategory(category);
    setSearchParams({ category: category.id });
    fetchRankings(category.id);
  }, [setSearchParams]); // Only depend on setSearchParams which is stable
  
  const fetchRankings = async (categoryId: string) => {
    setLoading(true);
    
    try {
      // Get rankings from the API
      const rankingsData = await rankingService.getCategoryRanking(categoryId);
      
      // Transform API data to our RankingItem format
      // Since we don't know the exact structure of the API response, we'll handle it flexibly
      const processedRankings: RankingItem[] = [];
      
      // Process the rankings data
      if (Array.isArray(rankingsData)) {
        // Map the API data to our format
        const rankingPromises = rankingsData.map(async (item: any, index: number) => {
          try {
            // Get user details if needed
            const userId = item.user_id || item.userId || item._id;
            let userData;
            
            try {
              userData = await userService.getUser(userId);
            } catch (userError) {
              console.error(`Error fetching user ${userId}:`, userError);
              // Create minimal user data if we can't fetch the user
              userData = {
                _id: userId,
                name: item.name || `User ${index + 1}`,
                intra_name: item.intra_name || `user_${index + 1}`,
                user_image: null
              };
            }
            
            return {
              userId: userData._id,
              userName: userData.name,
              intraName: userData.intra_name,
              userImage: userData.user_image || undefined,
              rating: item.rate || item.rating || 1500,
              rank: index + 1 // Use the index as rank if not provided
            };
          } catch (error) {
            console.error(`Error processing ranking item:`, error);
            return null;
          }
        });
        
        // Wait for all user data to be fetched
        const results = await Promise.all(rankingPromises);
        processedRankings.push(...results.filter(Boolean) as RankingItem[]);
      }
      
      setRankings(processedRankings);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter rankings based on search term
  const filteredRankings = searchTerm
    ? rankings.filter(
        rank => 
          rank.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
          rank.intraName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : rankings;
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold flex items-center">
        <Trophy className="mr-3 text-yellow-500" size={28} />
        Rankings
      </h1>
      
      {/* Category selector */}
      <div className="mb-8">
        <CategorySelector 
          onCategorySelect={handleCategorySelect}
          selectedCategoryId={selectedCategory?.id}
        />
      </div>
      
      {/* Rankings list */}
      <div className="card">
        <div className="card-header flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {selectedCategory?.name || 'Category'} Leaderboard
          </h2>
          
          <div className="relative">
            <input
              type="text"
              className="input pl-9 py-1"
              placeholder="Search players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2 text-gray-400" size={16} />
          </div>
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRankings.map((rank) => (
                  <tr key={rank.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`font-semibold ${
                        rank.rank === 1 ? 'text-yellow-500' : 
                        rank.rank === 2 ? 'text-gray-400' : 
                        rank.rank === 3 ? 'text-amber-700' : 'text-gray-900'
                      }`}>
                        {rank.rank === 1 && <Trophy size={16} className="inline mr-1" />}
                        {rank.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {rank.userImage ? (
                          <img 
                            src={rank.userImage} 
                            alt={rank.userName} 
                            className="w-8 h-8 rounded-full mr-3 object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center mr-3">
                            {rank.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">{rank.userName}</div>
                          <div className="text-sm text-gray-500">@{rank.intraName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-bold text-indigo-600">
                      {rank.rating.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/user/${rank.userId}`} 
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <ChevronRight size={20} />
                      </Link>
                    </td>
                  </tr>
                ))}
                
                {filteredRankings.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No players found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingPage;