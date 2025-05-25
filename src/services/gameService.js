// Game Service for handling game-related API calls
// This is a mock implementation for local development
// In a production environment, this would connect to a real API

class GameService {
  constructor() {
    // Mock data store for local development
    this.rooms = {};
    this.nextRoomId = 1;
  }
  
  // Create a new game room
  async createRoom(authToken, name, isPrivate = true, maxPlayers = 6) {
    // Simulate API call delay
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
    
    return {
      roomId: room.roomId,
      name: room.name,
      inviteCode: room.inviteCode,
      isPrivate: room.isPrivate,
      maxPlayers: room.maxPlayers
    };
  }
  
  // Join an existing room by invite code
  async joinRoom(authToken, inviteCode) {
    // Simulate API call delay
    await this._delay(700);
    
    // Find room with matching invite code
    const room = Object.values(this.rooms).find(r => r.inviteCode === inviteCode);
    
    if (!room) {
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
  
  // Get list of available public rooms
  async getPublicRooms(authToken) {
    // Simulate API call delay
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
  
  // Get details about a specific room
  async getRoomDetails(authToken, roomId) {
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
  
  // Get game statistics for a user
  async getUserStats(authToken, userId) {
    // Simulate API call delay
    await this._delay(400);
    
    // Return mock statistics
    return {
      gamesPlayed: Math.floor(Math.random() * 50),
      gamesWon: Math.floor(Math.random() * 25),
      winRate: Math.floor(Math.random() * 100),
      lastPlayed: new Date().toISOString()
    };
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
}

// Create and export singleton instance
const gameService = new GameService();
export default gameService;