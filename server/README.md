# El Virus Game Server

Backend server implementation for the El Virus online multiplayer card game, providing robust real-time gameplay through Socket.IO.

## Features

- **User Authentication**: Complete registration and login system with JWT
- **Real-time Multiplayer**: WebSocket-based real-time game experience
- **Game Room Management**: Create, join, and manage game rooms
- **Game State Synchronization**: Synchronized game state across all players
- **Chat Functionality**: In-game chat between players

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Adjust the variables as needed:
     - `PORT`: Server port (default: 5000)
     - `MONGO_URI`: MongoDB connection string
     - `JWT_SECRET`: Secret key for JWT tokens
     - `CLIENT_URL`: Frontend URL for CORS

3. Start the development server:
   ```
   npm run dev
   ```

4. For production:
   ```
   npm start
   ```

## API Documentation

### Authentication Endpoints

#### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "player1",
    "email": "player1@example.com",
    "password": "securepassword",
    "avatarUrl": "/assets/images/avatars/avatar1.png" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "username": "player1",
      "email": "player1@example.com",
      "avatarUrl": "/assets/images/avatars/avatar1.png"
    }
  }
  ```

#### Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "player1@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: Same as register endpoint

#### Get Current User
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**:
  ```json
  {
    "user": {
      "id": "user-id",
      "username": "player1",
      "email": "player1@example.com",
      "avatarUrl": "/assets/images/avatars/avatar1.png",
      "stats": {
        "gamesPlayed": 10,
        "gamesWon": 3,
        "winRate": 30,
        "organCollected": 25,
        "virusSpread": 18
      }
    }
  }
  ```

#### Get User Stats
- **URL**: `/api/auth/stats`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**:
  ```json
  {
    "stats": {
      "gamesPlayed": 10,
      "gamesWon": 3,
      "winRate": 30,
      "organCollected": 25,
      "virusSpread": 18
    }
  }
  ```

#### Update User Profile
- **URL**: `/api/auth/profile`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Body**:
  ```json
  {
    "username": "new_username", // Optional
    "email": "new_email@example.com", // Optional
    "avatarUrl": "/assets/images/avatars/avatar2.png" // Optional
  }
  ```
- **Response**:
  ```json
  {
    "user": {
      "id": "user-id",
      "username": "new_username",
      "email": "new_email@example.com",
      "avatarUrl": "/assets/images/avatars/avatar2.png",
      "stats": {
        "gamesPlayed": 10,
        "gamesWon": 3,
        "winRate": 30,
        "organCollected": 25,
        "virusSpread": 18
      }
    }
  }
  ```

#### Change Password
- **URL**: `/api/auth/password`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Body**:
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```

#### Delete Account
- **URL**: `/api/auth/account`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Body**:
  ```json
  {
    "password": "currentpassword"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Account deleted successfully"
  }
  ```

### Room Management Endpoints

#### Create Room
- **URL**: `/api/rooms`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Body**:
  ```json
  {
    "name": "Game Room 1",
    "isPrivate": true, // Optional, default: true
    "maxPlayers": 4 // Optional, default: 6
  }
  ```
- **Response**:
  ```json
  {
    "roomId": "room-id",
    "name": "Game Room 1",
    "inviteCode": "XYZ123",
    "isPrivate": true,
    "maxPlayers": 4,
    "players": [
      {
        "id": "user-id",
        "username": "player1",
        "avatarUrl": "/assets/images/avatars/avatar1.png",
        "isHost": true,
        "isReady": false
      }
    ]
  }
  ```

#### Join Room
- **URL**: `/api/rooms/join`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Body**:
  ```json
  {
    "inviteCode": "XYZ123"
  }
  ```
- **Response**:
  ```json
  {
    "roomId": "room-id",
    "name": "Game Room 1",
    "inviteCode": "XYZ123",
    "isPrivate": true,
    "maxPlayers": 4,
    "players": [
      {
        "id": "user-id-1",
        "username": "player1",
        "avatarUrl": "/assets/images/avatars/avatar1.png",
        "isHost": true,
        "isReady": false
      },
      {
        "id": "user-id-2",
        "username": "player2",
        "avatarUrl": "/assets/images/avatars/avatar2.png",
        "isHost": false,
        "isReady": false
      }
    ]
  }
  ```

