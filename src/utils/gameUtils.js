/**
 * Utility functions for the Virus! card game
 */

import { CARD_TYPES, CARD_COLORS, ORGAN_STATUS } from '../constants/cards';
import { GAME_RULES, CARD_EFFECTS } from '../constants/gameRules';

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array The array to shuffle
 * @return {Array} A new shuffled array
 */
export const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Check if a card play is valid
 * @param {Object} card The card to play
 * @param {Object} target The target (organ, player, etc.)
 * @param {String} targetType The type of target
 * @param {Object} gameState The current game state
 * @return {Boolean} True if the play is valid
 */
export const isValidCardPlay = (card, target, targetType, gameState) => {
  if (!card || !targetType) return false;
  
  switch (card.type) {
    case CARD_TYPES.ORGAN:
      if (targetType !== 'self') return false;
      // Check if player can play this organ
      return GAME_RULES.canPlayOrgan(gameState.playerOrgans, card);
      
    case CARD_TYPES.VIRUS:
      if (targetType !== 'organ') return false;
      // Check if virus can be played on target organ
      return GAME_RULES.canPlayVirus(target, card);
      
    case CARD_TYPES.MEDICINE:
      if (targetType !== 'organ') return false;
      // Check if medicine can be played on target organ
      return GAME_RULES.canPlayMedicine(target, card);
      
    case CARD_TYPES.TREATMENT:
      // Treatment cards have special validation logic depending on their effect
      if (!card.effect) return false;
      return validateTreatmentCard(card, target, targetType, gameState);
      
    default:
      return false;
  }
};

/**
 * Validates a treatment card play
 * @param {Object} card The treatment card
 * @param {Object} target The target
 * @param {String} targetType The type of target
 * @param {Object} gameState The current game state
 * @return {Boolean} True if the treatment card play is valid
 */
const validateTreatmentCard = (card, target, targetType, gameState) => {
  const { TREATMENTS } = GAME_RULES;
  
  switch (card.effect) {
    case 'transplant':
      return targetType === 'player' && 
             TREATMENTS.TRANSPLANT.isValid(gameState.playerOrgans, target.organs);
             
    case 'organ-theft':
      return targetType === 'organ' && 
             TREATMENTS.ORGAN_THEFT.isValid([target]);
             
    case 'contagion':
      return targetType === 'none' && 
             TREATMENTS.CONTAGION.isValid();
             
    case 'latex-glove':
      return targetType === 'self' && 
             TREATMENTS.LATEX_GLOVE.isValid(gameState.hand, target?.count || 0);
             
    case 'medical-error':
      return targetType === 'player' && 
             TREATMENTS.MEDICAL_ERROR.isValid();
             
    case 'spreading':
      return targetType === 'organs' && 
             TREATMENTS.SPREADING.isValid(target.source, target.destination);
             
    default:
      return false;
  }
};

/**
 * Apply card effect to an organ
 * @param {Object} card The card being played 
 * @param {Object} organ The target organ
 * @return {Object|null} The updated organ, or null if destroyed
 */
export const applyCardEffect = (card, organ) => {
  if (!card || !organ) return organ;
  
  // Clone the organ to avoid direct mutation
  const updatedOrgan = { ...organ };
  
  switch (card.type) {
    case CARD_TYPES.VIRUS:
      if (updatedOrgan.hasVaccine) {
        // Remove vaccine
        return CARD_EFFECTS.VIRUS.VACCINATED(updatedOrgan);
      } 
      else if (updatedOrgan.isInfected) {
        // Destroy organ
        return CARD_EFFECTS.VIRUS.INFECTED();
      } 
      else {
        // Infect organ
        return CARD_EFFECTS.VIRUS.HEALTHY(updatedOrgan);
      }
      
    case CARD_TYPES.MEDICINE:
      if (updatedOrgan.isInfected) {
        // Cure infection
        return CARD_EFFECTS.MEDICINE.INFECTED(updatedOrgan);
      } 
      else if (updatedOrgan.hasVaccine) {
        // Immunize
        return CARD_EFFECTS.MEDICINE.VACCINATED(updatedOrgan);
      } 
      else {
        // Add vaccine
        return CARD_EFFECTS.MEDICINE.HEALTHY(updatedOrgan);
      }
      
    default:
      return updatedOrgan;
  }
};

/**
 * Check if a player has won the game
 * @param {Array} organs Player's organs
 * @param {Number} organsToWin Number of organs needed to win
 * @return {Boolean} True if player has won
 */
export const checkWinCondition = (organs, organsToWin = 4) => {
  // Count healthy organs (not infected and either normal or immunized/vaccinated)
  const healthyOrgans = organs.filter(organ => 
    !organ.isInfected && (organ.isImmunized || !organ.hasVirus)
  );
  
  return healthyOrgans.length >= organsToWin;
};

/**
 * Creates a deck of cards for the game
 * @param {Array} cards Array of all card definitions
 * @return {Array} Shuffled deck of cards
 */
export const createGameDeck = (cards) => {
  // Filter out blank cards
  const gameCards = cards.filter(card => card.type !== 'blank');
  
  // Shuffle the deck
  return shuffleArray(gameCards);
};

/**
 * Deal initial hands to players
 * @param {Array} deck The deck of cards
 * @param {Array} players Array of player objects
 * @param {Number} handSize Number of cards to deal to each player
 * @return {Object} Object containing updated deck and players with hands
 */
export const dealInitialHands = (deck, players, handSize = 3) => {
  const deckCopy = [...deck];
  const playersWithHands = players.map(player => {
    const hand = deckCopy.splice(0, handSize);
    return { ...player, hand };
  });
  
  return {
    deck: deckCopy,
    players: playersWithHands
  };
};

/**
 * Format time in seconds to MM:SS format
 * @param {Number} seconds Time in seconds
 * @return {String} Formatted time string
 */
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Get a player's color based on their index
 * @param {Number} index Player index
 * @return {String} Color class for the player
 */
export const getPlayerColor = (index) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500'
  ];
  
  return colors[index % colors.length];
};