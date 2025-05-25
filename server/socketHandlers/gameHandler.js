// Game handler for socket events
const Game = require('../models/sqliteModels/Game');
const Room = require('../models/sqliteModels/Room');
const gameController = require('../controllers/gameController');

// Setup game handlers
exports.setupGameHandlers = (io, socket, activeUsers) => {
  // Play a card
  socket.on('playCard', async (data) => {
    try {
      const { roomId, gameId, cardId, targetId, targetType } = data;
      
      // Find game
      const game = await Game.findById(gameId);
      
      if (!game) {
        return socket.emit('error', { message: 'Game not found' });
      }
      
      // Check if it's player's turn
      if (!game.isPlayerTurn(socket.user.userId)) {
        return socket.emit('error', { message: 'Not your turn' });
      }
      
      // Find player
      const player = game.getPlayerById(socket.user.userId);
      if (!player) {
        return socket.emit('error', { message: 'You are not in this game' });
      }
      
      // Find the card in player's hand
      const cardIndex = player.hand.findIndex(card => card.id === cardId);
      if (cardIndex === -1) {
        return socket.emit('error', { message: 'Card not found in your hand' });
      }
      
      const card = player.hand[cardIndex];
      
      // Process card play based on type (this would be more complex in a real game)
      // Here we'll just implement a basic version
      
      // Remove card from hand
      player.hand.splice(cardIndex, 1);
      
      // Add card to discard pile
      game.discardPile.push(card);
      
      // Draw a new card
      let newCard = null;
      if (game.deck.length > 0) {
        newCard = game.deck.pop();
        player.hand.push(newCard);
      }
      
      // Set last action details
      game.lastAction = {
        playerId: socket.user.userId,
        action: `play${card.type.charAt(0).toUpperCase() + card.type.slice(1)}`,
        cardId: card.id,
        targetId: targetId || null
      };
      
      // Advance to next player's turn
      await game.advanceTurn();
      
      // Save game
      await game.save();
      
      // Send updated state to current player
      socket.emit('cardPlayed', {
        success: true,
        newCard,
        hand: player.hand
      });
      
      // Send game state update to all players
      await sendGameStateUpdate(io, game);
      
      console.log(`User ${socket.user.username} played card ${card.type} ${card.color}`);
    } catch (err) {
      console.error('Error playing card:', err);
      socket.emit('error', { message: 'Error playing card', error: err.message });
    }
  });
  
  // End turn
  socket.on('endTurn', async (data) => {
    try {
      const { roomId, gameId } = data;
      
      // Find game
      const game = await Game.findById(gameId);
      
      if (!game) {
        return socket.emit('error', { message: 'Game not found' });
      }
      
      // Check if it's player's turn
      if (!game.isPlayerTurn(socket.user.userId)) {
        return socket.emit('error', { message: 'Not your turn' });
      }
      
      // Set last action
      game.lastAction = {
        playerId: socket.user.userId,
        action: 'skip',
        timestamp: new Date()
      };
      
      // Advance to next player's turn
      await game.advanceTurn();
      
      // Save game
      await game.save();
      
      // Send game state update to all players
      await sendGameStateUpdate(io, game);
      
      console.log(`User ${socket.user.username} ended turn`);
    } catch (err) {
      console.error('Error ending turn:', err);
      socket.emit('error', { message: 'Error ending turn', error: err.message });
    }
  });
  
  // Get game state
  socket.on('getGameState', async (data) => {
    try {
      const { gameId } = data;
      
      // Find game
      const game = await Game.findById(gameId);
      
      if (!game) {
        return socket.emit('error', { message: 'Game not found' });
      }
      
      // Find player
      const player = game.getPlayerById(socket.user.userId);
      
      if (!player) {
        return socket.emit('error', { message: 'You are not in this game' });
      }
      
      // Send game state to the requesting player
      sendGameStateToPlayer(socket, game, player);
      
      console.log(`User ${socket.user.username} requested game state`);
    } catch (err) {
      console.error('Error getting game state:', err);
      socket.emit('error', { message: 'Error getting game state', error: err.message });
    }
  });
};

// Initialize a new game
exports.initializeGame = async (io, roomId) => {
  try {
    // Initialize game using controller
    const game = await gameController.initializeGame(roomId);
    
    // Get room
    const room = await Room.findById(roomId);
    
    // Update room with game ID
    room.gameStarted = true;
    room.gameId = game._id;
    await room.save();
    
    // Notify all players that game has started
    io.to(roomId).emit('gameStarted', {
      gameId: game._id,
      currentPlayerId: game.currentPlayerId
    });
    
    // Deal initial hands to each player
    for (const player of game.players) {
      const socketId = getSocketIdForUser(io, player.userId);
      
      if (socketId) {
        io.to(socketId).emit('dealHand', {
          hand: player.hand
        });
      }
    }
    
    // Send initial game state to all players
    await sendGameStateUpdate(io, game);
    
    // Start turn timer
    startTurnTimer(io, game);
    
    return game;
  } catch (err) {
    console.error('Error initializing game:', err);
    throw err;
  }
};