#### Get Public Rooms
- **URL**: `/api/rooms/public`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**:
  ```json
  [
    {
      "roomId": "room-id-1",
      "name": "Game Room 1",
      "players": 2,
      "maxPlayers": 4,
      "createdAt": "2023-06-01T12:00:00Z"
    },
    {
      "roomId": "room-id-2",
      "name": "Game Room 2",
      "players": 3,
      "maxPlayers": 6,
      "createdAt": "2023-06-01T12:30:00Z"
    }
  ]
  ```

#### Get Room Details
- **URL**: `/api/rooms/:roomId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**:
  ```json
  {
    "roomId": "room-id",
    "name": "Game Room 1",
    "inviteCode": "XYZ123",
    "isPrivate": true,
    "maxPlayers": 4,
    "players": [
      {
        "id": "user-id-1",
        "username": "player1",
        "avatarUrl": "/assets/images/avatars/avatar1.png",
        "isHost": true,
        "isReady": true
      },
      {
        "id": "user-id-2",
        "username": "player2",
        "avatarUrl": "/assets/images/avatars/avatar2.png",
        "isHost": false,
        "isReady": false
      }
    ],
    "gameStarted": false
  }
  ```

#### Set Ready Status
- **URL**: `/api/rooms/:roomId/ready`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Body**:
  ```json
  {
    "ready": true // or false
  }
  ```
- **Response**:
  ```json
  {
    "roomId": "room-id",
    "allPlayersReady": false,
    "players": [
      {
        "id": "user-id-1",
        "username": "player1",
        "isHost": true,
        "isReady": true
      },
      {
        "id": "user-id-2",
        "username": "player2",
        "isHost": false,
        "isReady": false
      }
    ]
  }
  ```

#### Leave Room
- **URL**: `/api/rooms/:roomId/leave`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**:
  ```json
  {
    "message": "Successfully left room",
    "newHostId": "user-id-2" // If host left and new host was assigned
  }
  ```

#### Send Chat Message
- **URL**: `/api/rooms/:roomId/message`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Body**:
  ```json
  {
    "message": "Hello everyone!"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Message sent",
    "timestamp": "2023-06-01T13:45:22Z"
  }
  ```

### Game Management Endpoints

#### Start Game
- **URL**: `/api/rooms/:roomId/start`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**:
  ```json
  {
    "message": "Game started successfully",
    "gameId": "game-id"
  }
  ```

#### Get Game State
- **URL**: `/api/rooms/:roomId/game/:gameId`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**:
  ```json
  {
    "gameId": "game-id",
    "players": [
      {
        "id": "user-id-1",
        "username": "player1",
        "avatarUrl": "/assets/images/avatars/avatar1.png",
        "organs": [
          {
            "id": "organ-card-id",
            "type": "organ",
            "color": "red",
            "status": "healthy"
          }
        ]
      },
      {
        "id": "user-id-2",
        "username": "player2",
        "avatarUrl": "/assets/images/avatars/avatar2.png",
        "organs": [],
        "handCount": 3
      }
    ],
    "currentPlayerId": "user-id-1",
    "turnTimeLeft": 45,
    "hand": [
      {
        "id": "card-id-1",
        "type": "virus",
        "color": "blue",
        "name": "Virus Blue"
      },
      {
        "id": "card-id-2",
        "type": "medicine",
        "color": "green",
        "name": "Medicine Green"
      }
    ],
    "discardPile": [
      {
        "id": "card-id-3",
        "type": "organ",
        "color": "yellow",
        "name": "Organ Yellow"
      }
    ],
    "deckCount": 45,
    "gameStatus": "active"
  }
  ```

#### Play Card
- **URL**: `/api/rooms/:roomId/game/:gameId/play`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Body**:
  ```json
  {
    "cardId": "card-id-1",
    "targetId": "user-id-2", // Optional, depends on card type
    "targetType": "player" // Optional, depends on card type
  }
  ```
- **Response**:
  ```json
  {
    "message": "Card played successfully",
    "newCard": {
      "id": "card-id-4",
      "type": "organ",
      "color": "blue",
      "name": "Organ Blue"
    },
    "hand": [
      {
        "id": "card-id-2",
        "type": "medicine",
        "color": "green",
        "name": "Medicine Green"
      },
      {
        "id": "card-id-4",
        "type": "organ",
        "color": "blue",
        "name": "Organ Blue"
      }
    ],
    "currentPlayerId": "user-id-2",
    "turnTimeLeft": 60
  }
  ```

#### End Turn
- **URL**: `/api/rooms/:roomId/game/:gameId/end-turn`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**:
  ```json
  {
    "message": "Turn ended successfully",
    "currentPlayerId": "user-id-2",
    "turnTimeLeft": 60
  }
  ```

#### Get Game Stats
- **URL**: `/api/rooms/:roomId/game/:gameId/stats`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer jwt-token-here`
- **Response**:
  ```json
  {
    "gameId": "game-id",
    "players": [
      {
        "id": "user-id-1",
        "username": "player1",
        "avatarUrl": "/assets/images/avatars/avatar1.png",
        "stats": {
          "gamesPlayed": 11,
          "gamesWon": 4,
          "winRate": 36.36
        },
        "organs": 3
      },
      {
        "id": "user-id-2",
        "username": "player2",
        "avatarUrl": "/assets/images/avatars/avatar2.png",
        "stats": {
          "gamesPlayed": 7,
          "gamesWon": 2,
          "winRate": 28.57
        },
        "organs": 4
      }
    ],
    "gameStatus": "completed",
    "winner": {
      "userId": "user-id-2",
      "username": "player2"
    },
    "createdAt": "2023-06-01T13:00:00Z",
    "updatedAt": "2023-06-01T13:30:00Z"
  }
  ```

