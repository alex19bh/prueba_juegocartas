// Game controller for managing game state and actions
const { Game, Room, User } = require('../models/sqliteModels');
const config = require('../config/default');
const { Op } = require('sequelize');

// Initialize new game
exports.initializeGame = async (roomId) => {
  try {
    // Find room with players
    const room = await Room.findByPk(roomId, {
      include: [{
        model: User,
        as: 'players',
        attributes: ['id', 'username', 'avatarUrl'],
        through: { attributes: ['isHost', 'isReady'] }
      }]
    });
    
    if (!room) {
      throw new Error('Room not found');
    }

    // Check if game already started
    if (room.gameStarted) {
      throw new Error('Game already started');
    }

    // Create deck of cards
    const deck = createDeck();

    // Shuffle deck
    shuffleDeck(deck);

    // Create player objects from the room's players
    const players = room.players.map(player => ({
      userId: player.id,
      username: player.username,
      avatarUrl: player.avatarUrl,
      hand: [],
      organs: [],
      isActive: true
    }));

    // Determine starting player (random)
    const startingPlayerIndex = Math.floor(Math.random() * players.length);
    const currentPlayerId = players[startingPlayerIndex].userId;

    // Create new game
    const game = await Game.create({
      roomId: room.id,
      players: JSON.stringify(players),
      deck: JSON.stringify(deck),
      discardPile: JSON.stringify([]),
      currentPlayerId,
      turnStartTime: new Date(),
      turnTimeLimit: config.gameConfig.turnTimeLimit,
      gameStatus: 'active'
    });

    // Deal initial hands - need to parse the JSON, modify, and then save back
    const playersData = JSON.parse(game.players);
    const deckData = JSON.parse(game.deck);
    
    const initialHandSize = config.gameConfig.initialHandSize;
    for (let player of playersData) {
      for (let i = 0; i < initialHandSize; i++) {
        if (deckData.length === 0) break;
        const card = deckData.pop();
        player.hand.push(card);
      }
    }

    // Save the updated data back to game
    game.players = JSON.stringify(playersData);
    game.deck = JSON.stringify(deckData);
    await game.save();

    // Update room
    room.gameStarted = true;
    room.gameId = game.id;
    await room.save();

    return game;
  } catch (err) {
    console.error('Error initializing game:', err);
    throw err;
  }
};

