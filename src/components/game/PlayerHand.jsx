import React, { useState } from 'react';
import Card from '../ui/Card';
import { useGame } from '../../contexts/GameContext';
import { CARD_TYPES } from '../../constants/cards';

const PlayerHand = ({ cards }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const { isMyTurn, playCard } = useGame();
  
  const handleCardSelect = (card) => {
    // Only allow selection if it's player's turn
    if (!isMyTurn()) return;
    
    if (selectedCard && selectedCard.id === card.id) {
      // If the same card is clicked again, deselect it
      setSelectedCard(null);
    } else {
      // Otherwise select the new card
      setSelectedCard(card);
    }
  };
  
  const handleCardPlay = async (card, targetId, targetType) => {
    if (!isMyTurn()) return;
    
    const success = await playCard(card.id, targetId, targetType);
    
    if (success) {
      setSelectedCard(null);
    }
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="flex justify-center items-center h-24 bg-green-800 rounded-lg">
        <p className="text-white">Esperando cartas...</p>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-white font-bold mb-2">Tu Mano:</h3>
      <div className="flex justify-center space-x-4">
        {cards.map(card => (
          <div key={card.id} className="relative">
            <Card
              {...card}
              selected={selectedCard?.id === card.id}
              disabled={!isMyTurn()}
              onClick={handleCardSelect}
              className="w-24"
            />
            
            {/* Show play button if card is selected */}
            {selectedCard?.id === card.id && (
              <div className="absolute -bottom-8 left-0 right-0 flex justify-center">
                <button 
                  className="bg-yellow-400 text-black text-xs py-1 px-2 rounded"
                  onClick={() => handleCardPlay(card)}
                >
                  {card.type === CARD_TYPES.ORGAN ? 'Jugar' : 'Seleccionar objetivo'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerHand;