// Socket service for real-time communication using mock implementation
// In a production environment, this would connect to a real WebSocket server

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.authToken = null;
    this.eventListeners = {};
    
    // Mock room data for local development
    this.mockRooms = {};
    this.mockGameStates = {};
  }
  
  // Initialize socket connection
  initialize(authToken) {
    this.authToken = authToken;
    
    // In a production implementation, this would connect to a real WebSocket server
    // e.g., this.socket = io('https://api.virus-game.com', { auth: { token: authToken } });
    
    console.log('Socket initialized with auth token');
    this.connected = true;
    
    // Mock connection event
    setTimeout(() => {
      this._triggerEvent('connect', {});
    }, 500);
    
    return this;
  }
  
  // Disconnect from socket server
  disconnect() {
    if (this.socket) {
      // In real implementation: this.socket.disconnect();
      this.socket = null;
    }
    
    this.connected = false;
    console.log('Socket disconnected');
  }
  
  // Join a game room
  joinRoom(roomId) {
    if (!this.connected) return;
    
    // In real implementation: this.socket.emit('joinRoom', { roomId });
    console.log(`Joining room ${roomId}`);
    
    // Mock room join success
    if (!this.mockRooms[roomId]) {
      this.mockRooms[roomId] = {
        players: [],
        messages: []
      };
    }
    
    // Mock successful room join
    setTimeout(() => {
      this._triggerEvent('roomJoined', { roomId });
    }, 300);
  }
  
  // Leave a game room
  leaveRoom(roomId) {
    if (!this.connected) return;
    
    // In real implementation: this.socket.emit('leaveRoom', { roomId });
    console.log(`Leaving room ${roomId}`);
    
    // Clean up mock room data
    if (this.mockRooms[roomId]) {
      delete this.mockRooms[roomId];
    }
  }
  
  // Set player ready status
  setReady(roomId) {
    if (!this.connected) return;
    
    // In real implementation: this.socket.emit('playerReady', { roomId });
    console.log('Player is ready');
    
    // Mock all other players becoming ready after a delay
    setTimeout(() => {
      this._triggerEvent('allPlayersReady', { roomId });
    }, 1500);
  }
  
  // Start the game (host only)
  startGame(roomId) {
    if (!this.connected) return;
    
    // In real implementation: this.socket.emit('startGame', { roomId });
    console.log('Starting game');
    
    // Mock game start
    setTimeout(() => {
      // Create mock initial game state
      const initialGameState = this._createMockGameState(roomId);
      this.mockGameStates[roomId] = initialGameState;
      
      this._triggerEvent('gameStarted', initialGameState);
      
      // Mock turn timer
      this._startMockTurnTimer(roomId);
    }, 800);
  }
  
  // Play a card
  playCard(roomId, cardId, targetId, targetType) {
    if (!this.connected) return;
    
    // In real implementation: this.socket.emit('playCard', { roomId, cardId, targetId, targetType });
    console.log(`Playing card ${cardId} on target ${targetId} (${targetType})`);
    
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
  }
  
  // Send a chat message
  sendChatMessage(roomId, message) {
    if (!this.connected) return;
    
    // In real implementation: this.socket.emit('chatMessage', { roomId, message });
    console.log(`Sending message to room ${roomId}: ${message}`);
    
    // In the mock implementation, the message will be handled by the client directly
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