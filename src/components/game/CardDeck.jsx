import React from 'react';
import { useGame } from '../../contexts/GameContext';

const CardDeck = () => {
  const { deck, isMyTurn } = useGame();
  
  // Calculate remaining cards (in a real implementation this would come from the game state)
  const remainingCards = deck?.length || 0;
  
  const handleDeckClick = () => {
    // In a real implementation, this would trigger drawing a card if it's the player's turn
    if (isMyTurn()) {
      console.log('Drawing card from deck');
      // Add logic to draw a card
    }
  };
  
  return (
    <div 
      className={`relative h-40 w-28 bg-white rounded-lg shadow-md border-4 border-green-700
                  flex items-center justify-center ${isMyTurn() ? 'cursor-pointer hover:border-yellow-400' : ''}`}
      onClick={handleDeckClick}
    >
      {/* Card back design */}
      <div className="absolute inset-2 bg-green-600 rounded-md flex items-center justify-center">
        <span className="font-bold text-white text-2xl">V!</span>
      </div>
      
      {/* Card count */}
      <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-red-500 rounded-full 
                      flex items-center justify-center text-white text-xs font-bold">
        {remainingCards}
      </div>
      
      {/* Label */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <span className="text-white font-medium">Mazo</span>
      </div>
    </div>
  );
};

export default CardDeck;