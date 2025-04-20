import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';
import { EnhancedMatch } from '../../types';

interface MatchListProps {
  matches: EnhancedMatch[];
  title?: string;
}

const MatchList: React.FC<MatchListProps> = ({ 
  matches, 
  title = "Recent Matches" 
}) => {
  const [sortBy, setSortBy] = useState<'date' | 'categoryName'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Handle sort changes
  const handleSort = (field: 'date' | 'categoryName') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  // Sort matches based on current sort settings
  const sortedMatches = [...matches].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === 'asc' 
        ? a.categoryName.localeCompare(b.categoryName)
        : b.categoryName.localeCompare(a.categoryName);
    }
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      
      {matches.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opponent
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('categoryName')}
                >
                  <div className="flex items-center">
                    Category
                    {sortBy === 'categoryName' && (
                      sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortBy === 'date' && (
                      sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMatches.map((match) => (
                <tr key={match._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/user/${match.isWinner ? match.loser_id : match.winner_id}`} className="flex items-center">
                      {match.opponentImage ? (
                        <img 
                          src={match.opponentImage} 
                          alt={match.opponentName} 
                          className="w-8 h-8 rounded-full mr-2 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center mr-2">
                          {match.opponentName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900">{match.opponentName}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{match.categoryName}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`text-sm font-medium ${match.isWinner ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {match.isWinner ? 'Win' : 'Loss'} ({match.isWinner ? match.winner_point : match.loser_point} - {match.isWinner ? match.loser_point : match.winner_point})
                    </span>
                    {match.ratingChange !== undefined ? (
                      <span 
                        className={`ml-2 inline-block text-xs font-medium ${match.ratingChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
                      >
                        {match.ratingChange >= 0 ? '+' : ''}{match.ratingChange}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(parseISO(match.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/match/${match._id}`} 
                      className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end"
                    >
                      Details <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card-body text-center text-gray-500">
          No matches found
        </div>
      )}
    </div>
  );
};

export default MatchList;