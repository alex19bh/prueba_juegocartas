import React from 'react';
import Card from '../ui/Card';
import { useGame } from '../../contexts/GameContext';
import { ORGAN_STATUS, CARD_TYPES } from '../../constants/cards';

const OrganPile = ({ organs, isMine = false, playerId }) => {
  const { 
    isMyTurn, 
    playCard, 
    players 
  } = useGame();
  
  const handleOrganClick = (organ) => {
    // Check if player is in card-play mode and is selecting a target
    if (isMyTurn()) {
      // In a real implementation, this would trigger logic to select this organ
      // as a target for a virus, medicine, or treatment card
      console.log(`Selected organ ${organ.id} as target`);
      
      // In the full implementation, this would need to get the currently selected card
      // and then call playCard with the organ as the target
      // playCard(selectedCardId, organ.id, 'organ');
    }
  };
  
  // If no organs yet, show empty state
  if (!organs || organs.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 bg-green-800 bg-opacity-50 rounded-lg border-2 border-dashed border-green-600">
        <p className="text-white text-center">
          {isMine 
            ? "Juega cartas de órganos para empezar a construir tu cuerpo." 
            : "Este jugador no tiene órganos."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex space-x-4 p-2 bg-green-800 bg-opacity-30 rounded-lg">
      {organs.map(organ => {
        // Determine the visual state of the organ based on its status
        const hasVirus = organ.isInfected;
        const hasVaccine = organ.hasVaccine;
        const isImmunized = organ.isImmunized;
        
        return (
          <div key={organ.id} className="relative" onClick={() => handleOrganClick(organ)}>
            {/* Base organ card */}
            <Card
              {...organ}
              disabled={!isMine && !isMyTurn()}
              className="w-20"
            />
            
            {/* Visual indicators for organ status */}
            {hasVirus && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full 
                            flex items-center justify-center text-white text-xs font-bold">
                🦠
              </div>
            )}
            
            {hasVaccine && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full 
                            flex items-center justify-center text-white text-xs font-bold">
                💉
              </div>
            )}
            
            {isImmunized && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full 
                            flex items-center justify-center text-white text-xs font-bold">
                🛡️
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OrganPile;