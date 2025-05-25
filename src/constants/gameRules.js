// Game rules and configuration settings for the Virus! card game

// Game configuration
export const GAME_CONFIG = {
  // Number of cards in initial hand
  INITIAL_HAND_SIZE: 3,
  
  // Number of cards to draw per turn
  CARDS_PER_TURN: 1,
  
  // Maximum hand size
  MAX_HAND_SIZE: 3,
  
  // Number of organs needed to win
  ORGANS_TO_WIN: 4,
  
  // Minimum and maximum players
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  
  // Turn time limit in seconds (default 60s)
  TURN_TIME_LIMIT: 60,
  
  // Time to wait for reconnection in seconds
  RECONNECTION_TIME_LIMIT: 60
};

// Game rule validations
export const GAME_RULES = {
  // Rules for playing organ cards
  canPlayOrgan: (playerOrgans, card) => {
    // Check if player already has this color organ in their body
    const hasColorAlready = playerOrgans.some(organ => 
      organ.color === card.color && card.color !== 'multicolor'
    );
    
    return !hasColorAlready;
  },
  
  // Rules for playing virus cards
  canPlayVirus: (targetOrgan, card) => {
    // Can play virus if:
    // 1. Matching color (or multicolor organ)
    // 2. Organ is not already infected
    // 3. Organ is not immunized
    if (!targetOrgan) return false;
    
    return (
      (targetOrgan.color === card.color || targetOrgan.color === 'multicolor') && 
      !targetOrgan.isInfected && 
      !targetOrgan.isImmunized
    );
  },
  
  // Rules for playing medicine cards
  canPlayMedicine: (targetOrgan, card) => {
    // Can play medicine if:
    // 1. Matching color (or multicolor organ)
    // 2. Organ exists
    if (!targetOrgan) return false;
    
    return (
      targetOrgan.color === card.color || targetOrgan.color === 'multicolor'
    );
  },
  
  // Treatment card effects and validations
  TREATMENTS: {
    // Transplant - Exchange one of your organs with one from another player
    TRANSPLANT: {
      isValid: (playerOrgans, targetPlayerOrgans) => {
        return playerOrgans.length > 0 && targetPlayerOrgans.length > 0;
      }
    },
    
    // Organ Theft - Steal an organ from another player's body
    ORGAN_THEFT: {
      isValid: (targetPlayerOrgans) => {
        return targetPlayerOrgans.some(organ => !organ.isInfected && !organ.isImmunized);
      }
    },
    
    // Contagion - All players except you must discard a virus card
    // or lose an infected organ
    CONTAGION: {
      isValid: () => true // Can always play this card
    },
    
    // Latex Glove - Discard up to 3 cards and draw the same amount
    LATEX_GLOVE: {
      isValid: (playerHand, count) => {
        return count >= 1 && count <= 3 && playerHand.length >= count;
      }
    },
    
    // Medical Error - Swap your hand with another player
    MEDICAL_ERROR: {
      isValid: () => true // Can always play this card
    },
    
    // Spreading - Move a virus from one organ to another of the same color
    SPREADING: {
      isValid: (sourceOrgan, targetOrgan) => {
        return (
          sourceOrgan && 
          targetOrgan && 
          sourceOrgan.isInfected &&
          !targetOrgan.isInfected && 
          !targetOrgan.isImmunized && 
          (sourceOrgan.color === targetOrgan.color || 
           sourceOrgan.color === 'multicolor' || 
           targetOrgan.color === 'multicolor')
        );
      }
    }
  }
};

// Effects of cards on organs
export const CARD_EFFECTS = {
  // What happens when a medicine is played on an organ
  MEDICINE: {
    // On healthy organ: add vaccine
    HEALTHY: (organ) => {
      organ.hasVaccine = true;
      return organ;
    },
    
    // On infected organ: cure the infection
    INFECTED: (organ) => {
      organ.isInfected = false;
      return organ;
    },
    
    // On vaccinated organ: immunize the organ
    VACCINATED: (organ) => {
      organ.isImmunized = true;
      organ.hasVaccine = false;
      return organ;
    }
  },
  
  // What happens when a virus is played on an organ
  VIRUS: {
    // On healthy organ: infect it
    HEALTHY: (organ) => {
      organ.isInfected = true;
      return organ;
    },
    
    // On vaccinated organ: remove the vaccine
    VACCINATED: (organ) => {
      organ.hasVaccine = false;
      return organ;
    },
    
    // On infected organ: destroy the organ (returns null to indicate removal)
    INFECTED: () => {
      return null; // Organ is destroyed
    }
  }
};