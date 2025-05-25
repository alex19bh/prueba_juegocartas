import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import CreateRoom from '../components/lobby/CreateRoom';
import JoinRoom from '../components/lobby/JoinRoom';
import RoomList from '../components/lobby/RoomList';
import Modal from '../components/ui/Modal';

const LobbyPage = () => {
  const [activeTab, setActiveTab] = useState('join');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { currentUser } = useAuth();
  const { 
    roomId,
    roomName,
    inviteCode,
    isHost,
    players,
    gameStarted,
    setReady,
    startGame,
    leaveRoom,
    error,
    clearError
  } = useGame();
  
  const { roomIdFromUrl } = useParams();
  const navigate = useNavigate();
  
  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);
  
  // If game starts, redirect to game page
  useEffect(() => {
    if (gameStarted && roomId) {
      navigate(`/game/${roomId}`);
    }
  }, [gameStarted, roomId, navigate]);
  
  // Current user in the room
  const currentPlayer = players.find(player => player.id === currentUser?.id);
  const isReady = currentPlayer?.isReady;
  const allPlayersReady = players.length > 0 && players.every(player => player.isReady);
  const canStartGame = isHost && allPlayersReady && players.length >= 2;
  
  // Copy invite code to clipboard
  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setShowInviteModal(true);
  };
  
  // Handle ready button
  const handleReady = () => {
    setReady();
  };
  
  // Handle start game button
  const handleStartGame = () => {
    startGame();
  };
  
  // Handle leave room button
  const handleLeaveRoom = () => {
    leaveRoom();
  };

  // Room UI when player is in a room
  const renderRoomUI = () => {
    if (!roomId) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Room header */}
        <div className="bg-green-700 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">{roomName || 'Sala de juego'}</h2>
            <p className="text-sm text-green-100">
              Código de invitación: <span className="font-mono font-bold">{inviteCode}</span>
              <Button 
                variant="outline"
                size="sm"
                className="ml-2 py-0 px-2 text-xs"
                onClick={copyInviteCode}
              >
                Copiar
              </Button>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLeaveRoom}
          >
            Salir
          </Button>
        </div>
        
        {/* Players list */}
        <div className="p-6">
          <h3 className="font-bold text-lg mb-4">Jugadores</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {players.map(player => (
              <div 
                key={player.id} 
                className={`flex items-center p-3 rounded-lg border ${
                  player.isReady ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <img 
                  src={player.avatarUrl || '/assets/images/avatars/default-1.png'} 
                  alt={player.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-grow">
                  <div className="font-medium">
                    {player.username}
                    {player.isHost && (
                      <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                        Anfitrión
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {player.isReady ? 'Listo ✅' : 'No listo...'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Game controls */}
          <div className="flex justify-center space-x-4">
            {!isHost ? (
              <Button
                onClick={handleReady}
                disabled={isReady}
                variant={isReady ? "outline" : "primary"}
                fullWidth
              >
                {isReady ? '¡Listo!' : 'Listo para jugar'}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleReady}
                  disabled={isReady}
                  variant={isReady ? "outline" : "primary"}
                >
                  {isReady ? '¡Listo!' : 'Listo para jugar'}
                </Button>
                <Button
                  onClick={handleStartGame}
                  disabled={!canStartGame}
                  variant="secondary"
                >
                  Iniciar partida
                </Button>
              </>
            )}
          </div>
          
          {isHost && !canStartGame && players.length < 2 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Se necesitan al menos 2 jugadores para iniciar la partida.
            </p>
          )}
          
          {isHost && !canStartGame && !allPlayersReady && players.length >= 2 && (
            <p className="text-center text-sm text-gray-500 mt-4">
              Todos los jugadores deben estar listos para iniciar la partida.
            </p>
          )}
        </div>
      </div>
    );
  };
  
  // Lobby UI when player is not in a room
  const renderLobbyUI = () => {
    if (roomId) return null;
    
    return (
      <>
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'join'
                ? 'text-green-600 border-b-2 border-green-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('join')}
          >
            Unirse a sala
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'create'
                ? 'text-green-600 border-b-2 border-green-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Crear sala
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === 'public'
                ? 'text-green-600 border-b-2 border-green-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('public')}
          >
            Salas públicas
          </button>
        </div>
        
        {/* Tab content */}
        <div className="mb-8">
          {activeTab === 'join' && <JoinRoom />}
          {activeTab === 'create' && <CreateRoom />}
          {activeTab === 'public' && <RoomList />}
        </div>
      </>
    );
  };
  
  // Invite code modal
  const renderInviteModal = () => {
    return (
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Código de invitación copiado"
        size="sm"
      >
        <div className="py-4 text-center">
          <p className="mb-4">
            El código ha sido copiado al portapapeles. Compártelo con tus amigos para que puedan unirse a tu sala.
          </p>
          <div className="bg-gray-100 p-3 rounded-lg font-mono text-center font-bold">
            {inviteCode}
          </div>
        </div>
      </Modal>
    );
  };
  
  // Error modal
  const renderErrorModal = () => {
    return (
      <Modal
        isOpen={!!error}
        onClose={clearError}
        title="Error"
        size="sm"
      >
        <div className="py-4">
          <p>{error}</p>
        </div>
      </Modal>
    );
  };
  
  if (!currentUser) {
    return null; // Don't render anything while redirecting
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-green-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-center mb-8">
            {roomId ? 'Sala de espera' : 'Lobby'}
          </h1>
          
          {renderRoomUI()}
          {renderLobbyUI()}
          {renderInviteModal()}
          {renderErrorModal()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LobbyPage;