import axios from 'axios';
import { 
  SignInRequest, 
  SignUpRequest, 
  UserResponse, 
  CategoryResponse, 
  RatingResponse, 
  MatchResponse,
  MatchResultCreate
} from '../types';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Use environment variable for API URL
  headers: {
    'Content-Type': 'application/json',
  }
});

// Authentication services
export const authService = {
  signIn: async (credentials: SignInRequest): Promise<UserResponse> => {
    const response = await api.post('/auth/signin', credentials);
    return response.data;
  },
  
  signUp: async (userData: SignUpRequest): Promise<UserResponse> => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  }
};

// User services
export const userService = {
  getUser: async (userId: string): Promise<UserResponse> => {
    const response = await api.post(`/user/${userId}`);
    return response.data;
  },
  
  searchUsers: async (searchKey?: string): Promise<UserResponse[]> => {
    const response = await api.get('/user', {
      params: { key: searchKey }
    });
    return response.data;
  },
  
  updateUser: async (userId: string, userData: Partial<UserResponse>): Promise<UserResponse> => {
    const response = await api.put(`/user/${userId}`, userData);
    return response.data;
  }
};

// Category services
export const categoryService = {
  getCategory: async (categoryId: string): Promise<CategoryResponse> => {
    const response = await api.get(`/category/${categoryId}`);
    return response.data;
  }
};

// Rating services
export const ratingService = {
  getUserCategoryRating: async (userId: string, categoryId: string): Promise<RatingResponse> => {
    const response = await api.get(`/rating/user/${userId}/category/${categoryId}`);
    return response.data;
  }
};

// Match services
export const matchService = {
  getUserMatches: async (userId: string): Promise<MatchResponse[]> => {
    const response = await api.get(`/match/user/${userId}`);
    return response.data;
  },
  
  getCategoryMatches: async (categoryId: string): Promise<MatchResponse[]> => {
    const response = await api.get(`/match/category/${categoryId}`);
    return response.data;
  },
  
  createMatch: async (matchData: MatchResultCreate): Promise<void> => {
    await api.post('/result', matchData);
  }
};

// Ranking services
export const rankingService = {
  getCategoryRanking: async (categoryId: string): Promise<any> => {
    const response = await api.get(`/ranking/category/${categoryId}`);
    return response.data;
  }
};

export default api;