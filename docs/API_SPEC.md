# API Specification

## IPC Channels (Electron Desktop)

### Message Operations
- **save-message(conversationId, message)**
  Input: conversationId (string), message (object)
  Output: {success: bool, messageId: string}
  
- **load-messages(conversationId)**
  Input: conversationId (string)
  Output: {success: bool, messages: array}
  
- **delete-messages(conversationId)**
  Input: conversationId (string)
  Output: {success: bool}

### Settings Operations
- **save-settings(settings)**
  Input: settings (object)
  Output: {success: bool}
  
- **load-settings()**
  Input: none
  Output: {success: bool, settings: object}

### System Integration
- **show-notification(title, body)**
  Input: title (string), body (string)
  Output: {success: bool}
  
- **open-file-dialog()**
  Input: none
  Output: {success: bool, filePath: string}

### Window Control
- **minimize-window()**
  Input: none
  Output: void
  
- **maximize-window()**
  Input: none
  Output: void
  
- **close-window()**
  Input: none
  Output: void

### App Information
- **get-app-version()**
  Input: none
  Output: {version: string}
  
- **get-app-path()**
  Input: none
  Output: {path: string}

## REST API (Backend - Optional)

### Authentication Endpoints
- **POST /auth/register**
  Body: {username, email, password}
  Response: {success, userId, token}
  
- **POST /auth/login**
  Body: {email, password}
  Response: {success, userId, token}
  
- **POST /auth/logout**
  Headers: Authorization
  Response: {success}

### Message Endpoints
- **GET /messages/:conversationId**
  Headers: Authorization
  Response: {messages: array}
  
- **POST /messages**
  Headers: Authorization
  Body: {conversationId, content, encrypted}
  Response: {success, messageId}
  
- **PUT /messages/:id**
  Headers: Authorization
  Body: {content, status}
  Response: {success}
  
- **DELETE /messages/:id**
  Headers: Authorization
  Response: {success}

### Conversation Endpoints
- **GET /conversations**
  Headers: Authorization
  Response: {conversations: array}
  
- **POST /conversations**
  Headers: Authorization
  Body: {userId, name}
  Response: {success, conversationId}

### Settings Endpoints
- **GET /settings**
  Headers: Authorization
  Response: {settings: object}
  
- **PUT /settings**
  Headers: Authorization
  Body: {settings: object}
  Response: {success}

## WebSocket Events (Real-time)

### Client to Server
- **message.send**
  Data: {conversationId, content, encrypted}
  
- **message.typing**
  Data: {conversationId}
  
- **user.online**
  Data: {userId}
  
- **user.offline**
  Data: {userId}

### Server to Client
- **message.received**
  Data: {messageId, conversationId, sender, content, timestamp}
  
- **message.sent**
  Data: {messageId, status}
  
- **message.read**
  Data: {messageId}
  
- **user.online**
  Data: {userId, timestamp}
  
- **user.offline**
  Data: {userId, timestamp}

## Local Storage Keys (All Platforms)

### Messages
- **messages_[conversationId]**
  Type: JSON array
  Content: All messages for conversation

### Settings
- **settings**
  Type: JSON object
  Content: User preferences
  
- **user_preferences**
  Type: JSON object
  Content: UI preferences

### Keys
- **encryption_keys**
  Type: JSON object
  Content: User's encryption keys
  
- **public_key**
  Type: String
  Content: User's public key

### State
- **last_sync_time**
  Type: Timestamp
  Content: Last sync with server
  
- **auth_token**
  Type: String
  Content: Current auth token
  
- **current_user**
  Type: JSON object
  Content: Current user info

## Error Responses

### HTTP Status Codes
- **200** OK - Success
- **201** Created - Resource created
- **400** Bad Request - Invalid input
- **401** Unauthorized - Auth required
- **403** Forbidden - No permission
- **404** Not Found - Resource not found
- **500** Server Error - Internal error
- **503** Service Unavailable - Maintenance

### Error Response Format
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional details"
}

## Rate Limiting Headers

- **X-RateLimit-Limit**: 100
- **X-RateLimit-Remaining**: 99
- **X-RateLimit-Reset**: 1234567890

## CORS Headers

- **Access-Control-Allow-Origin**: *
- **Access-Control-Allow-Methods**: GET, POST, PUT, DELETE
- **Access-Control-Allow-Headers**: Content-Type, Authorization
