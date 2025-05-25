// Central configuration module for the application
// Loads environment variables based on the current environment

/**
 * Game configuration settings
 */
export const config = {
  // API and Socket URLs
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL || window.location.origin,
  
  // Game settings
  turnTimer: parseInt(import.meta.env.VITE_TURN_TIMER || '60', 10),
  maxPlayers: parseInt(import.meta.env.VITE_MAX_PLAYERS || '6', 10),
  
  // Development mode settings
  useMock: import.meta.env.VITE_USE_MOCK === 'true',
  
  // Authentication settings
  tokenKey: 'virus_auth_token',
  userKey: 'virus_user_data',
  
  // Game assets
  assetPath: '/assets',
  cardImages: '/assets/images/cards',
  avatarImages: '/assets/images/avatars',
  
  // URLs for routes
  routes: {
    home: '/',
    login: '/login',
    register: '/register',
    lobby: '/lobby',
    room: '/room',
    game: '/game',
    profile: '/profile'
  }
};

/**
 * Utility function to get the authentication token from localStorage
 */
export const getAuthToken = () => {
  return localStorage.getItem(config.tokenKey);
};

/**
 * Utility function to get the current user data from localStorage
 */
export const getCurrentUser = () => {
  const userData = localStorage.getItem(config.userKey);
  return userData ? JSON.parse(userData) : null;
};

/**
 * Utility function to set the authentication token and user data
 */
export const setAuth = (token, userData) => {
  localStorage.setItem(config.tokenKey, token);
  localStorage.setItem(config.userKey, JSON.stringify(userData));
};

/**
 * Utility function to clear authentication data (logout)
 */
export const clearAuth = () => {
  localStorage.removeItem(config.tokenKey);
  localStorage.removeItem(config.userKey);
};

export default config;