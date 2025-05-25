import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refresh
  
  const { findPublicRooms } = useGame();
  const navigate = useNavigate();
  
  // Load rooms on component mount
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        setError('');
        
        const publicRooms = await findPublicRooms();
        setRooms(publicRooms);
      } catch (err) {
        setError('Error al cargar las salas públicas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadRooms();
  }, [findPublicRooms, refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  const handleJoinRoom = (roomId) => {
    navigate(`/lobby/${roomId}`);
  };
  
  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Salas públicas</h2>
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Salas públicas</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center space-x-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Actualizar</span>
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {rooms.length === 0 ? (
        <div className="bg-gray-50 rounded p-6 text-center">
          <p className="text-gray-600">No hay salas públicas disponibles en este momento.</p>
          <p className="text-gray-500 mt-2 text-sm">Crea una nueva sala o únete con un código de invitación.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {rooms.map(room => (
            <div key={room.roomId} className="py-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{room.name}</h3>
                <div className="text-sm text-gray-500">
                  <span>Jugadores: {room.players}/{room.maxPlayers}</span>
                  <span className="mx-2">•</span>
                  <span>Creada: {formatDate(room.createdAt)}</span>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => handleJoinRoom(room.roomId)}
                disabled={room.players >= room.maxPlayers}
              >
                {room.players >= room.maxPlayers ? 'Llena' : 'Unirse'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;