// API Response Types
export interface UserResponse {
  _id: string;
  name: string;
  intra_name: string;
  email: string;
  user_image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryResponse {
  _id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  image?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RatingResponse {
  _id: string;
  user_id: string;
  category_id: string;
  rate: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface MatchResponse {
  _id: string;
  winner_id: string;
  loser_id: string;
  category_id: string;
  winner_point: number;
  loser_point: number;
  date: string;
  created_at: string;
  updated_at: string;
}

// Request Types
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  intra_name: string;
  email: string;
  password: string;
  user_image?: string | null;
}

export interface MatchResultCreate {
  winner_id: string;
  loser_id: string;
  category_id: string;
  winner_point: number;
  loser_point: number;
  date?: string;
}

// Application specific types
export interface UserRating {
  categoryId: string;
  categoryName: string;
  rating: number;
  rank?: number;
  winRate?: number;
  color?: string;
}

export interface RankingItem {
  userId: string;
  userName: string;
  userImage?: string;
  intraName: string;
  rating: number;
  rank: number;
}

export interface UserRatingHistory {
  date: string;
  rating: number;
}

export interface UserWinLoss {
  wins: number;
  losses: number;
  winRate: number;
}

export interface EnhancedMatch extends MatchResponse {
  opponentName: string;
  opponentImage?: string | null;
  categoryName: string;
  isWinner: boolean;
  ratingChange?: number;
}

export interface AppContext {
  currentUser: UserResponse | null;
  setCurrentUser: (user: UserResponse | null) => void;
  isAuthenticated: boolean;
  login: (credentials: SignInRequest) => Promise<void>;
  signup: (userData: SignUpRequest) => Promise<void>;
  logout: () => void;
}

export interface CategoryOption {
  id: string;
  name: string;
  color?: string;
}