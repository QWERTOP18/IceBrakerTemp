import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Award, ArrowRight, Calendar, Hash } from 'lucide-react';
import UserSearch from '../ui/UserSearch';
import CategorySelector from '../ui/CategorySelector';
import { UserResponse, CategoryOption, MatchResultCreate } from '../../types';
import { matchService, userService } from '../../api';

const MatchRecordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [winner, setWinner] = useState<UserResponse | null>(null);
  const [loser, setLoser] = useState<UserResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOption | null>(null);
  const [winnerPoints, setWinnerPoints] = useState<number>(10);
  const [loserPoints, setLoserPoints] = useState<number>(0);
  const [matchDate, setMatchDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Check for opponent passed in URL
  useEffect(() => {
    const opponentId = searchParams.get('opponent');
    if (opponentId) {
      const fetchOpponent = async () => {
        try {
          const user = await userService.getUser(opponentId);
          setLoser(user);
        } catch (error) {
          console.error('Error fetching opponent:', error);
        }
      };
      
      fetchOpponent();
    }
  }, [searchParams]);
  
  const handleCategorySelect = (category: CategoryOption) => {
    setSelectedCategory(category);
  };
  
  const validateForm = (): boolean => {
    if (!winner) {
      setError('Please select a winner');
      return false;
    }
    
    if (!loser) {
      setError('Please select a loser');
      return false;
    }
    
    if (winner._id === loser._id) {
      setError('Winner and loser cannot be the same person');
      return false;
    }
    
    if (!selectedCategory) {
      setError('Please select a category');
      return false;
    }
    
    if (winnerPoints <= loserPoints) {
      setError('Winner points must be greater than loser points');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const matchData: MatchResultCreate = {
        winner_id: winner!._id,
        loser_id: loser!._id,
        category_id: selectedCategory!.id,
        winner_point: winnerPoints,
        loser_point: loserPoints,
        date: new Date(matchDate).toISOString()
      };
      
      await matchService.createMatch(matchData);
      setSuccess(true);
      
      // Clear form after 2 seconds
      setTimeout(() => {
        setWinner(null);
        setLoser(null);
        setSelectedCategory(null);
        setWinnerPoints(10);
        setLoserPoints(0);
        setMatchDate(new Date().toISOString().slice(0, 16));
        setSuccess(false);
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Error submitting match:', error);
      setError('Failed to submit match result. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <Award className="mr-3 text-indigo-600" size={28} />
          Record Match Result
        </h1>
        <p className="text-gray-600 mt-2">
          Record a new match result to update player ratings
        </p>
      </div>
      
      {success ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <svg 
              className="w-16 h-16 text-green-500 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              />
            </svg>
            <h2 className="text-2xl font-semibold mb-2">Match Recorded!</h2>
            <p className="text-gray-600">Ratings have been updated successfully.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              {error}
            </div>
          )}
          
          {/* Category selection */}
          <div className="mb-8">
            <CategorySelector 
              onCategorySelect={handleCategorySelect}
              selectedCategoryId={selectedCategory?.id}
            />
          </div>
          
          {/* Players selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Winner */}
            <div className="card">
              <div className="card-header bg-green-50">
                <h3 className="text-lg font-semibold text-green-700">Winner</h3>
              </div>
              <div className="card-body">
                {winner ? (
                  <div className="flex items-center mb-4">
                    {winner.user_image ? (
                      <img 
                        src={winner.user_image} 
                        alt={winner.name} 
                        className="w-12 h-12 rounded-full mr-3 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-green-100 text-green-800 flex items-center justify-center mr-3 font-bold">
                        {winner.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{winner.name}</div>
                      <div className="text-sm text-gray-500">@{winner.intra_name}</div>
                    </div>
                    <button 
                      type="button" 
                      className="ml-auto text-red-600"
                      onClick={() => setWinner(null)}
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <UserSearch 
                    onSelectUser={setWinner} 
                    placeholder="Search for winner..."
                    excludeUserId={loser?._id}
                  />
                )}
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Winner Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={winnerPoints}
                    onChange={(e) => setWinnerPoints(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
            
            {/* Loser */}
            <div className="card">
              <div className="card-header bg-red-50">
                <h3 className="text-lg font-semibold text-red-700">Loser</h3>
              </div>
              <div className="card-body">
                {loser ? (
                  <div className="flex items-center mb-4">
                    {loser.user_image ? (
                      <img 
                        src={loser.user_image} 
                        alt={loser.name} 
                        className="w-12 h-12 rounded-full mr-3 object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-100 text-red-800 flex items-center justify-center mr-3 font-bold">
                        {loser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{loser.name}</div>
                      <div className="text-sm text-gray-500">@{loser.intra_name}</div>
                    </div>
                    <button 
                      type="button" 
                      className="ml-auto text-red-600"
                      onClick={() => setLoser(null)}
                    >
                      Clear
                    </button>
                  </div>
                ) : (
                  <UserSearch 
                    onSelectUser={setLoser} 
                    placeholder="Search for loser..."
                    excludeUserId={winner?._id}
                  />
                )}
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loser Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={loserPoints}
                    onChange={(e) => setLoserPoints(parseInt(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Match details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">Match Details</h3>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline-block mr-1" size={16} />
                  Match Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="input"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  Record Result <ArrowRight className="ml-2" size={16} />
                </span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MatchRecordPage;