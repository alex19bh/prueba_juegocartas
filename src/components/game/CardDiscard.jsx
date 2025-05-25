import React from 'react';
import Card from '../ui/Card';
import { useGame } from '../../contexts/GameContext';

const CardDiscard = () => {
  const { discardPile } = useGame();
  
  // Get the top card from the discard pile
  const topCard = discardPile && discardPile.length > 0 
    ? discardPile[discardPile.length - 1] 
    : null;
  
  return (
    <div className="relative h-40 w-28">
      {topCard ? (
        <Card
          {...topCard}
          disabled={true}
          className="w-full h-full"
        />
      ) : (
        <div className="h-full w-full border-4 border-dashed border-green-600 rounded-lg 
                      flex items-center justify-center text-green-200">
          <span>Vacío</span>
        </div>
      )}
      
      {/* Card count */}
      {discardPile && discardPile.length > 0 && (
        <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-gray-600 rounded-full 
                        flex items-center justify-center text-white text-xs font-bold">
          {discardPile.length}
        </div>
      )}
      
      {/* Label */}
      <div className="absolute -bottom-8 left-0 right-0 text-center">
        <span className="text-white font-medium">Descarte</span>
      </div>
    </div>
  );
};

export default CardDiscard;