// Socket service for real-time communication with Socket.IO
import { io } from 'socket.io-client';
import { getAuthToken } from '../config';
import config from '../config';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.authToken = null;
    this.eventListeners = {};
    
    // For fallback to mock implementation
    this.useMockImplementation = import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_SOCKET;
    this.mockRooms = {};
    this.mockGameStates = {};
  }
  
  // Initialize socket connection
  initialize(authToken) {
    this.authToken = authToken || getAuthToken();
    
    if (config.useMock) {
      // Use mock implementation for local development without backend
      console.log('Using mock socket implementation');
      this.connected = true;
      
      // Mock connection event
      setTimeout(() => {
        this._triggerEvent('connect', {});
      }, 500);
      
      return this;
    }
    
    // Connect to the real Socket.IO server
    const socketUrl = config.socketUrl;
    
    // Clean up any existing connection
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.socket = io(socketUrl, { 
      auth: { token: this.authToken },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    // Handle socket connection
    this.socket.on('connect', () => {
      console.log('Socket connected with ID:', this.socket.id);
      this.connected = true;
      this._triggerEvent('connect', {});
    });
    
    // Handle socket disconnection
    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.connected = false;
      this._triggerEvent('disconnect', { reason });
    });
    
    // Handle socket error
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this._triggerEvent('error', { message: error.message });
    });
    
    // Set up event listeners for game events
    this._setupSocketEventListeners();
    
    return this;
  }
  
  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      // Disconnect from the real server or cleanup mock
      if (!config.useMock) {
        this.socket.disconnect();
      }
      this.socket = null;
    }
    
    this.connected = false;
    console.log('Socket disconnected');
  }
  
  // Join a game room
  joinRoom(roomId) {
    if (!this.connected) return;
    
    if (config.useMock) {
      console.log(`Joining room ${roomId} (mock)`);
      
      // Mock room join success
      if (!this.mockRooms[roomId]) {
        // Check if room exists in gameService localStorage data
        const storedRooms = localStorage.getItem('virus_game_rooms');
        const rooms = storedRooms ? JSON.parse(storedRooms) : {};
        
        // Initialize the mock room with data from localStorage if available
        this.mockRooms[roomId] = {
          players: rooms[roomId]?.players || [],
          messages: []
        };
      }
      
      // Mock successful room join
      setTimeout(() => {
        this._triggerEvent('roomJoined', { roomId });
      }, 300);
      
      return;
    }
    
    // Real implementation
    console.log(`Joining room ${roomId}`);
    this.socket.emit('joinRoom', { roomId });
  }
  
  // Leave a game room
  leaveRoom(roomId) {
    if (!this.connected) return;
    
    if (config.useMock) {
      console.log(`Leaving room ${roomId} (mock)`);
      
      // Clean up mock room data
      if (this.mockRooms[roomId]) {
        delete this.mockRooms[roomId];
      }
      return;
    }
    
    // Real implementation
    console.log(`Leaving room ${roomId}`);
    this.socket.emit('leaveRoom', { roomId });
  }
  
  // Set player ready status
  setReady(roomId) {
    if (!this.connected) return;
    
    if (config.useMock) {
      console.log('Player is ready (mock)');
      
      // Mock all other players becoming ready after a delay
      setTimeout(() => {
        this._triggerEvent('allPlayersReady', { roomId });
      }, 1500);
      return;
    }
    
    // Real implementation
    console.log('Player is ready');
    this.socket.emit('playerReady', { roomId });
  }
  
  // Start the game (host only)
  startGame(roomId) {
    if (!this.connected) return;
    
    if (config.useMock) {
      console.log('Starting game (mock)');
      
      // Mock game start
      setTimeout(() => {
        // Create mock initial game state
        const initialGameState = this._createMockGameState(roomId);
        this.mockGameStates[roomId] = initialGameState;
        
        this._triggerEvent('gameStarted', initialGameState);
        
        // Mock turn timer
        this._startMockTurnTimer(roomId);
      }, 800);
      return;
    }
    
    // Real implementation
    console.log('Starting game');
    this.socket.emit('startGame', { roomId });
  }
  
  // Play a card
  playCard(roomId, cardId, targetId, targetType) {
    if (!this.connected) return;
    
    if (config.useMock) {
      console.log(`Playing card ${cardId} on target ${targetId} (${targetType}) (mock)`);
      
      // Mock successful card play
      setTimeout(() => {
        // Update mock game state
        if (this.mockGameStates[roomId]) {
          const gameState = this.mockGameStates[roomId];
          
          // Mock removing card from hand
          gameState.hand = gameState.hand.filter(card => card.id !== cardId);
          
          // Mock drawing a new card
          const newCard = this._getRandomCard();
          gameState.hand.push(newCard);
          
          // Mock changing player turn
          const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayerId);
          const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
          gameState.currentPlayerId = gameState.players[nextPlayerIndex].id;
          gameState.turnTimeLeft = 60;
          
          // Add to last action
          gameState.lastAction = {
            playerId: gameState.currentPlayerId,
            action: 'playCard',
            cardId: cardId,
            targetId: targetId
          };
          
          // Notify about game state update
          this._triggerEvent('gameStateUpdate', gameState);
          
          // Notify about turn change
          this._triggerEvent('turnChange', {
            playerId: gameState.currentPlayerId,
            timeLeft: gameState.turnTimeLeft
          });
          
          // Reset turn timer
          this._startMockTurnTimer(roomId);
        }
      }, 300);
      return;
    }
    
    // Real implementation
    console.log(`Playing card ${cardId} on target ${targetId} (${targetType})`);
    this.socket.emit('playCard', { roomId, cardId, targetId, targetType });
  }
  
  // Send a chat message
  sendChatMessage(roomId, message) {
    if (!this.connected) return;
    
    if (config.useMock) {
      console.log(`Sending message to room ${roomId}: ${message} (mock)`);
      // In the mock implementation, the message will be handled by the client directly
      return;
    }
    
    // Real implementation
    console.log(`Sending message to room ${roomId}: ${message}`);
    this.socket.emit('chatMessage', { roomId, message });
  }
  
  // Register event listeners
  on(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
    this.eventListeners[event].push(callback);
    return this;
  }
  
  // Trigger events (internal method)
  _triggerEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        callback(data);
      });
    }
  }
  
  // Create a mock game state for local development
  _createMockGameState(roomId) {
    // Mock player data
    const players = [
      {
        id: 'player-1',
        username: 'Jugador 1',
        avatarUrl: '/assets/images/avatars/default-1.png',
        isHost: true,
        organs: []
      },
      {
        id: 'player-2',
        username: 'Jugador 2',
        avatarUrl: '/assets/images/avatars/default-2.png',
        isHost: false,
        organs: []
      },
      {
        id: 'player-3',
        username: 'Jugador 3',
        avatarUrl: '/assets/images/avatars/default-3.png',
        isHost: false,
        organs: []
      }
    ];
    
    // Create a mock initial hand
    const hand = [
      this._getRandomCard(),
      this._getRandomCard(),
      this._getRandomCard()
    ];
    
    return {
      roomId,
      players,
      currentPlayerId: players[0].id,
      turnTimeLeft: 60,
      hand,
      lastAction: null
    };
  }
  
  // Get a random card for mock gameplay
  _getRandomCard() {
    const cardTypes = ['organ', 'virus', 'medicine', 'treatment'];
    const type = cardTypes[Math.floor(Math.random() * cardTypes.length)];
    
    const colors = ['blue', 'red', 'green', 'yellow'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const id = `${type}-${color}-${Math.floor(Math.random() * 1000)}`;
    
    return {
      id,
      type,
      color,
      name: `${type === 'organ' ? 'Órgano' : type === 'virus' ? 'Virus' : 'Medicina'} ${color === 'blue' ? 'Azul' : color === 'red' ? 'Rojo' : color === 'green' ? 'Verde' : 'Amarillo'}`,
      imageUrl: `/assets/images/cards/${type}-${color}.png`
    };
  }
  
  // Setup socket event listeners for real-time game events
  _setupSocketEventListeners() {
    if (!this.socket) return;
    
    // Room events
    this.socket.on('roomJoined', (data) => {
      console.log('Room joined:', data);
      this._triggerEvent('roomJoined', data);
    });
    
    this.socket.on('roomInfo', (data) => {
      console.log('Room info received:', data);
      this._triggerEvent('roomInfo', data);
    });
    
    this.socket.on('playerJoined', (data) => {
      console.log('Player joined:', data);
      this._triggerEvent('playerJoined', data);
    });
    
    this.socket.on('playerLeft', (data) => {
      console.log('Player left:', data);
      this._triggerEvent('playerLeft', data);
    });
    
    this.socket.on('playerReady', (data) => {
      console.log('Player ready:', data);
      this._triggerEvent('playerReady', data);
    });
    
    this.socket.on('allPlayersReady', (data) => {
      console.log('All players ready:', data);
      this._triggerEvent('allPlayersReady', data);
    });
    
    // Game events
    this.socket.on('gameStarted', (data) => {
      console.log('Game started:', data);
      this._triggerEvent('gameStarted', data);
    });
    
    this.socket.on('gameStateUpdate', (data) => {
      console.log('Game state updated');
      this._triggerEvent('gameStateUpdate', data);
    });
    
    this.socket.on('turnChange', (data) => {
      console.log('Turn changed:', data);
      this._triggerEvent('turnChange', data);
    });
    
    this.socket.on('timerUpdate', (data) => {
      this._triggerEvent('timerUpdate', data);
    });
    
    this.socket.on('cardPlayed', (data) => {
      console.log('Card played:', data);
      this._triggerEvent('cardPlayed', data);
    });
    
    this.socket.on('gameOver', (data) => {
      console.log('Game over:', data);
      this._triggerEvent('gameOver', data);
    });
    
    // Chat events
    this.socket.on('chatMessage', (data) => {
      console.log('Chat message received');
      this._triggerEvent('chatMessage', data);
    });
  }
  
  // Mock turn timer logic
  _startMockTurnTimer(roomId) {
    // Clear any existing timer
    if (this.turnTimer) {
      clearInterval(this.turnTimer);
    }
    
    // Get game state
    const gameState = this.mockGameStates[roomId];
    if (!gameState) return;
    
    // Set initial time
    gameState.turnTimeLeft = 60;
    
    // Start timer
    this.turnTimer = setInterval(() => {
      gameState.turnTimeLeft -= 1;
      
      // Emit timer update
      this._triggerEvent('timerUpdate', gameState.turnTimeLeft);
      
      // End turn when timer expires
      if (gameState.turnTimeLeft <= 0) {
        clearInterval(this.turnTimer);
        
        // Change turn
        const currentPlayerIndex = gameState.players.findIndex(p => p.id === gameState.currentPlayerId);
        const nextPlayerIndex = (currentPlayerIndex + 1) % gameState.players.length;
        gameState.currentPlayerId = gameState.players[nextPlayerIndex].id;
        gameState.turnTimeLeft = 60;
        
        // Emit turn change
        this._triggerEvent('turnChange', {
          playerId: gameState.currentPlayerId,
          timeLeft: gameState.turnTimeLeft
        });
        
        // Restart timer
        this._startMockTurnTimer(roomId);
      }
    }, 1000);
  }
  
  // Event listener methods for the client to use
  
  onPlayerJoined(callback) {
    return this.on('playerJoined', callback);
  }
  
  onPlayerLeft(callback) {
    return this.on('playerLeft', callback);
  }
  
  onGameStarted(callback) {
    return this.on('gameStarted', callback);
  }
  
  onGameStateUpdate(callback) {
    return this.on('gameStateUpdate', callback);
  }
  
  onTurnChange(callback) {
    return this.on('turnChange', callback);
  }
  
  onTimerUpdate(callback) {
    return this.on('timerUpdate', callback);
  }
  
  onGameEnded(callback) {
    return this.on('gameEnded', callback);
  }
  
  onChatMessage(callback) {
    return this.on('chatMessage', callback);
  }
  
  onError(callback) {
    return this.on('error', callback);
  }
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService;