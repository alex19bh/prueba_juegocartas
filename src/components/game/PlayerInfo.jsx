import React from 'react';
import OrganPile from './OrganPile';

const PlayerInfo = ({ player, isActive = false }) => {
  const { id, username, avatarUrl, organs = [] } = player;
  
  // Calculate health stats
  const organCount = organs.length;
  const hasWinningCondition = organCount >= 4; // Assuming 4 organs to win
  
  return (
    <div className={`
      p-3 rounded-lg transition-all
      ${isActive ? 'bg-yellow-100 shadow-lg' : 'bg-white shadow'}
      ${hasWinningCondition ? 'border-2 border-yellow-400' : ''}
    `}>
      {/* Player header */}
      <div className="flex items-center mb-2">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
          <img 
            src={avatarUrl || '/assets/images/avatars/default-1.png'} 
            alt={username}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Player info */}
        <div className="flex-grow">
          <div className="font-semibold truncate">{username}</div>
          <div className="text-xs text-gray-500">Órganos: {organCount}/4</div>
        </div>
        
        {/* Active player indicator */}
        {isActive && (
          <div className="flex-shrink-0 w-3 h-3 bg-yellow-400 rounded-full"></div>
        )}
      </div>
      
      {/* Player's organs */}
      <OrganPile organs={organs} playerId={id} />
    </div>
  );
};

export default PlayerInfo;