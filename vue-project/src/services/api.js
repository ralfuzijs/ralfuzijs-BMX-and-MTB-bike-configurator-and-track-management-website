/**
 * API Service for making requests to the backend
 */

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Make a fetch request to the API
 * @param {string} endpoint - The API endpoint (e.g., '/api/tracks')
 * @param {Object} options - Fetch options (method, headers, body)
 * @returns {Promise<any>} - The response data
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  console.log(`API Request to ${endpoint}`, options);
  
  // Set default headers if not provided
  if (!options.headers) {
    options.headers = {
      'Content-Type': 'application/json'
    };
  }
  
  // Add authorization header if token exists
  const token = localStorage.getItem('user_token');
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(`API Response from ${endpoint}:`, data);
    
    // Check for successful response
    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return {
      success: false,
      error: error.message || 'API Request Failed'
    };
  }
}

// Track-related API calls
export const trackApi = {
  // Get all tracks
  getAllTracks: () => apiRequest('/api/tracks'),
  
  // Get a single track
  getTrack: (id) => apiRequest(`/api/tracks/${id}`),
  
  // Create a new track
  createTrack: (trackData) => apiRequest('/api/tracks', {
    method: 'POST',
    body: JSON.stringify(trackData)
  }),
  
  // Update a track
  updateTrack: (id, trackData) => apiRequest(`/api/tracks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(trackData)
  }),
  
  // Delete a track
  deleteTrack: (id) => apiRequest(`/api/tracks/${id}`, {
    method: 'DELETE'
  })
};

// User-related API calls
export const userApi = {
  // Register a new user
  register: (userData) => apiRequest('/api/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  // Login user (now uses username instead of email)
  login: (credentials) => apiRequest('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  // Get user profile
  getProfile: () => apiRequest('/api/users/profile'),
  
  // Get user profile (alias for consistency)
  getUserProfile: () => apiRequest('/api/users/profile'),
  
  // Update user profile
  updateProfile: (userData) => apiRequest('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  
  // Update user profile (alias for consistency)
  updateUserProfile: (userData) => apiRequest('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  
  // Delete own account
  deleteOwnAccount: () => apiRequest('/api/users/profile/delete', {
    method: 'DELETE'
  }),
  
  // Admin functions for user management
  getAllUsers: () => apiRequest('/api/users'),
  
  getUserById: (id) => apiRequest(`/api/users/${id}`),
  
  updateUser: (id, userData) => apiRequest(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  }),
  
  deleteUser: (id) => apiRequest(`/api/users/${id}`, {
    method: 'DELETE'
  })
};

// New track favorites API calls
export const favoritesApi = {
  // Get all favorites for the current user
  getAllFavorites: () => apiRequest('/api/favorites'),
  
  // Add a track to favorites
  addFavorite: (trackId) => apiRequest('/api/favorites', {
    method: 'POST',
    body: JSON.stringify({ trackId })
  }),
  
  // Remove a track from favorites
  removeFavorite: (trackId) => apiRequest(`/api/favorites/${trackId}`, {
    method: 'DELETE'
  }),
    // Check if a track is in user's favorites
  checkFavorite: (trackId) => apiRequest(`/api/favorites/check/${trackId}`)
};

// Bike Size Calculator API calls
export const bikeSizeAPI = {
  // Calculate bike size (public endpoint)
  calculateSize: (height, bikeType = 'BMX') => apiRequest('/api/bike-size/calculate', {
    method: 'POST',
    body: JSON.stringify({ height, bikeType })
  }),
  
  // Save calculation for logged-in user
  saveCalculation: (height, bikeType = 'BMX') => apiRequest('/api/bike-size/save', {
    method: 'POST',
    body: JSON.stringify({ height, bikeType })
  }),
  
  // Get user's saved calculations
  getUserCalculations: () => apiRequest('/api/bike-size/my-calculations'),
  
  // Delete a calculation
  deleteCalculation: (id) => apiRequest(`/api/bike-size/${id}`, {
    method: 'DELETE'
  })
};

// Review API calls
export const reviewApi = {
  // Get all reviews for a track
  getTrackReviews: (trackId) => apiRequest(`/api/reviews/track/${trackId}`),
  
  // Get review statistics for a track
  getTrackStats: (trackId) => apiRequest(`/api/reviews/track/${trackId}/stats`),
  
  // Get user's review for a track
  getUserReview: (trackId) => apiRequest(`/api/reviews/track/${trackId}/user`),
  
  // Add a new review
  addReview: (reviewData) => apiRequest('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),
  
  // Update a review
  updateReview: (reviewId, reviewData) => apiRequest(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(reviewData)
  }),
  
  // Delete a review
  deleteReview: (reviewId) => apiRequest(`/api/reviews/${reviewId}`, {
    method: 'DELETE'
  })
};
