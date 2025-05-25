import React, { createContext, useState, useEffect, useContext } from 'react';

// Create context for authentication
const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);
  const [error, setError] = useState('');

  // Check for stored auth data on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('virusUser');
    const storedToken = localStorage.getItem('virusToken');
    
    if (storedUser && storedToken) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setAuthToken(storedToken);
      } catch (e) {
        // Handle malformed stored data
        localStorage.removeItem('virusUser');
        localStorage.removeItem('virusToken');
      }
    }
    
    setLoading(false);
  }, []);

  // For the MVP version, we'll use localStorage for authentication
  // In a production environment, this would connect to a backend auth service
  
  // Register a new user
  const register = async (username, email, password) => {
    setError('');
    try {
      // In a real implementation, this would be an API call
      // For now, just validate and create a local user
      
      // Check if username already exists
      const existingUsers = JSON.parse(localStorage.getItem('virusUsers') || '[]');
      if (existingUsers.some(user => user.email === email)) {
        throw new Error('El correo electrónico ya está registrado');
      }
      if (existingUsers.some(user => user.username === username)) {
        throw new Error('El nombre de usuario ya está en uso');
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        username,
        email,
        avatarUrl: `/assets/images/avatars/default-${Math.floor(Math.random() * 6) + 1}.png`,
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          winRate: 0,
        },
        friends: []
      };
      
      // Store in "database"
      existingUsers.push({
        ...newUser,
        passwordHash: btoa(password) // Simple encoding, NOT secure for production
      });
      localStorage.setItem('virusUsers', JSON.stringify(existingUsers));
      
      // Generate token (in real app this would be JWT)
      const token = btoa(`${newUser.id}:${Date.now()}`);
      
      // Save authenticated user data
      setCurrentUser(newUser);
      setAuthToken(token);
      localStorage.setItem('virusUser', JSON.stringify(newUser));
      localStorage.setItem('virusToken', token);
      
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Log in existing user
  const login = async (email, password) => {
    setError('');
    try {
      // In a real implementation, this would be an API call
      const existingUsers = JSON.parse(localStorage.getItem('virusUsers') || '[]');
      
      // Find user by email
      const user = existingUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('Correo electrónico o contraseña incorrectos');
      }
      
      // Check password
      if (user.passwordHash !== btoa(password)) {
        throw new Error('Correo electrónico o contraseña incorrectos');
      }
      
      // Login successful, generate token
      const token = btoa(`${user.id}:${Date.now()}`);
      
      // Prepare user data without password
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        stats: user.stats,
        friends: user.friends
      };
      
      // Save authenticated user data
      setCurrentUser(userData);
      setAuthToken(token);
      localStorage.setItem('virusUser', JSON.stringify(userData));
      localStorage.setItem('virusToken', token);
      
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Log out the user
  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('virusUser');
    localStorage.removeItem('virusToken');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setError('');
    try {
      // In a real implementation, this would be an API call
      if (!currentUser) throw new Error('No hay usuario autenticado');
      
      const existingUsers = JSON.parse(localStorage.getItem('virusUsers') || '[]');
      const userIndex = existingUsers.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) throw new Error('Usuario no encontrado');
      
      // Update user data
      const updatedUser = {
        ...existingUsers[userIndex],
        ...userData,
        // Don't let them update these directly
        id: currentUser.id,
        email: currentUser.email,
        stats: currentUser.stats
      };
      
      // Update in "database"
      existingUsers[userIndex] = updatedUser;
      localStorage.setItem('virusUsers', JSON.stringify(existingUsers));
      
      // Update current user
      const updatedCurrentUser = {
        ...currentUser,
        ...userData,
        id: currentUser.id,
        email: currentUser.email,
        stats: currentUser.stats
      };
      
      setCurrentUser(updatedCurrentUser);
      localStorage.setItem('virusUser', JSON.stringify(updatedCurrentUser));
      
      return updatedCurrentUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Add a friend
  const addFriend = async (friendId) => {
    setError('');
    try {
      if (!currentUser) throw new Error('No hay usuario autenticado');
      
      // Don't add yourself
      if (friendId === currentUser.id) {
        throw new Error('No puedes añadirte a ti mismo como amigo');
      }
      
      // Check if already a friend
      if (currentUser.friends.includes(friendId)) {
        throw new Error('Este usuario ya es tu amigo');
      }
      
      // Update friends list
      const updatedFriends = [...currentUser.friends, friendId];
      const updatedUser = { ...currentUser, friends: updatedFriends };
      
      // Update in local storage
      const existingUsers = JSON.parse(localStorage.getItem('virusUsers') || '[]');
      const userIndex = existingUsers.findIndex(u => u.id === currentUser.id);
      
      if (userIndex === -1) throw new Error('Usuario no encontrado');
      
      existingUsers[userIndex].friends = updatedFriends;
      localStorage.setItem('virusUsers', JSON.stringify(existingUsers));
      
      // Update current user
      setCurrentUser(updatedUser);
      localStorage.setItem('virusUser', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get friends list with full user data
  const getFriendsList = async () => {
    setError('');
    try {
      if (!currentUser) throw new Error('No hay usuario autenticado');
      
      const existingUsers = JSON.parse(localStorage.getItem('virusUsers') || '[]');
      
      // Filter users by friend IDs
      const friends = existingUsers
        .filter(user => currentUser.friends.includes(user.id))
        .map(user => ({
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
          stats: user.stats
        }));
      
      return friends;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Get user statistics
  const getUserStats = async () => {
    try {
      if (!currentUser) throw new Error('No hay usuario autenticado');
      
      // In a real implementation, this would fetch from the server
      return currentUser.stats;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Value to provide in context
  const value = {
    currentUser,
    authToken,
    error,
    loading,
    register,
    login,
    logout,
    updateProfile,
    addFriend,
    getFriendsList,
    getUserStats
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;