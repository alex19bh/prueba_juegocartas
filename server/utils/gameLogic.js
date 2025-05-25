// Game logic utility for managing game state and card actions
const mongoose = require('mongoose');
const Game = require('../models/Game');
const User = require('../models/User');
const Room = require('../models/Room');
const config = require('../config/default');

// Create a new game from a room
exports.createGame = async (room) => {
  try {
    console.log(`Creating new game for room: ${room._id}`);
    
    // Create a new game document
    const game = new Game({
      roomId: room._id,
      players: [],
      deck: [],
      discardPile: [],
      turnTimeLimit: config.gameConfig.turnTimeLimit
    });
    
    // Add players to the game
    for (const roomPlayer of room.players) {
      // Find full user data
      const user = await User.findById(roomPlayer.userId);
      if (!user) {
        console.error(`User not found: ${roomPlayer.userId}`);
        continue;
      }
      
      // Add player to game with empty hand and organs
      game.players.push({
        userId: user._id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        hand: [],
        organs: [],
        isActive: true
      });
    }
    
    // Generate cards deck
    game.deck = generateDeck();
    
    // Shuffle the deck
    shuffleDeck(game.deck);
    
    // Deal initial cards to players
    await dealInitialCards(game);
    
    // Set first player (random for now)
    const randomPlayerIndex = Math.floor(Math.random() * game.players.length);
    game.currentPlayerId = game.players[randomPlayerIndex].userId;
    
    // Set turn start time
    game.turnStartTime = new Date();
    
    // Save the game
    await game.save();
    
    return game;
  } catch (err) {
    console.error('Error creating game:', err);
    throw err;
  }
};

