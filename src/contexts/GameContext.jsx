import React, { createContext, useState, useEffect, useContext, useCallback, useReducer } from 'react';
import { useAuth } from './AuthContext';
import socketService from '../services/socketService';
import gameService from '../services/gameService';
import { GAME_CONFIG } from '../constants/gameRules';
import { CARDS } from '../constants/cards';

// Initial game state
const initialGameState = {
  roomId: null,
  roomName: '',
  inviteCode: '',
  isHost: false,
  isPrivate: true,
  gameStarted: false,
  gameEnded: false,
  winner: null,
  players: [],
  currentPlayerId: null,
  turnTimeLeft: GAME_CONFIG.TURN_TIME_LIMIT,
  hand: [],
  deck: [],
  discardPile: [],
  lastAction: null,
  chatMessages: [],
  error: null,
  loading: false
};

// Game reducer to handle state changes
function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'JOIN_ROOM':
      return {
        ...state,
        roomId: action.payload.roomId,
        roomName: action.payload.roomName,
        inviteCode: action.payload.inviteCode,
        isHost: action.payload.isHost,
        isPrivate: action.payload.isPrivate,
        players: action.payload.players
      };
    
    case 'LEAVE_ROOM':
      return initialGameState;
    
    case 'UPDATE_PLAYERS':
      return { ...state, players: action.payload };
    
    case 'PLAYER_READY':
      return {
        ...state,
        players: state.players.map(player => 
          player.id === action.payload ? { ...player, isReady: true } : player
        )
      };
    
    case 'START_GAME':
      return {
        ...state,
        gameStarted: true,
        hand: action.payload.hand,
        currentPlayerId: action.payload.currentPlayerId,
        turnTimeLeft: GAME_CONFIG.TURN_TIME_LIMIT
      };
    
    case 'END_GAME':
      return {
        ...state,
        gameEnded: true,
        gameStarted: false,
        winner: action.payload
      };
    
    case 'UPDATE_HAND':
      return { ...state, hand: action.payload };
    
    case 'UPDATE_GAME_STATE':
      return {
        ...state,
        players: action.payload.players,
        currentPlayerId: action.payload.currentPlayerId,
        turnTimeLeft: action.payload.turnTimeLeft,
        hand: action.payload.hand || state.hand,
        deck: action.payload.deck || state.deck,
        discardPile: action.payload.discardPile || state.discardPile,
        lastAction: action.payload.lastAction || state.lastAction
      };
    
    case 'UPDATE_TURN':
      return {
        ...state,
        currentPlayerId: action.payload.playerId,
        turnTimeLeft: action.payload.timeLeft
      };
    
    case 'UPDATE_TIMER':
      return { ...state, turnTimeLeft: action.payload };
    
    case 'ADD_CHAT_MESSAGE':
      return { 
        ...state, 
        chatMessages: [...state.chatMessages, action.payload]
      };
    
    case 'PLAY_CARD':
      return {
        ...state,
        hand: state.hand.filter(card => card.id !== action.payload.cardId)
      };
    
    case 'DRAW_CARD':
      return {
        ...state,
        hand: [...state.hand, action.payload]
      };
    
    default:
      return state;
  }
}

// Create context
const GameContext = createContext();

