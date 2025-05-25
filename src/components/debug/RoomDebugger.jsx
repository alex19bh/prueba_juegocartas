import React, { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';

/**
 * A debugging component that displays information about created and available rooms
 * This helps diagnose room joining functionality issues
 */
const RoomDebugger = () => {
  const [rooms, setRooms] = useState({});
  const [nextRoomId, setNextRoomId] = useState('');
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [testInviteCode, setTestInviteCode] = useState('');
  const [testResult, setTestResult] = useState(null);
  
  const { joinRoom } = useGame();

  useEffect(() => {
    // Load room data from localStorage
    const storedRooms = localStorage.getItem('virus_game_rooms');
    const storedNextRoomId = localStorage.getItem('virus_game_nextRoomId');
    
    setRooms(storedRooms ? JSON.parse(storedRooms) : {});
    setNextRoomId(storedNextRoomId || 'Not set');
  }, [refreshCounter]);

  const handleRefresh = () => {
    setRefreshCounter(prevCounter => prevCounter + 1);
  };

  const handleClearRooms = () => {
    if (window.confirm('¿Estás seguro que quieres eliminar todas las salas guardadas?')) {
      localStorage.removeItem('virus_game_rooms');
      localStorage.removeItem('virus_game_nextRoomId');
      handleRefresh();
    }
  };
  
  const handleTestJoinRoom = async () => {
    if (!testInviteCode) {
      setTestResult({
        success: false,
        error: 'Please enter an invite code'
      });
      return;
    }
    
    try {
      setTestResult({
        loading: true,
        success: false,
        error: null
      });
      
      const roomData = await joinRoom(testInviteCode.toUpperCase());
      
      setTestResult({
        loading: false,
        success: true,
        data: roomData
      });
    } catch (error) {
      setTestResult({
        loading: false,
        success: false,
        error: error.message || 'Unknown error occurred'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Room Debug Information</h2>
        <div className="space-x-2">
          <button 
            onClick={handleRefresh}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
          <button 
            onClick={handleClearRooms}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Rooms
          </button>
        </div>
      </div>
      
      {/* Room Join Tester */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
        <h3 className="font-semibold mb-3">Test Room Joining</h3>
        
        <div className="flex mb-3">
          <input
            type="text"
            value={testInviteCode}
            onChange={(e) => setTestInviteCode(e.target.value.toUpperCase())}
            placeholder="Enter invite code"
            className="shadow-sm border border-gray-300 rounded-l py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
            maxLength={6}
          />
          <button
            onClick={handleTestJoinRoom}
            disabled={testResult?.loading}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {testResult?.loading ? 'Testing...' : 'Test Join'}
          </button>
        </div>
        
        {testResult && (
          <div className={`p-3 rounded ${testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {testResult.success ? (
              <>
                <div className="font-semibold">Success!</div>
                <pre className="text-xs overflow-auto mt-2">{JSON.stringify(testResult.data, null, 2)}</pre>
              </>
            ) : (
              <>
                <div className="font-semibold">Error</div>
                <div>{testResult.error}</div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Next Room ID:</h3>
        <code className="block bg-gray-100 p-2 rounded">{nextRoomId}</code>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Stored Rooms:</h3>
        {Object.keys(rooms).length === 0 ? (
          <div className="bg-gray-100 p-3 rounded">
            <p>No rooms found in localStorage</p>
          </div>
        ) : (
          <div className="overflow-auto max-h-96">
            {Object.entries(rooms).map(([roomId, room]) => (
              <div key={roomId} className="bg-gray-100 p-3 rounded mb-3">
                <div className="flex justify-between">
                  <h4 className="font-medium">{room.name}</h4>
                  <span className="text-sm bg-green-100 px-2 py-1 rounded">ID: {roomId}</span>
                </div>
                
                <div className="mt-2 text-sm">
                  <div><strong>Invite Code:</strong> {room.inviteCode}</div>
                  <div><strong>Private:</strong> {room.isPrivate ? 'Yes' : 'No'}</div>
                  <div><strong>Created:</strong> {new Date(room.createdAt).toLocaleString()}</div>
                  <div><strong>Players:</strong> {room.players.length}/{room.maxPlayers}</div>
                </div>

                <div className="mt-2">
                  <strong className="text-sm">Players:</strong>
                  {room.players.length === 0 ? (
                    <div className="text-sm italic">No players</div>
                  ) : (
                    <ul className="list-disc list-inside text-sm">
                      {room.players.map((player, index) => (
                        <li key={index}>
                          {player.username} {player.isHost ? '(Host)' : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDebugger;