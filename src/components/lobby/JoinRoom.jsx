import React, { useState } from 'react';
import Button from '../ui/Button';
import { useGame } from '../../contexts/GameContext';
import { useNavigate } from 'react-router-dom';

const JoinRoom = () => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { joinRoom } = useGame();
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteCode || inviteCode.length < 6) {
      setError('Por favor, ingresa un código de invitación válido');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Enhanced debugging
      const storedRooms = localStorage.getItem('virus_game_rooms');
      console.log('Current localStorage rooms:', storedRooms);
      console.log('Available rooms in localStorage:', storedRooms ? JSON.parse(storedRooms) : 'No rooms found');
      
      if (storedRooms) {
        const rooms = JSON.parse(storedRooms);
        const inviteCodes = Object.values(rooms).map(r => r.inviteCode);
        console.log('Available invite codes:', inviteCodes);
        console.log('Attempting to join with code:', inviteCode.toUpperCase());
        console.log('Code match found:', inviteCodes.includes(inviteCode.toUpperCase()));
      }
      
      const roomData = await joinRoom(inviteCode.toUpperCase());
      console.log('Room joined successfully:', roomData);
      
      // Navigate to the lobby
      navigate(`/lobby/${roomData.roomId}`);
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.message || 'Error al unirse a la sala');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle input changes and format the code
  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    setInviteCode(value.slice(0, 6));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Unirse con código de invitación</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="inviteCode" className="block text-gray-700 text-sm font-bold mb-2">
            Código de invitación
          </label>
          <input
            type="text"
            id="inviteCode"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-center tracking-widest text-xl font-bold leading-tight focus:outline-none focus:shadow-outline"
            placeholder="ABCDEF"
            value={inviteCode}
            onChange={handleCodeChange}
            maxLength={6}
          />
          <p className="mt-2 text-sm text-gray-600">
            Introduce el código de 6 caracteres que te ha compartido tu amigo
          </p>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading || inviteCode.length !== 6}
            fullWidth
          >
            {loading ? 'Uniéndose...' : 'Unirse a la Sala'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default JoinRoom;