export function useGame() {
  return useContext(GameContext);
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const { currentUser, authToken } = useAuth();

  // Initialize socket connection when user is authenticated
  useEffect(() => {
    if (currentUser && authToken) {
      socketService.initialize(authToken);
      
      // Listen for socket events
      setupSocketListeners();

      return () => {
        socketService.disconnect();
      };
    }
  }, [currentUser, authToken]);

  // Set up socket event listeners
  const setupSocketListeners = useCallback(() => {
    socketService.onPlayerJoined((player) => {
      dispatch({
        type: 'UPDATE_PLAYERS',
        payload: [...state.players, player]
      });
    });

    socketService.onPlayerLeft((playerId) => {
      dispatch({
        type: 'UPDATE_PLAYERS',
        payload: state.players.filter(player => player.id !== playerId)
      });
    });

    socketService.onGameStarted((gameState) => {
      dispatch({
        type: 'START_GAME',
        payload: {
          hand: gameState.hand,
          currentPlayerId: gameState.currentPlayerId
        }
      });
    });

    socketService.onGameStateUpdate((gameState) => {
      dispatch({
        type: 'UPDATE_GAME_STATE',
        payload: gameState
      });
    });

    socketService.onTurnChange((data) => {
      dispatch({
        type: 'UPDATE_TURN',
        payload: {
          playerId: data.playerId,
          timeLeft: data.timeLeft
        }
      });
    });

    socketService.onTimerUpdate((timeLeft) => {
      dispatch({
        type: 'UPDATE_TIMER',
        payload: timeLeft
      });
    });

    socketService.onGameEnded((winner) => {
      dispatch({
        type: 'END_GAME',
        payload: winner
      });
    });

    socketService.onChatMessage((message) => {
      dispatch({
        type: 'ADD_CHAT_MESSAGE',
        payload: message
      });
    });

    socketService.onError((error) => {
      dispatch({
        type: 'SET_ERROR',
        payload: error
      });
    });
  }, [state.players]);

  // Create a new game room
  const createRoom = useCallback(async (roomName, isPrivate = true, maxPlayers = GAME_CONFIG.MAX_PLAYERS) => {
    if (!currentUser) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const roomData = await gameService.createRoom(
        authToken,
        roomName,
        isPrivate,
        maxPlayers
      );
      
      socketService.joinRoom(roomData.roomId);
      
      dispatch({
        type: 'JOIN_ROOM',
        payload: {
          roomId: roomData.roomId,
          roomName: roomData.name,
          inviteCode: roomData.inviteCode,
          isHost: true,
          isPrivate: roomData.isPrivate,
          players: [{ ...currentUser, isHost: true, isReady: false }]
        }
      });
      
      return roomData;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [currentUser, authToken]);

  // Join an existing room
  const joinRoom = useCallback(async (inviteCode) => {
    if (!currentUser) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const roomData = await gameService.joinRoom(authToken, inviteCode);
      
      socketService.joinRoom(roomData.roomId);
      
      dispatch({
        type: 'JOIN_ROOM',
        payload: {
          roomId: roomData.roomId,
          roomName: roomData.name,
          inviteCode: roomData.inviteCode,
          isHost: false,
          isPrivate: roomData.isPrivate,
          players: [...roomData.players, { ...currentUser, isHost: false, isReady: false }]
        }
      });
      
      return roomData;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [currentUser, authToken]);

  // Leave the current room
  const leaveRoom = useCallback(() => {
    if (state.roomId) {
      socketService.leaveRoom(state.roomId);
      dispatch({ type: 'LEAVE_ROOM' });
    }
  }, [state.roomId]);

  // Set player ready status
  const setReady = useCallback(() => {
    if (!currentUser || !state.roomId) return;
    
    socketService.setReady(state.roomId);
    dispatch({
      type: 'PLAYER_READY',
      payload: currentUser.id
    });
  }, [currentUser, state.roomId]);

  // Start the game (host only)
  const startGame = useCallback(() => {
    if (!currentUser || !state.roomId || !state.isHost) return;
    
    socketService.startGame(state.roomId);
  }, [currentUser, state.roomId, state.isHost]);

  // Play a card
  const playCard = useCallback((cardId, targetId, targetType) => {
    if (!currentUser || !state.roomId || state.currentPlayerId !== currentUser.id) {
      return false;
    }
    
    socketService.playCard(state.roomId, cardId, targetId, targetType);
    
    dispatch({
      type: 'PLAY_CARD',
      payload: { cardId }
    });
    
    return true;
  }, [currentUser, state.roomId, state.currentPlayerId]);

  // Send a chat message
  const sendChatMessage = useCallback((message) => {
    if (!currentUser || !state.roomId) return;
    
    socketService.sendChatMessage(state.roomId, message);
    
    const newMessage = {
      userId: currentUser.id,
      username: currentUser.username,
      message,
      timestamp: new Date().toISOString()
    };
    
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: newMessage
    });
  }, [currentUser, state.roomId]);

  // Find available public rooms
  const findPublicRooms = useCallback(async () => {
    if (!authToken) return [];
    
    try {
      const rooms = await gameService.getPublicRooms(authToken);
      return rooms;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return [];
    }
  }, [authToken]);

  // Clear any error messages
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Check if it's the current user's turn
  const isMyTurn = useCallback(() => {
    return currentUser && state.currentPlayerId === currentUser.id;
  }, [currentUser, state.currentPlayerId]);

  // Get the current active player
  const getActivePlayer = useCallback(() => {
    if (!state.currentPlayerId) return null;
    return state.players.find(player => player.id === state.currentPlayerId);
  }, [state.players, state.currentPlayerId]);

  // Context value
  const value = {
    ...state,
    createRoom,
    joinRoom,
    leaveRoom,
    setReady,
    startGame,
    playCard,
    sendChatMessage,
    findPublicRooms,
    clearError,
    isMyTurn,
    getActivePlayer
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export default GameContext;