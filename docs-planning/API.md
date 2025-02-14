# API Documentation

## Document Control
- **Document Title:** API Documentation
- **Document Version:** 1.0.0
- **Date:** 2025-02-14
- **Status:** Draft
- **Author:** Cascade AI

## Table of Contents
1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [Internal APIs](#internal-apis)
4. [External APIs](#external-apis)
5. [WebSocket APIs](#websocket-apis)
6. [Error Handling](#error-handling)

## 1. Introduction

### 1.1 Purpose
This document provides comprehensive documentation for all APIs used in the Windsurf Tauri Desktop Application.

### 1.2 API Overview
The application uses several types of APIs:
- Internal Tauri Commands
- External REST APIs
- WebSocket Connections
- Database Queries

### 1.3 Common Conventions
- All timestamps use ISO 8601 format
- UUIDs are used for unique identifiers
- HTTP status codes follow standard conventions
- Authentication uses JWT tokens

## 2. Authentication

### 2.1 Login
```typescript
POST /auth/login
Content-Type: application/json

Request:
{
    "username": string,
    "password": string,
    "rememberMe": boolean
}

Response:
{
    "accessToken": string,
    "refreshToken": string,
    "expiresAt": string,
    "user": {
        "id": string,
        "username": string,
        "roles": string[]
    }
}
```

### 2.2 Refresh Token
```typescript
POST /auth/refresh
Authorization: Bearer <refresh_token>

Response:
{
    "accessToken": string,
    "refreshToken": string,
    "expiresAt": string
}
```

### 2.3 Logout
```typescript
POST /auth/logout
Authorization: Bearer <access_token>

Response:
{
    "success": boolean
}
```

## 3. Internal APIs

### 3.1 Agent Management

#### 3.1.1 List Agents
```rust
#[tauri::command]
async fn list_agents() -> Result<Vec<Agent>, Error> {
    // Implementation
}

// Types
struct Agent {
    id: String,
    name: String,
    status: AgentStatus,
    category: String,
    capabilities: Vec<String>,
}

enum AgentStatus {
    Online,
    Offline,
    Busy,
}
```

#### 3.1.2 Get Agent Details
```rust
#[tauri::command]
async fn get_agent(id: String) -> Result<AgentDetails, Error> {
    // Implementation
}

// Types
struct AgentDetails {
    id: String,
    name: String,
    status: AgentStatus,
    category: String,
    capabilities: Vec<String>,
    metadata: HashMap<String, Value>,
}
```

### 3.2 Message Handling

#### 3.2.1 Send Message
```rust
#[tauri::command]
async fn send_message(message: Message) -> Result<Message, Error> {
    // Implementation
}

// Types
struct Message {
    id: Option<String>,
    content: String,
    sender_id: String,
    receiver_id: String,
    timestamp: DateTime<Utc>,
    attachments: Vec<Attachment>,
}

struct Attachment {
    id: String,
    name: String,
    mime_type: String,
    size: u64,
    url: String,
}
```

#### 3.2.2 Get Message History
```rust
#[tauri::command]
async fn get_message_history(
    agent_id: String,
    limit: u32,
    before: Option<DateTime<Utc>>
) -> Result<Vec<Message>, Error> {
    // Implementation
}
```

### 3.3 File Operations

#### 3.3.1 Upload File
```rust
#[tauri::command]
async fn upload_file(
    file_path: String,
    metadata: FileMetadata
) -> Result<FileUploadResponse, Error> {
    // Implementation
}

// Types
struct FileMetadata {
    name: String,
    mime_type: String,
    size: u64,
}

struct FileUploadResponse {
    id: String,
    url: String,
    metadata: FileMetadata,
}
```

## 4. External APIs

### 4.1 AI Model API

#### 4.1.1 Text Generation
```typescript
POST /api/v1/generate
Content-Type: application/json
Authorization: Bearer <api_key>

Request:
{
    "prompt": string,
    "max_tokens": number,
    "temperature": number,
    "stop_sequences": string[]
}

Response:
{
    "id": string,
    "text": string,
    "usage": {
        "prompt_tokens": number,
        "completion_tokens": number,
        "total_tokens": number
    }
}
```

#### 4.1.2 Embeddings
```typescript
POST /api/v1/embeddings
Content-Type: application/json
Authorization: Bearer <api_key>

Request:
{
    "text": string,
    "model": string
}

Response:
{
    "id": string,
    "embedding": number[],
    "usage": {
        "total_tokens": number
    }
}
```

### 4.2 CRM Integration

#### 4.2.1 Get Customer
```typescript
GET /api/v1/customers/:id
Authorization: Bearer <api_key>

Response:
{
    "id": string,
    "name": string,
    "email": string,
    "status": string,
    "created_at": string,
    "metadata": object
}
```

#### 4.2.2 Update Deal
```typescript
PATCH /api/v1/deals/:id
Content-Type: application/json
Authorization: Bearer <api_key>

Request:
{
    "status": string,
    "value": number,
    "probability": number,
    "metadata": object
}

Response:
{
    "id": string,
    "status": string,
    "value": number,
    "probability": number,
    "updated_at": string
}
```

## 5. WebSocket APIs

### 5.1 Real-time Updates
```typescript
WebSocket: ws://api/v1/updates
Authorization: Bearer <access_token>

// Message Types
interface WebSocketMessage {
    type: 'agent_status' | 'new_message' | 'typing' | 'crm_update';
    payload: any;
}

// Agent Status Update
{
    type: 'agent_status',
    payload: {
        agent_id: string,
        status: 'online' | 'offline' | 'busy'
    }
}

// New Message
{
    type: 'new_message',
    payload: {
        message: Message
    }
}

// Typing Indicator
{
    type: 'typing',
    payload: {
        agent_id: string,
        is_typing: boolean
    }
}

// CRM Update
{
    type: 'crm_update',
    payload: {
        entity_type: 'customer' | 'deal',
        entity_id: string,
        update_type: 'created' | 'updated' | 'deleted',
        data: object
    }
}
```

## 6. Error Handling

### 6.1 Error Format
```typescript
interface ApiError {
    code: string;
    message: string;
    details?: object;
    stack?: string; // Only in development
}
```

### 6.2 Common Error Codes
```typescript
enum ErrorCode {
    // Authentication Errors
    INVALID_CREDENTIALS = 'auth/invalid-credentials',
    TOKEN_EXPIRED = 'auth/token-expired',
    UNAUTHORIZED = 'auth/unauthorized',
    
    // Resource Errors
    NOT_FOUND = 'resource/not-found',
    ALREADY_EXISTS = 'resource/already-exists',
    
    // Validation Errors
    INVALID_INPUT = 'validation/invalid-input',
    MISSING_FIELD = 'validation/missing-field',
    
    // External Service Errors
    AI_SERVICE_ERROR = 'service/ai-error',
    CRM_SERVICE_ERROR = 'service/crm-error',
    
    // System Errors
    INTERNAL_ERROR = 'system/internal-error',
    DATABASE_ERROR = 'system/database-error',
    NETWORK_ERROR = 'system/network-error'
}
```

### 6.3 HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error
- 503: Service Unavailable
