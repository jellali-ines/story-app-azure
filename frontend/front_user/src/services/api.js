import axios from 'axios';


// ========================== CONFIGURATION ==========================
// API Base URL - from environment variables or localhost
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
: 'https://backend.icyrock-9d46072c.italynorth.azurecontainerapps.io/api';// Create axios instance with default settings
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========================== INTERCEPTORS ==========================

// Request interceptor - for adding tokens or logging
apiClient.interceptors.request.use(
  (config) => {
    // You can add token here later
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    
    console.log(`API Request: ${config.method?.toUpperCase() || 'GET'} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - for unified error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.config.url}`, response.status);
    return response.data; // Return only data
  },
  (error) => {
    const errorMessage = error.response?.data || error.message;
    console.error('API Error:', errorMessage);
    
    // Add specific error handling here
    if (error.response?.status === 503) {
      console.error('🔌 Service Unavailable');
    }
    
    return Promise.reject(errorMessage);
  }
);

// ========================== STORIES API ==========================
export const storiesAPI = {
  getAll: () => apiClient.get('/stories'),
  getOne: (id) => apiClient.get(`/stories/${id}`),
  create: (data) => apiClient.post('/stories', data),
  update: (id, data) => apiClient.put(`/stories/${id}`, data),
  delete: (id) => apiClient.delete(`/stories/${id}`),
  toggleFavorite: (id) => apiClient.patch(`/stories/${id}/favorite`),
  incrementPlay: (id) => apiClient.patch(`/stories/${id}/play`),
};

// ========================== PLAYLISTS API ==========================
export const playlistsAPI = {
  getAll: (params) => apiClient.get('/playlists', { params }),
  getOne: (id) => apiClient.get(`/playlists/${id}`),
  create: (data) => apiClient.post('/playlists', data),
  update: (id, data) => apiClient.put(`/playlists/${id}`, data),
  delete: (id) => apiClient.delete(`/playlists/${id}`),
  toggleFavorite: (id) => apiClient.patch(`/playlists/${id}/favorite`),
  addStory: (id, storyId) => apiClient.post(`/playlists/${id}/stories`, { storyId }),
  
  // Helper functions
  getFavorites: () => apiClient.get('/playlists', { params: { isFavorite: true } }),
  getByFolder: (folderId) => apiClient.get('/playlists', { params: { folderId } }),
};

// ========================== FOLDERS API ==========================
export const foldersAPI = {
  getAll: () => apiClient.get('/folders'),
  getOne: (id) => apiClient.get(`/folders/${id}`),
  create: (data) => apiClient.post('/folders', data),
  update: (id, data) => apiClient.put(`/folders/${id}`, data),
  delete: (id) => apiClient.delete(`/folders/${id}`),
};

// ========================== GRAMMAR API ==========================
export const grammarAPI = {
  /**
   * Check grammar for a text
   * @param {string} text - Text to check
   * @returns {Promise} - Grammar check result
   */
  check: async (text) => {
    try {
      const response = await apiClient.post('/grammar/check', { text });
      return response;
    } catch (error) {
      throw error || { error: 'Failed to check grammar' };
    }
  },

  /**
   * Batch check grammar for multiple texts
   * @param {Array<string>} texts - Array of texts to check
   * @returns {Promise} - Batch check results
   */
  batchCheck: async (texts) => {
    try {
      const response = await apiClient.post('/grammar/batch', { texts });
      return response;
    } catch (error) {
      throw error || { error: 'Failed to batch check grammar' };
    }
  },
};

// ========================== EVALUATION API ==========================
export const evaluationAPI = {
  /**
   * Evaluate a story summary
   * @param {string} summary - Story summary to evaluate
   * @param {string} userId - Optional user ID
   * @returns {Promise} - Story evaluation result
   */
  evaluateStory: async (summary, userId = 'anonymous') => {
    try {
      const response = await apiClient.post('/story/evaluate', {
        summary,
        userId,
      });
      return response;
    } catch (error) {
      throw error || { error: 'Failed to evaluate story' };
    }
  },

  /**
   * Get the original story
   * @returns {Promise} - Original story and key points
   */
  getOriginalStory: async () => {
    try {
      const response = await apiClient.get('/story/original');
      return response;
    } catch (error) {
      throw error || { error: 'Failed to get original story' };
    }
  },

  /**
   * Get user statistics
   * @param {string} userId - User ID
   * @returns {Promise} - User statistics
   */
  getUserStatistics: async (userId) => {
    try {
      const response = await apiClient.get(`/evaluation/statistics/${userId}`);
      return response;
    } catch (error) {
      throw error || { error: 'Failed to get statistics' };
    }
  },

  /**
   * Get evaluation history
   * @param {string} userId - Optional user ID
   * @param {number} limit - Number of records to fetch
   * @param {number} offset - Offset for pagination
   * @param {string} type - Type of evaluation (grammar/story)
   * @returns {Promise} - Evaluation history
   */
  getHistory: async (userId = null, limit = 10, offset = 0, type = null) => {
    try {
      const params = { limit, offset };
      if (userId) params.userId = userId;
      if (type) params.type = type;
      
      const response = await apiClient.get('/evaluation/history', { params });
      return response;
    } catch (error) {
      throw error || { error: 'Failed to get history' };
    }
  },

  /**
   * Get overall statistics
   * @returns {Promise} - Overall statistics
   */
  getOverallStatistics: async () => {
    try {
      const response = await apiClient.get('/evaluation/statistics');
      return response;
    } catch (error) {
      throw error || { error: 'Failed to get overall statistics' };
    }
  },
};

// ========================== HEALTH CHECK ==========================
export const healthAPI = {
  /**
   * Check API health
   * @returns {Promise} - Health status
   */
  check: async () => {
    try {
      const response = await apiClient.get('/health');
      return response;
    } catch (error) {
      throw error || { error: 'Service unavailable' };
    }
  },
};

// ========================== DEFAULT EXPORT ==========================
// Export the API client for custom requests
export default apiClient;

// ========================== NAMED EXPORTS FOR COMPATIBILITY ==========================
// For backward compatibility with existing code
export const getAllStories = storiesAPI.getAll;
export const getStory = storiesAPI.getOne;
export const createStory = storiesAPI.create;
export const updateStory = storiesAPI.update;
export const deleteStory = storiesAPI.delete;

export const getAllPlaylists = playlistsAPI.getAll;
export const getPlaylist = playlistsAPI.getOne;
export const createPlaylist = playlistsAPI.create;
export const updatePlaylist = playlistsAPI.update;
export const deletePlaylist = playlistsAPI.delete;

export const getAllFolders = foldersAPI.getAll;
export const getFolder = foldersAPI.getOne;
export const createFolder = foldersAPI.create;
export const updateFolder = foldersAPI.update;
export const deleteFolder = foldersAPI.delete;