import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { userService, categoryService, ratingService } from '../../api';
import { format, parseISO } from 'date-fns';

interface RatingHistoryItem {
  _id: string;
  user_id: string;
  category_id: string;
  rate: number;
  date: string;
  created_at: string;
  updated_at: string;
  // Derived fields
  change?: number;
  opponentName?: string;
  isWin?: boolean;
}

const RatingHistoryPage: React.FC = () => {
  const { userId, categoryId } = useParams<{ userId: string; categoryId: string }>();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [currentRating, setCurrentRating] = useState(0);
  const [historyItems, setHistoryItems] = useState<RatingHistoryItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !categoryId) return;
      
      setLoading(true);
      try {
        // Fetch user data
        const userData = await userService.getUser(userId);
        setUserName(userData.name);
        
        // Fetch category data
        const categoryData = await categoryService.getCategory(categoryId);
        setCategoryName(categoryData.name);
        
        // Fetch current rating
        const ratingData = await ratingService.getUserCategoryRating(userId, categoryId);
        setCurrentRating(ratingData.rate);
        
        // Fetch rating history directly from the API
        const ratingHistory = await ratingService.getUserRatingHistory(userId, categoryId);
        
        // Sort by date (newest first)
        ratingHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        // Calculate rating changes between consecutive entries
        const historyWithChanges = ratingHistory.map((item, index, array) => {
          // For the first entry (most recent), we don't have a previous entry to compare
          if (index === array.length - 1) {
            return {
              ...item,
              change: 0 // No change for the first rating
            };
          }
          
          // Calculate change from the previous (older) entry
          const change = item.rate - array[index + 1].rate;
          return {
            ...item,
            change
          };
        });
        
        setHistoryItems(historyWithChanges);
      } catch (error) {
        console.error('Error fetching rating history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userId, categoryId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to={`/user/${userId}`} 
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Profile
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">Rating History</h1>
        <div className="flex items-center mb-4">
          <span className="text-gray-600 mr-2">User:</span>
          <span className="font-medium">{userName}</span>
        </div>
        <div className="flex items-center mb-4">
          <span className="text-gray-600 mr-2">Category:</span>
          <span className="font-medium">{categoryName}</span>
        </div>
        <div className="flex items-center">
          <span className="text-gray-600 mr-2">Current Rating:</span>
          <span className="font-bold text-xl text-indigo-600">{currentRating}</span>
        </div>
      </div>
      
      {/* Rating History Graph */}
      {!loading && userId && categoryId && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-indigo-600" />
              Rating Progression
            </h2>
          </div>
          <div className="w-full h-64 bg-gray-50 rounded-lg overflow-hidden">
            <img 
              src={ratingService.getUserRatingHistoryGraphUrl(userId, categoryId)}
              alt="Rating History Graph"
              className="w-full h-full object-contain"
              onError={(e) => {
                // If image fails to load, show a fallback message
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'flex items-center justify-center h-full text-gray-500';
                  fallback.innerText = 'Graph image not available';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Match
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historyItems.length > 0 ? (
                historyItems.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(parseISO(item.date), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(parseISO(item.created_at), 'HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.rate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block text-sm font-medium ${
                        (item.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(item.change || 0) >= 0 ? '+' : ''}{item.change || 0}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    No rating history available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RatingHistoryPage;
