import React, { useState } from 'react';
import Button from '../ui/Button';
import { useGame } from '../../contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { GAME_CONFIG } from '../../constants/gameRules';

const CreateRoom = () => {
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createRoom } = useGame();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roomName) {
      setError('Por favor, ingresa un nombre para la sala');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const roomData = await createRoom(roomName, isPrivate, maxPlayers);
      
      // Navigate to the lobby
      navigate(`/lobby/${roomData.roomId}`);
    } catch (err) {
      setError(err.message || 'Error al crear la sala');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Crear una nueva sala</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="roomName" className="block text-gray-700 text-sm font-bold mb-2">
            Nombre de la sala
          </label>
          <input
            type="text"
            id="roomName"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Mi sala de juego"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            maxLength={30}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Tipo de sala
          </label>
          <div className="flex">
            <label className="inline-flex items-center mr-6">
              <input
                type="radio"
                className="form-radio"
                name="roomType"
                checked={isPrivate}
                onChange={() => setIsPrivate(true)}
              />
              <span className="ml-2">Privada (solo con invitación)</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio"
                name="roomType"
                checked={!isPrivate}
                onChange={() => setIsPrivate(false)}
              />
              <span className="ml-2">Pública (visible para todos)</span>
            </label>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Número máximo de jugadores: {maxPlayers}
          </label>
          <input
            type="range"
            min={GAME_CONFIG.MIN_PLAYERS}
            max={GAME_CONFIG.MAX_PLAYERS}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{GAME_CONFIG.MIN_PLAYERS}</span>
            <span>{GAME_CONFIG.MAX_PLAYERS}</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Creando sala...' : 'Crear Sala'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoom;