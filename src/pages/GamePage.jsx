import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import GameBoard from '../components/game/GameBoard';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const GamePage = () => {
  const { roomId } = useParams();
  const { currentUser } = useAuth();
  const { 
    gameStarted, 
    gameEnded, 
    winner, 
    error, 
    clearError,
    leaveRoom 
  } = useGame();
  
  const navigate = useNavigate();
  
  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
    }
  }, [currentUser, navigate]);
  
  // Handle room errors and redirects
  useEffect(() => {
    if (!roomId) {
      navigate('/lobby');
    }
  }, [roomId, navigate]);
  
  const handleLeaveGame = () => {
    leaveRoom();
    navigate('/lobby');
  };
  
  // Modal for game end
  const renderGameEndModal = () => {
    if (!gameEnded) return null;
    
    const isWinner = winner && winner.id === currentUser?.id;
    
    return (
      <Modal
        isOpen={true}
        onClose={() => navigate('/lobby')}
        title={isWinner ? '¡Victoria!' : 'Fin de la partida'}
        closeOnOverlayClick={false}
      >
        <div className="text-center py-6">
          {isWinner ? (
            <div>
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-green-600">¡Has ganado la partida!</h3>
              <p className="mt-2">Felicidades, has conseguido construir un cuerpo completo.</p>
            </div>
          ) : (
            <div>
              <div className="text-6xl mb-4">👑</div>
              <h3 className="text-xl font-bold">Victoria para {winner?.username}</h3>
              <p className="mt-2">Ha construido un cuerpo completo.</p>
            </div>
          )}
          
          <div className="mt-8">
            <Button
              onClick={() => navigate('/lobby')}
              fullWidth
            >
              Volver al Lobby
            </Button>
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
      >
        <div className="py-4">
          <p>{error}</p>
        </div>
      </Modal>
    );
  };
  
  // If not logged in or no roomId, don't render
  if (!currentUser || !roomId) {
    return null;
  }
  
  return (
    <div className="flex flex-col h-screen">
      {/* Game toolbar */}
      <div className="bg-green-900 text-white px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <span className="font-bold">VIRUS! Online</span>
          <span className="ml-2 px-2 py-0.5 bg-green-700 rounded text-xs">
            Sala: {roomId}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLeaveGame}
        >
          Abandonar Partida
        </Button>
      </div>
      
      {/* Main game area */}
      <div className="flex-grow overflow-hidden">
        {gameStarted ? (
          <GameBoard />
        ) : (
          <div className="flex items-center justify-center h-full bg-green-700">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Esperando al inicio de la partida</h2>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
              <p>La partida comenzará en breve...</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={handleLeaveGame}
              >
                Volver al Lobby
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Render modals */}
      {renderGameEndModal()}
      {renderErrorModal()}
    </div>
  );
};

export default GamePage;