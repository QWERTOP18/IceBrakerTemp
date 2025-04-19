import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { EnhancedMatch } from '../../types';
import MatchList from './MatchList';

interface RecentMatchesSectionProps {
  matches: EnhancedMatch[];
}

const RecentMatchesSection: React.FC<RecentMatchesSectionProps> = ({ matches }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        <Activity className="mr-2 text-indigo-600" size={24} />
        Recent Activity
      </h2>
      
      <MatchList matches={matches} />
      
      <div className="mt-4 text-center">
        <Link to="/result" className="btn btn-primary">
          Record New Match
        </Link>
      </div>
    </div>
  );
};

export default RecentMatchesSection;