## Socket.IO Events

### Connection Events

- **connect**: Client connects to the server
- **disconnect**: Client disconnects from the server
- **error**: Error occurs in the socket connection

### Room Events

- **joinRoom**: Client joins a room
- **roomJoined**: Confirmation that client joined a room
- **playerJoined**: Notification that another player joined the room
- **leaveRoom**: Client leaves a room
- **roomLeft**: Confirmation that client left the room
- **playerLeft**: Notification that another player left the room
- **playerReady**: Client sets ready status
- **playerStatusChanged**: Notification of player ready status change
- **allPlayersReady**: Notification that all players in the room are ready
- **chatMessage**: Chat message sent/received in a room
- **playerDisconnected**: Notification that a player disconnected

### Game Events

- **startGame**: Start the game (host only)
- **gameStarted**: Notification that the game has started
- **dealHand**: Initial hand dealt to player
- **playCard**: Client plays a card
- **cardDrawn**: New card drawn after playing
- **endTurn**: Client ends their turn
- **getGameState**: Client requests current game state
- **gameStateUpdate**: Update of the game state
- **turnChange**: Notification of turn change to a different player
- **timerUpdate**: Update of the turn timer
- **gameEnded**: Notification that the game has ended with a winner

## Error Handling

All API endpoints return appropriate HTTP status codes:

- **200**: Success
- **201**: Successfully created
- **400**: Bad request (invalid inputs)
- **401**: Unauthorized (authentication issues)
- **403**: Forbidden (permission issues)
- **404**: Not found
- **500**: Server error

## Frontend Integration

The frontend should:

1. Initialize Socket.IO connection with the auth token:
   ```javascript
   const socket = io('http://localhost:5000', {
     auth: { token: authToken }
   });
   ```

2. Handle real-time events as they occur:
   ```javascript
   socket.on('gameStateUpdate', (data) => {
     // Update game UI with new state
   });
   ```

3. Emit events to the server when taking actions:
   ```javascript
   socket.emit('playCard', {
     roomId: 'room-id',
     gameId: 'game-id',
     cardId: 'card-id-1',
     targetId: 'user-id-2'
   });
   ```