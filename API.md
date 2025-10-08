# LocalYapper API Documentation

## Overview

LocalYapper provides a RESTful API for managing chat sessions, personas, bots, and AI interactions. All endpoints return JSON responses and use standard HTTP status codes.

## Authentication

Currently uses a simple demo user system. All endpoints require a valid user context.

## Endpoints

### AI Integration

#### GET /api/ollama/models
List available Ollama models.

**Response:**
```json
{
  "models": [
    {
      "name": "llama3.2:3b",
      "size": "2.0GB",
      "modified_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/ollama/chat
Stream chat responses from Ollama.

**Request Body:**
```json
{
  "model": "llama3.2:3b",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
  ],
  "stream": true
}
```

**Response:** Server-Sent Events stream
```
data: {"content": "Hello", "done": false}
data: {"content": " there!", "done": false}
data: {"done": true}
```

### Persona Management

#### GET /api/personas
List all user personas.

**Response:**
```json
{
  "personas": [
    {
      "id": "persona-1",
      "name": "Alex",
      "description": "A curious developer",
      "systemPrompt": "You are Alex, a software developer...",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/personas
Create a new persona.

**Request Body:**
```json
{
  "name": "Sam",
  "description": "A creative writer",
  "systemPrompt": "You are Sam, a novelist with a passion for storytelling..."
}
```

#### GET /api/personas/[id]
Get a specific persona.

#### PUT /api/personas/[id]
Update a persona.

#### DELETE /api/personas/[id]
Delete a persona.

### Bot Management

#### GET /api/bots
List all user bots.

**Response:**
```json
{
  "bots": [
    {
      "id": "bot-1",
      "name": "Assistant",
      "description": "A helpful AI assistant",
      "color": "#3b82f6",
      "systemPrompt": "You are a helpful AI assistant...",
      "modelName": "llama3.2:3b",
      "temperature": 0.7,
      "topP": 0.9,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/bots
Create a new bot.

#### GET /api/bots/[id]
Get a specific bot.

#### PUT /api/bots/[id]
Update a bot.

#### DELETE /api/bots/[id]
Delete a bot.

### Session Management

#### GET /api/sessions
List all chat sessions.

**Response:**
```json
{
  "sessions": [
    {
      "id": "session-1",
      "title": "Evening Chat",
      "bot": {
        "id": "bot-1",
        "name": "Assistant",
        "color": "#3b82f6"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "messageCount": 5
    }
  ]
}
```

#### POST /api/sessions
Create a new session.

**Request Body:**
```json
{
  "botId": "bot-1",
  "title": "New Conversation"
}
```

#### GET /api/sessions/[id]
Get a specific session with messages.

#### DELETE /api/sessions/[id]
Delete a session.

#### POST /api/sessions/[id]/message
Send a message to a session.

**Request Body:**
```json
{
  "content": "Hello, how are you?",
  "personaId": "persona-1"
}
```

**Response:** Server-Sent Events stream
```
data: {"role": "assistant", "content": "I'm doing well, thank you!"}
data: {"done": true}
```

### Search & Export

#### GET /api/search/internal
Search across all user data.

**Query Parameters:**
- `q`: Search query (required)

**Response:**
```json
{
  "results": {
    "personas": [
      {
        "id": "persona-1",
        "name": "Alex",
        "type": "persona",
        "match": "developer"
      }
    ],
    "bots": [...],
    "sessions": [...],
    "messages": [...]
  }
}
```

#### GET /api/export
Export all user data as JSON.

**Response:**
```json
{
  "version": "1.0",
  "exportedAt": "2024-01-01T00:00:00Z",
  "user": {
    "name": "Demo User",
    "email": "demo@example.com",
    "theme": "system",
    "defaultModel": "llama3.2:3b"
  },
  "personas": [...],
  "bots": [...],
  "sessions": [...]
}
```

#### POST /api/import
Import user data from JSON.

**Request Body:** JSON export data

**Response:**
```json
{
  "success": true,
  "imported": {
    "personas": 3,
    "bots": 2,
    "sessions": 5
  }
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

Error responses include:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Rate Limiting

Currently no rate limiting is implemented. For production use, consider adding rate limiting to prevent abuse.

## Data Types

### Persona
```typescript
{
  id: string;
  userId: string;
  name: string;
  description?: string;
  systemPrompt: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Bot
```typescript
{
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  systemPrompt: string;
  modelName: string;
  temperature: number;
  topP: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### ChatSession
```typescript
{
  id: string;
  userId: string;
  botId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Message
```typescript
{
  id: string;
  sessionId: string;
  personaId?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}
```