// Get game state (public info for all players + private info for current player)
exports.getGameState = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Find game
    const game = await Game.findByPk(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Parse game data from JSON
    const players = JSON.parse(game.players);
    const deck = JSON.parse(game.deck);
    const discardPile = JSON.parse(game.discardPile);
    
    // Get player
    const player = players.find(p => p.userId === req.user.userId);
    
    if (!player) {
      return res.status(403).json({ message: 'You are not in this game' });
    }

    // Calculate turn time left
    const now = new Date();
    const turnStartTime = new Date(game.turnStartTime);
    const timeElapsed = Math.floor((now - turnStartTime) / 1000);
    const turnTimeLeft = Math.max(0, game.turnTimeLimit - timeElapsed);

    // Format response
    const response = {
      gameId: game.id,
      players: players.map(p => ({
        id: p.userId,
        username: p.username,
        avatarUrl: p.avatarUrl,
        organs: p.organs,
        handCount: p.userId !== req.user.userId ? p.hand.length : undefined,
        isActive: p.isActive
      })),
      currentPlayerId: game.currentPlayerId,
      turnTimeLeft,
      discardPile: discardPile.length > 0 ? [discardPile[discardPile.length - 1]] : [],
      deckCount: deck.length,
      gameStatus: game.gameStatus
    };

    // Add player's hand if it's the requesting player
    if (player) {
      response.hand = player.hand;
    }

    res.status(200).json(response);
  } catch (err) {
    console.error('Error getting game state:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Play card
exports.playCard = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { cardId, targetId, targetType } = req.body;
    
    // Validate inputs
    if (!cardId) {
      return res.status(400).json({ message: 'Card ID is required' });
    }

    // Find game
    const game = await Game.findByPk(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Parse game data from JSON
    const players = JSON.parse(game.players);
    const deck = JSON.parse(game.deck);
    const discardPile = JSON.parse(game.discardPile);

    // Check if it's player's turn
    const isPlayerTurn = game.currentPlayerId === req.user.userId;
    if (!isPlayerTurn) {
      return res.status(403).json({ message: 'Not your turn' });
    }

    // Find player
    const playerIndex = players.findIndex(p => p.userId === req.user.userId);
    if (playerIndex === -1) {
      return res.status(403).json({ message: 'You are not in this game' });
    }

    const player = players[playerIndex];

    // Find the card in player's hand
    const cardIndex = player.hand.findIndex(card => card.id === cardId);
    if (cardIndex === -1) {
      return res.status(404).json({ message: 'Card not found in your hand' });
    }

    const card = player.hand[cardIndex];

    // Process card play based on type (this would be more complex in a real game)
    // Here we'll just implement a basic version
    
    // Remove card from hand
    player.hand.splice(cardIndex, 1);
    
    // Add card to discard pile
    discardPile.push(card);

    // Draw a new card
    let newCard = null;
    if (deck.length > 0) {
      newCard = deck.pop();
      player.hand.push(newCard);
    }

    // Advance to next player's turn - find the next active player
    let nextPlayerIndex = (playerIndex + 1) % players.length;
    while (!players[nextPlayerIndex].isActive && nextPlayerIndex !== playerIndex) {
      nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
    }

    game.currentPlayerId = players[nextPlayerIndex].userId;
    game.turnStartTime = new Date();

    // Save updated game state
    game.players = JSON.stringify(players);
    game.deck = JSON.stringify(deck);
    game.discardPile = JSON.stringify(discardPile);
    await game.save();

    // Calculate turn time left for next player
    const now = new Date();
    const turnStartTime = new Date(game.turnStartTime);
    const timeElapsed = Math.floor((now - turnStartTime) / 1000);
    const turnTimeLeft = Math.max(0, game.turnTimeLimit - timeElapsed);

    // Return updated state
    res.status(200).json({
      message: 'Card played successfully',
      newCard,
      hand: player.hand,
      currentPlayerId: game.currentPlayerId,
      turnTimeLeft
    });
  } catch (err) {
    console.error('Error playing card:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// End turn
exports.endTurn = async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Find game
    const game = await Game.findByPk(gameId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Parse game data from JSON
    const players = JSON.parse(game.players);
    
    // Check if it's player's turn
    const isPlayerTurn = game.currentPlayerId === req.user.userId;
    if (!isPlayerTurn) {
      return res.status(403).json({ message: 'Not your turn' });
    }

    // Find current player
    const currentPlayerIndex = players.findIndex(p => p.userId === req.user.userId);
    
    // Advance to next player's turn - find the next active player
    let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    while (!players[nextPlayerIndex].isActive && nextPlayerIndex !== currentPlayerIndex) {
      nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
    }

    game.currentPlayerId = players[nextPlayerIndex].userId;
    game.turnStartTime = new Date();

    // Save game
    await game.save();

    // Calculate turn time left for next player
    const now = new Date();
    const turnStartTime = new Date(game.turnStartTime);
    const timeElapsed = Math.floor((now - turnStartTime) / 1000);
    const turnTimeLeft = Math.max(0, game.turnTimeLimit - timeElapsed);

    // Return updated state
    res.status(200).json({
      message: 'Turn ended successfully',
      currentPlayerId: game.currentPlayerId,
      turnTimeLeft
    });
  } catch (err) {
    console.error('Error ending turn:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Helper functions

// Create a deck of cards based on game configuration
function createDeck() {
  const { cardDistribution, cardColors } = config;
  const deck = [];
  let cardId = 1;

  // Create organ cards
  for (let i = 0; i < cardDistribution.organ; i++) {
    const color = cardColors[i % cardColors.length];
    deck.push({
      id: `card-${cardId++}`,
      type: 'organ',
      color,
      name: `Organ ${color.charAt(0).toUpperCase() + color.slice(1)}`,
      imageUrl: `/assets/images/cards/${color}_organ.png`
    });
  }

  // Create virus cards
  for (let i = 0; i < cardDistribution.virus; i++) {
    const color = cardColors[i % cardColors.length];
    deck.push({
      id: `card-${cardId++}`,
      type: 'virus',
      color,
      name: `Virus ${color.charAt(0).toUpperCase() + color.slice(1)}`,
      imageUrl: `/assets/images/cards/${color}_virus.png`
    });
  }

  // Create medicine cards
  for (let i = 0; i < cardDistribution.medicine; i++) {
    const color = cardColors[i % cardColors.length];
    deck.push({
      id: `card-${cardId++}`,
      type: 'medicine',
      color,
      name: `Medicine ${color.charAt(0).toUpperCase() + color.slice(1)}`,
      imageUrl: `/assets/images/cards/${color}_medicine.png`
    });
  }

  // Create treatment cards
  for (let i = 0; i < cardDistribution.treatment; i++) {
    deck.push({
      id: `card-${cardId++}`,
      type: 'treatment',
      color: 'multi',
      name: `Treatment ${i + 1}`,
      imageUrl: `/assets/images/cards/treatment_${i + 1}.png`
    });
  }

  return deck;
}

// Shuffle a deck of cards using Fisher-Yates algorithm
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Helper function to check if a player has won
async function checkWinCondition(game) {
  // Parse players from game JSON
  const players = JSON.parse(game.players);

  for (const player of players) {
    // Count healthy and immunized organs (not infected)
    const healthyOrImmuneOrgans = player.organs.filter(
      organ => organ.status === 'healthy' || organ.status === 'immunized'
    );
    
    // Check if player has the required number of organs to win
    if (healthyOrImmuneOrgans.length >= config.gameConfig.requiredOrgansToWin) {
      game.gameStatus = 'completed';
      game.winner = JSON.stringify({
        userId: player.userId,
        username: player.username
      });
      
      await game.save();
      
      // Update user stats
      const user = await User.findByPk(player.userId);
      if (user) {
        // Update stats - increment wins
        user.gamesWon = (user.gamesWon || 0) + 1;
        user.gamesPlayed = (user.gamesPlayed || 0) + 1;
        await user.save();
      }
      
      // Update stats for other players
      for (const p of players) {
        if (p.userId !== player.userId) {
          const otherUser = await User.findByPk(p.userId);
          if (otherUser) {
            // Update stats - increment losses
            otherUser.gamesLost = (otherUser.gamesLost || 0) + 1;
            otherUser.gamesPlayed = (otherUser.gamesPlayed || 0) + 1;
            await otherUser.save();
          }
        }
      }
      
      return true;
    }
  }
  
  return false;
}