// Process a card play action
exports.playCard = async (game, playerId, cardId, targetId, targetType) => {
  try {
    // Find the player
    const playerIndex = game.players.findIndex(player => 
      player.userId.toString() === playerId.toString());
    
    if (playerIndex === -1) {
      throw new Error('Player not found in game');
    }
    
    // Find the card in player's hand
    const cardIndex = game.players[playerIndex].hand.findIndex(card => card.id === cardId);
    
    if (cardIndex === -1) {
      throw new Error('Card not found in player\'s hand');
    }
    
    // Get the card
    const card = game.players[playerIndex].hand[cardIndex];
    
    // Process the card action based on card type
    switch (card.type) {
      case 'organ':
        await playOrganCard(game, playerIndex, cardIndex, playerId);
        break;
      
      case 'virus':
        await playVirusCard(game, playerIndex, cardIndex, targetId, targetType);
        break;
      
      case 'medicine':
        await playMedicineCard(game, playerIndex, cardIndex, targetId, targetType);
        break;
      
      case 'treatment':
        await playTreatmentCard(game, playerIndex, cardIndex, targetId, targetType);
        break;
      
      default:
        throw new Error('Unknown card type');
    }
    
    // Check if there's a winner
    const winner = checkForWinner(game);
    if (winner) {
      game.gameStatus = 'completed';
      game.winner = {
        userId: winner.userId,
        username: winner.username
      };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Error playing card:', err);
    throw err;
  }
};

// Check if any player has won the game
function checkForWinner(game) {
  // A player wins if they have at least 4 healthy or immunized organs
  for (const player of game.players) {
    const validOrgans = player.organs.filter(organ => 
      organ.status === 'healthy' || organ.status === 'immunized');
    
    if (validOrgans.length >= config.gameConfig.requiredOrgansToWin) {
      return player;
    }
  }
  
  return null;
}

// Generate a complete deck of cards
function generateDeck() {
  const deck = [];
  const cardTypes = Object.keys(config.gameConfig.cardDistribution);
  const colors = config.cardColors;
  
  // Generate cards according to distribution
  cardTypes.forEach(type => {
    const count = config.gameConfig.cardDistribution[type];
    const cardsPerColor = Math.floor(count / colors.length);
    let remainder = count % colors.length;
    
    colors.forEach(color => {
      let cardsToCreate = cardsPerColor;
      if (remainder > 0) {
        cardsToCreate++;
        remainder--;
      }
      
      for (let i = 0; i < cardsToCreate; i++) {
        const id = `${type}-${color}-${i}-${Date.now() + Math.floor(Math.random() * 1000)}`;
        let name = '';
        
        switch (type) {
          case 'organ':
            name = `Órgano ${getColorName(color)}`;
            break;
          case 'virus':
            name = `Virus ${getColorName(color)}`;
            break;
          case 'medicine':
            name = `Medicina ${getColorName(color)}`;
            break;
          case 'treatment':
            name = `Tratamiento ${getColorName(color)}`;
            break;
        }
        
        deck.push({
          id,
          type,
          color,
          name,
          imageUrl: `/assets/images/cards/${type}-${color}.png`
        });
      }
    });
  });
  
  return deck;
}

// Get color name in Spanish
function getColorName(color) {
  switch (color) {
    case 'red': return 'Rojo';
    case 'blue': return 'Azul';
    case 'green': return 'Verde';
    case 'yellow': return 'Amarillo';
    default: return color;
  }
}

// Shuffle a deck of cards using Fisher-Yates algorithm
function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// Deal initial cards to all players
async function dealInitialCards(game) {
  for (let i = 0; i < game.players.length; i++) {
    for (let j = 0; j < config.gameConfig.initialHandSize; j++) {
      if (game.deck.length > 0) {
        const card = game.deck.pop();
        game.players[i].hand.push(card);
      }
    }
  }
}

// Play an organ card
async function playOrganCard(game, playerIndex, cardIndex, playerId) {
  const player = game.players[playerIndex];
  const card = player.hand[cardIndex];
  
  // Check if player already has this color of organ
  const hasOrgan = player.organs.some(organ => organ.color === card.color);
  if (hasOrgan) {
    throw new Error('Ya tienes un órgano de este color');
  }
  
  // Add organ to player's body
  player.organs.push({
    id: card.id,
    type: card.type,
    color: card.color,
    name: card.name,
    imageUrl: card.imageUrl,
    status: 'healthy',
    attachments: []
  });
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to discard pile
  game.discardPile.push(card);
  
  // Set last action
  game.lastAction = {
    playerId,
    action: 'playOrgan',
    cardId: card.id,
    timestamp: Date.now()
  };
}

// Play a virus card
async function playVirusCard(game, playerIndex, cardIndex, targetId, targetType) {
  const player = game.players[playerIndex];
  const card = player.hand[cardIndex];
  
  // Find target player
  const targetPlayerIndex = game.players.findIndex(p => 
    p.userId.toString() === targetId.toString());
  
  if (targetPlayerIndex === -1) {
    throw new Error('Target player not found');
  }
  
  const targetPlayer = game.players[targetPlayerIndex];
  
  // Find matching organ in target player's body
  const organIndex = targetPlayer.organs.findIndex(organ => organ.color === card.color);
  if (organIndex === -1) {
    throw new Error('El jugador no tiene un órgano de este color');
  }
  
  const organ = targetPlayer.organs[organIndex];
  
  // Check organ status
  if (organ.status === 'infected') {
    throw new Error('Este órgano ya está infectado');
  }
  
  if (organ.status === 'immunized') {
    throw new Error('Este órgano está inmunizado y no puede ser infectado');
  }
  
  // Update organ status
  organ.status = 'infected';
  
  // Add virus as attachment
  organ.attachments.push({
    id: card.id,
    type: card.type,
    color: card.color,
    name: card.name,
    imageUrl: card.imageUrl
  });
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to discard pile
  game.discardPile.push(card);
  
  // Set last action
  game.lastAction = {
    playerId: player.userId,
    action: 'playVirus',
    cardId: card.id,
    targetId,
    timestamp: Date.now()
  };
}

// Play a medicine card
async function playMedicineCard(game, playerIndex, cardIndex, targetId, targetType) {
  const player = game.players[playerIndex];
  const card = player.hand[cardIndex];
  
  // Find target player
  const targetPlayerIndex = game.players.findIndex(p => 
    p.userId.toString() === targetId.toString());
  
  if (targetPlayerIndex === -1) {
    throw new Error('Target player not found');
  }
  
  const targetPlayer = game.players[targetPlayerIndex];
  
  // Find matching organ in target player's body
  const organIndex = targetPlayer.organs.findIndex(organ => organ.color === card.color);
  if (organIndex === -1) {
    throw new Error('El jugador no tiene un órgano de este color');
  }
  
  const organ = targetPlayer.organs[organIndex];
  
  // Check if there's a virus to cure
  if (organ.status === 'healthy') {
    // If organ is healthy, medicine makes it immunized
    organ.status = 'immunized';
    
    // Add medicine as attachment
    organ.attachments.push({
      id: card.id,
      type: card.type,
      color: card.color,
      name: card.name,
      imageUrl: card.imageUrl
    });
  } else if (organ.status === 'infected') {
    // If organ is infected, medicine cures it
    organ.status = 'healthy';
    
    // Find and remove virus attachments
    const virusAttachments = organ.attachments.filter(a => a.type === 'virus');
    
    // Remove all virus attachments
    organ.attachments = organ.attachments.filter(a => a.type !== 'virus');
    
    // Add all removed virus cards to discard pile
    game.discardPile.push(...virusAttachments);
  } else if (organ.status === 'immunized') {
    throw new Error('Este órgano ya está inmunizado');
  }
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to discard pile
  game.discardPile.push(card);
  
  // Set last action
  game.lastAction = {
    playerId: player.userId,
    action: 'playMedicine',
    cardId: card.id,
    targetId,
    timestamp: Date.now()
  };
}

// Play a treatment card
async function playTreatmentCard(game, playerIndex, cardIndex, targetId, targetType) {
  const player = game.players[playerIndex];
  const card = player.hand[cardIndex];
  
  // Different treatments have different effects based on color
  switch (card.color) {
    case 'red': // Organ theft
      await treatmentOrganTheft(game, player, card, cardIndex, targetId);
      break;
    
    case 'blue': // Organ exchange
      await treatmentOrganExchange(game, player, card, cardIndex, targetId);
      break;
    
    case 'green': // Discard hand
      await treatmentDiscardHand(game, player, card, cardIndex, targetId);
      break;
    
    case 'yellow': // Draw 3 cards
      await treatmentDrawCards(game, player, card, cardIndex);
      break;
    
    default:
      throw new Error('Tipo de tratamiento desconocido');
  }
}

// Treatment: Steal an organ from another player
async function treatmentOrganTheft(game, player, card, cardIndex, targetId) {
  // Find target player
  const targetPlayerIndex = game.players.findIndex(p => 
    p.userId.toString() === targetId.toString());
  
  if (targetPlayerIndex === -1) {
    throw new Error('Target player not found');
  }
  
  if (targetId === player.userId.toString()) {
    throw new Error('No puedes robar un órgano de ti mismo');
  }
  
  const targetPlayer = game.players[targetPlayerIndex];
  
  // Check if target has any organs
  if (targetPlayer.organs.length === 0) {
    throw new Error('El jugador no tiene órganos para robar');
  }
  
  // For now, steal the first healthy organ
  const healthyOrganIndex = targetPlayer.organs.findIndex(
    organ => organ.status === 'healthy' || organ.status === 'immunized'
  );
  
  if (healthyOrganIndex === -1) {
    throw new Error('El jugador no tiene órganos saludables para robar');
  }
  
  // Get the organ to steal
  const stolenOrgan = targetPlayer.organs[healthyOrganIndex];
  
  // Check if player already has this color of organ
  const hasOrgan = player.organs.some(organ => organ.color === stolenOrgan.color);
  if (hasOrgan) {
    throw new Error('Ya tienes un órgano de este color');
  }
  
  // Remove from target
  targetPlayer.organs.splice(healthyOrganIndex, 1);
  
  // Add to player
  player.organs.push(stolenOrgan);
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to discard pile
  game.discardPile.push(card);
  
  // Set last action
  game.lastAction = {
    playerId: player.userId,
    action: 'treatmentOrganTheft',
    cardId: card.id,
    targetId,
    timestamp: Date.now()
  };
}

// Treatment: Exchange an organ with another player
async function treatmentOrganExchange(game, player, card, cardIndex, targetId) {
  // Find target player
  const targetPlayerIndex = game.players.findIndex(p => 
    p.userId.toString() === targetId.toString());
  
  if (targetPlayerIndex === -1) {
    throw new Error('Target player not found');
  }
  
  if (targetId === player.userId.toString()) {
    throw new Error('No puedes intercambiar con ti mismo');
  }
  
  const targetPlayer = game.players[targetPlayerIndex];
  
  // Check if target has any organs
  if (targetPlayer.organs.length === 0) {
    throw new Error('El jugador no tiene órganos para intercambiar');
  }
  
  // Check if player has any organs
  if (player.organs.length === 0) {
    throw new Error('No tienes órganos para intercambiar');
  }
  
  // For now, exchange the first healthy organs from both players
  const playerOrganIndex = player.organs.findIndex(
    organ => organ.status === 'healthy' || organ.status === 'immunized'
  );
  
  const targetOrganIndex = targetPlayer.organs.findIndex(
    organ => organ.status === 'healthy' || organ.status === 'immunized'
  );
  
  if (playerOrganIndex === -1) {
    throw new Error('No tienes órganos saludables para intercambiar');
  }
  
  if (targetOrganIndex === -1) {
    throw new Error('El jugador no tiene órganos saludables para intercambiar');
  }
  
  // Get the organs
  const playerOrgan = player.organs[playerOrganIndex];
  const targetOrgan = targetPlayer.organs[targetOrganIndex];
  
  // Remove organs
  player.organs.splice(playerOrganIndex, 1);
  targetPlayer.organs.splice(targetOrganIndex, 1);
  
  // Swap them
  player.organs.push(targetOrgan);
  targetPlayer.organs.push(playerOrgan);
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to discard pile
  game.discardPile.push(card);
  
  // Set last action
  game.lastAction = {
    playerId: player.userId,
    action: 'treatmentOrganExchange',
    cardId: card.id,
    targetId,
    timestamp: Date.now()
  };
}

// Treatment: Force a player to discard their hand
async function treatmentDiscardHand(game, player, card, cardIndex, targetId) {
  // Find target player
  const targetPlayerIndex = game.players.findIndex(p => 
    p.userId.toString() === targetId.toString());
  
  if (targetPlayerIndex === -1) {
    throw new Error('Target player not found');
  }
  
  const targetPlayer = game.players[targetPlayerIndex];
  
  // Check if target has any cards
  if (targetPlayer.hand.length === 0) {
    throw new Error('El jugador no tiene cartas para descartar');
  }
  
  // Add all cards to discard pile
  game.discardPile.push(...targetPlayer.hand);
  
  // Empty target's hand
  const discardedCount = targetPlayer.hand.length;
  targetPlayer.hand = [];
  
  // Draw new cards for target (same amount they lost)
  for (let i = 0; i < discardedCount; i++) {
    if (game.deck.length === 0) {
      // Reshuffle discard pile if needed
      if (game.discardPile.length > 0) {
        const topCard = game.discardPile.pop();
        game.deck = [...game.discardPile];
        game.discardPile = [topCard];
        shuffleDeck(game.deck);
      } else {
        break; // No more cards available
      }
    }
    
    if (game.deck.length > 0) {
      const newCard = game.deck.pop();
      targetPlayer.hand.push(newCard);
    }
  }
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to discard pile
  game.discardPile.push(card);
  
  // Set last action
  game.lastAction = {
    playerId: player.userId,
    action: 'treatmentDiscardHand',
    cardId: card.id,
    targetId,
    timestamp: Date.now()
  };
}

// Treatment: Draw 3 cards
async function treatmentDrawCards(game, player, card, cardIndex) {
  // Draw 3 cards for the player
  for (let i = 0; i < 3; i++) {
    if (game.deck.length === 0) {
      // Reshuffle discard pile if needed
      if (game.discardPile.length > 0) {
        const topCard = game.discardPile.pop();
        game.deck = [...game.discardPile];
        game.discardPile = [topCard];
        shuffleDeck(game.deck);
      } else {
        break; // No more cards available
      }
    }
    
    if (game.deck.length > 0) {
      const newCard = game.deck.pop();
      player.hand.push(newCard);
    }
  }
  
  // Remove card from hand
  player.hand.splice(cardIndex, 1);
  
  // Add to discard pile
  game.discardPile.push(card);
  
  // Set last action
  game.lastAction = {
    playerId: player.userId,
    action: 'treatmentDrawCards',
    cardId: card.id,
    timestamp: Date.now()
  };
}