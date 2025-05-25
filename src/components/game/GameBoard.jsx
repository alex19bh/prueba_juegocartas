import React from 'react';
import PlayerHand from './PlayerHand';
import OrganPile from './OrganPile';
import CardDeck from './CardDeck';
import CardDiscard from './CardDiscard';
import PlayerInfo from './PlayerInfo';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';

const GameBoard = () => {
  const { 
    players, 
    currentPlayerId, 
    turnTimeLeft,
    hand,
    isMyTurn,
    getActivePlayer
  } = useGame();
  
  const { currentUser } = useAuth();
  const activePlayer = getActivePlayer();
  
  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Game header with turn information */}
      <div className="bg-green-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-bold mr-2">
            Turno de: {activePlayer?.username || 'Cargando...'}
          </span>
          {isMyTurn() && (
            <span className="bg-yellow-400 text-green-900 px-2 py-1 rounded-md font-bold">
              ¡Tu turno!
            </span>
          )}
        </div>
        <div className="bg-white text-green-800 px-3 py-1 rounded-md font-bold">
          {turnTimeLeft}s
        </div>
      </div>
      
      {/* Game area - contains opponents, play area, and player's hand */}
      <div className="flex-grow flex flex-col bg-green-700 p-4">
        {/* Opponents area */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {players
            .filter(player => player.id !== currentUser?.id)
            .map(player => (
              <PlayerInfo
                key={player.id}
                player={player}
                isActive={player.id === currentPlayerId}
              />
            ))}
        </div>
        
        {/* Center play area with decks */}
        <div className="flex-grow flex justify-center items-center">
          <div className="grid grid-cols-2 gap-8">
            <CardDeck />
            <CardDiscard />
          </div>
        </div>
        
        {/* Current player's organs */}
        <div className="mb-6">
          <h3 className="text-white font-bold mb-2">Tus órganos:</h3>
          <OrganPile 
            organs={players.find(p => p.id === currentUser?.id)?.organs || []}
            isMine={true}
          />
        </div>
      </div>
      
      {/* Player's hand */}
      <div className="bg-green-900 p-4">
        <PlayerHand cards={hand} />
      </div>
    </div>
  );
};

export default GameBoard;