// Handle player disconnect during game
exports.handleDisconnect = async (io, socket) => {
  try {
    // Find games user is in
    const games = await Game.find({ 'players.userId': socket.user.userId, gameStatus: 'active' });
    
    for (const game of games) {
      // Mark player as inactive
      const playerIndex = game.players.findIndex(
        player => player.userId.toString() === socket.user.userId.toString()
      );
      
      if (playerIndex !== -1) {
        game.players[playerIndex].isActive = false;
        
        // If it was this player's turn, advance to next player
        if (game.currentPlayerId.toString() === socket.user.userId.toString()) {
          game.lastAction = {
            playerId: socket.user.userId,
            action: 'timeout',
            timestamp: new Date()
          };
          
          await game.advanceTurn();
        }
        
        // Save game
        await game.save();
        
        // Notify all players
        await sendGameStateUpdate(io, game);
        
        console.log(`User ${socket.user.username} disconnected from game ${game._id}`);
      }
    }
  } catch (err) {
    console.error('Error handling game disconnect:', err);
  }
};

// Helper functions
// Start turn timer
const startTurnTimer = (io, game) => {
  const turnDuration = game.turnTimeLimit * 1000; // Convert to milliseconds
  
  // Set interval for timer updates
  const timerInterval = setInterval(async () => {
    try {
      // Reload game to get latest state
      const currentGame = await Game.findById(game._id);
      
      if (!currentGame || currentGame.gameStatus !== 'active') {
        clearInterval(timerInterval);
        return;
      }
      
      const now = new Date();
      const turnStartTime = new Date(currentGame.turnStartTime);
      const timeElapsed = now - turnStartTime;
      const timeLeft = Math.max(0, turnDuration - timeElapsed);
      
      // Send timer update every second
      io.to(currentGame.roomId.toString()).emit('timerUpdate', {
        currentPlayerId: currentGame.currentPlayerId,
        timeLeft: Math.ceil(timeLeft / 1000) // Convert to seconds
      });
      
      // If time is up, auto-end turn
      if (timeLeft <= 0) {
        // Set last action
        currentGame.lastAction = {
          playerId: currentGame.currentPlayerId,
          action: 'timeout',
          timestamp: now
        };
        
        // Advance to next player's turn
        await currentGame.advanceTurn();
        
        // Save game
        await currentGame.save();
        
        // Send game state update
        await sendGameStateUpdate(io, currentGame);
      }
    } catch (err) {
      console.error('Error in turn timer:', err);
      clearInterval(timerInterval);
    }
  }, 1000); // Update every second
  
  // Store timer reference
  game.turnTimer = timerInterval;
};

// Send game state update to all players
const sendGameStateUpdate = async (io, game) => {
  // Send to room
  io.to(game.roomId.toString()).emit('turnChange', {
    currentPlayerId: game.currentPlayerId,
    turnStartTime: game.turnStartTime
  });
  
  // Send individual states to each player
  for (const player of game.players) {
    const socketId = getSocketIdForUser(io, player.userId);
    
    if (socketId) {
      sendGameStateToPlayer(io.sockets.sockets.get(socketId), game, player);
    }
  }
};

// Send game state to specific player
const sendGameStateToPlayer = (socket, game, player) => {
  // Calculate turn time left
  const now = new Date();
  const turnStartTime = new Date(game.turnStartTime);
  const timeElapsed = Math.floor((now - turnStartTime) / 1000);
  const turnTimeLeft = Math.max(0, game.turnTimeLimit - timeElapsed);
  
  // Format game state for player
  socket.emit('gameStateUpdate', {
    gameId: game._id,
    players: game.players.map(p => ({
      id: p.userId,
      username: p.username,
      avatarUrl: p.avatarUrl,
      organs: p.organs,
      handCount: p.userId.toString() !== player.userId.toString() ? p.hand.length : undefined,
      isActive: p.isActive
    })),
    currentPlayerId: game.currentPlayerId,
    turnTimeLeft,
    hand: player.hand,
    discardPile: game.discardPile.length > 0 ? [game.discardPile[game.discardPile.length - 1]] : [],
    deckCount: game.deck.length,
    gameStatus: game.gameStatus,
    winner: game.winner,
    lastAction: game.lastAction
  });
};

// Get socket ID for a user
const getSocketIdForUser = (io, userId) => {
  // Find socket ID from connected sockets
  for (const [socketId, socket] of io.sockets.sockets.entries()) {
    if (socket.user && socket.user.userId.toString() === userId.toString()) {
      return socketId;
    }
  }
  return null;
};