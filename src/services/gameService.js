// Game Service for handling game-related API calls
import axios from 'axios';
import config from '../config';

class GameService {
  constructor() {
    // Load rooms and roomId from localStorage if available
    const storedRooms = localStorage.getItem('virus_game_rooms');
    const storedNextRoomId = localStorage.getItem('virus_game_nextRoomId');
    
    // Mock data store for local development
    this.rooms = storedRooms ? JSON.parse(storedRooms) : {};
    this.nextRoomId = storedNextRoomId ? parseInt(storedNextRoomId, 10) : 1;
  }
  
  // Sync with localStorage to ensure rooms are up to date
  syncWithLocalStorage() {
    try {
      const storedRooms = localStorage.getItem('virus_game_rooms');
      const storedNextRoomId = localStorage.getItem('virus_game_nextRoomId');
      
      if (storedRooms) {
        this.rooms = JSON.parse(storedRooms);
      }
      
      if (storedNextRoomId) {
        this.nextRoomId = parseInt(storedNextRoomId, 10);
      }
      
      console.log('GameService synced with localStorage:', this.rooms);
      return true;
    } catch (error) {
      console.error('Error syncing with localStorage:', error);
      return false;
    }
  }

  // Create a new game room
  async createRoom(authToken, name, isPrivate = true, maxPlayers = 6) {
    try {
      if (config.useMock) {
        // Use mock implementation for development
        this.syncWithLocalStorage();
        await this._delay(600);
        
        // Generate room ID and invite code
        const roomId = `room-${this.nextRoomId++}`;
        const inviteCode = this._generateInviteCode();
        
        // Create the room
        const room = {
          roomId,
          name: name || `Sala ${roomId}`,
          inviteCode,
          isPrivate,
          maxPlayers,
          players: [],
          gameStarted: false,
          createdAt: new Date().toISOString()
        };
        
        // Store the room
        this.rooms[roomId] = room;
        
        // Save to localStorage for persistence
        this._saveRoomsToStorage();
        
        return {
          roomId: room.roomId,
          name: room.name,
          inviteCode: room.inviteCode,
          isPrivate: room.isPrivate,
          maxPlayers: room.maxPlayers
        };
      }
      
      // Real implementation - connect to backend API
      const response = await axios.post(`${config.apiUrl}/rooms`, {
        name: name || 'New Game Room',
        isPrivate,
        maxPlayers
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw new Error(error.response?.data?.message || 'Failed to create room');
    }
  }
  
  // Join an existing room by invite code
  async joinRoom(authToken, inviteCode) {
    try {
      if (config.useMock) {
        // Mock implementation for development
        this.syncWithLocalStorage();
        await this._delay(700);
        
        // Log debugging information
        console.log('Attempting to join room with code:', inviteCode);
        console.log('Available rooms in store:', this.rooms);
        console.log('Available room IDs:', Object.keys(this.rooms));
        console.log('Available invite codes:', Object.values(this.rooms).map(r => r.inviteCode));
        
        // Find room with matching invite code
        const room = Object.values(this.rooms).find(r => r.inviteCode === inviteCode);
        
        if (!room) {
          console.error('Room not found for code:', inviteCode);
          console.log('Available rooms:', Object.keys(this.rooms));
          
          // Additional debug info - check if localStorage might have different data
          const storedRooms = localStorage.getItem('virus_game_rooms');
          if (storedRooms) {
            const parsedRooms = JSON.parse(storedRooms);
            console.log('Rooms in localStorage:', parsedRooms);
            console.log('Invite codes in localStorage:', 
              Object.values(parsedRooms).map(r => r.inviteCode));
          }
          
          throw new Error('No se encontró la sala con ese código de invitación');
        }
        
        if (room.players.length >= room.maxPlayers) {
          throw new Error('La sala está llena');
        }
        
        if (room.gameStarted) {
          throw new Error('La partida ya ha comenzado');
        }
        
        return {
          roomId: room.roomId,
          name: room.name,
          inviteCode: room.inviteCode,
          isPrivate: room.isPrivate,
          players: room.players
        };
      }
      
      // Real implementation - connect to backend API
      const response = await axios.post(`${config.apiUrl}/rooms/join`, {
        inviteCode
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error joining room:', error);
      throw new Error(error.response?.data?.message || 'Failed to join room');
    }
  }
  
  // Get list of available public rooms
  async getPublicRooms(authToken) {
    try {
      if (config.useMock) {
        // Mock implementation for development
        this.syncWithLocalStorage();
        await this._delay(500);
        
        // Filter public rooms that haven't started yet
        const publicRooms = Object.values(this.rooms).filter(room => 
          !room.isPrivate && 
          !room.gameStarted && 
          room.players.length < room.maxPlayers
        );
        
        // Add some mock rooms if there are none
        if (publicRooms.length === 0) {
          const mockRooms = [
            {
              roomId: 'public-1',
              name: 'Sala Pública 1',
              inviteCode: this._generateInviteCode(),
              isPrivate: false,
              maxPlayers: 6,
              players: [
                { id: 'mock-user-1', username: 'Jugador1', avatarUrl: '/assets/images/avatars/default-1.png' },
                { id: 'mock-user-2', username: 'Jugador2', avatarUrl: '/assets/images/avatars/default-2.png' }
              ],
              gameStarted: false,
              createdAt: new Date().toISOString()
            },
            {
              roomId: 'public-2',
              name: 'Sala Pública 2',
              inviteCode: this._generateInviteCode(),
              isPrivate: false,
              maxPlayers: 4,
              players: [
                { id: 'mock-user-3', username: 'Jugador3', avatarUrl: '/assets/images/avatars/default-3.png' }
              ],
              gameStarted: false,
              createdAt: new Date().toISOString()
            },
            {
              roomId: 'public-3',
              name: 'Sala Pública 3',
              inviteCode: this._generateInviteCode(),
              isPrivate: false,
              maxPlayers: 6,
              players: [
                { id: 'mock-user-4', username: 'Jugador4', avatarUrl: '/assets/images/avatars/default-4.png' },
                { id: 'mock-user-5', username: 'Jugador5', avatarUrl: '/assets/images/avatars/default-5.png' },
                { id: 'mock-user-6', username: 'Jugador6', avatarUrl: '/assets/images/avatars/default-6.png' }
              ],
              gameStarted: false,
              createdAt: new Date().toISOString()
            }
          ];
          
          return mockRooms.map(room => ({
            roomId: room.roomId,
            name: room.name,
            players: room.players.length,
            maxPlayers: room.maxPlayers,
            createdAt: room.createdAt
          }));
        }
        
        return publicRooms.map(room => ({
          roomId: room.roomId,
          name: room.name,
          players: room.players.length,
          maxPlayers: room.maxPlayers,
          createdAt: room.createdAt
        }));
      }
      
      // Real implementation - connect to backend API
      const response = await axios.get(`${config.apiUrl}/rooms/public`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching public rooms:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch public rooms');
    }
  }
  
  // Get details about a specific room
  async getRoomDetails(authToken, roomId) {
    try {
      if (config.useMock) {
        // Mock implementation for development
        this.syncWithLocalStorage();
        
        // Simulate API call delay
        await this._delay(300);
        
        const room = this.rooms[roomId];
        
        if (!room) {
          throw new Error('Sala no encontrada');
        }
        
        return {
          roomId: room.roomId,
          name: room.name,
          inviteCode: room.inviteCode,
          isPrivate: room.isPrivate,
          maxPlayers: room.maxPlayers,
          players: room.players,
          gameStarted: room.gameStarted
        };
      }
      
      // Real implementation - connect to backend API
      const response = await axios.get(`${config.apiUrl}/rooms/${roomId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching room details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch room details');
    }
  }
  
  // Get game statistics for a user
  async getUserStats(authToken, userId) {
    try {
      if (config.useMock) {
        // Mock implementation for development
        await this._delay(400);
        
        // Return mock statistics
        return {
          gamesPlayed: Math.floor(Math.random() * 50),
          gamesWon: Math.floor(Math.random() * 25),
          winRate: Math.floor(Math.random() * 100),
          lastPlayed: new Date().toISOString()
        };
      }
      
      // Real implementation - connect to backend API
      const response = await axios.get(`${config.apiUrl}/users/${userId}/stats`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch user statistics');
    }
  }
  
  // Utility method to generate a random invite code
  _generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }
  
  // Utility method to simulate network delay
  async _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Save rooms data to localStorage
  _saveRoomsToStorage() {
    try {
      localStorage.setItem('virus_game_rooms', JSON.stringify(this.rooms));
      localStorage.setItem('virus_game_nextRoomId', this.nextRoomId.toString());
    } catch (error) {
      console.error('Error saving rooms to localStorage:', error);
    }
  }
  
  // Start a game in a room
  async startGame(authToken, roomId) {
    try {
      if (config.useMock) {
        // Mock implementation for development
        // Always sync with localStorage first to ensure we have the latest rooms
        this.syncWithLocalStorage();
        
        // Simulate API call delay
        await this._delay(800);
        
        const room = this.rooms[roomId];
        
        if (!room) {
          throw new Error('Room not found');
        }
        
        if (room.players.length < 2) {
          throw new Error('Not enough players to start the game');
        }
        
        if (room.gameStarted) {
          throw new Error('Game already started');
        }
        
        // Update room state to indicate game has started
        room.gameStarted = true;
        this._saveRoomsToStorage();
        
        return {
          gameId: `game-${roomId}`,
          roomId,
          players: room.players,
          startedAt: new Date().toISOString()
        };
      }
      
      // Real implementation - connect to backend API
      const response = await axios.post(`${config.apiUrl}/games/start`, {
        roomId
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error starting game:', error);
      throw new Error(error.response?.data?.message || 'Failed to start the game');
    }
  }
}

// Create and export singleton instance
const gameService = new GameService();
export default gameService;