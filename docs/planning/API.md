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
4. [MCP Protocol APIs](#mcp-protocol-apis)
5. [External APIs](#external-apis)
6. [WebSocket APIs](#websocket-apis)
7. [Error Handling](#error-handling)

## 1. Introduction

### 1.1 Purpose
This document provides comprehensive documentation for all APIs used in the Windsurf Tauri Desktop Application.

### 1.2 API Overview
The application uses several types of APIs:
- Internal Tauri Commands
- MCP Protocol APIs
- External REST APIs
- WebSocket Connections
- Database Queries

### 1.3 Common Conventions
- All timestamps use ISO 8601 format
- UUIDs are used for unique identifiers
- HTTP status codes follow standard conventions
- Authentication uses JWT tokens
- MCP message format follows protocol specification

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

### 3.1 MCP Client Management

#### 3.1.1 Initialize MCP Client
```rust
#[tauri::command]
async fn init_mcp_client(config: MCPClientConfig) -> Result<MCPClientHandle, Error> {
    // Implementation
}

// Types
struct MCPClientConfig {
    name: String,
    version: String,
    capabilities: ClientCapabilities,
}

struct ClientCapabilities {
    resources: bool,
    tools: bool,
    prompts: bool,
}

struct MCPClientHandle {
    id: String,
    status: ConnectionStatus,
}
```

#### 3.1.2 Connect to MCP Server
```rust
#[tauri::command]
async fn connect_mcp_server(
    client_id: String,
    server_url: String,
    transport_type: TransportType
) -> Result<ServerConnection, Error> {
    // Implementation
}

// Types
enum TransportType {
    SSE,
    Stdio,
    Custom(String),
}

struct ServerConnection {
    id: String,
    capabilities: ServerCapabilities,
    status: ConnectionStatus,
}
```

### 3.2 Resource Management

#### 3.2.1 List Resources
```rust
#[tauri::command]
async fn list_mcp_resources(
    client_id: String,
    filter: Option<ResourceFilter>
) -> Result<Vec<Resource>, Error> {
    // Implementation
}

// Types
struct ResourceFilter {
    types: Option<Vec<String>>,
    tags: Option<Vec<String>>,
    query: Option<String>,
}

struct Resource {
    uri: String,
    type_: String,
    name: String,
    metadata: HashMap<String, Value>,
}
```

#### 3.2.2 Access Resource
```rust
#[tauri::command]
async fn access_mcp_resource(
    client_id: String,
    uri: String
) -> Result<ResourceContent, Error> {
    // Implementation
}

// Types
struct ResourceContent {
    content: Value,
    metadata: HashMap<String, Value>,
    timestamp: DateTime<Utc>,
}
```

### 3.3 Tool Management

#### 3.3.1 Execute Tool
```rust
#[tauri::command]
async fn execute_mcp_tool(
    client_id: String,
    tool_request: ToolRequest
) -> Result<ToolResponse, Error> {
    // Implementation
}

// Types
struct ToolRequest {
    name: String,
    parameters: Value,
    timeout: Option<Duration>,
}

struct ToolResponse {
    result: Value,
    metadata: HashMap<String, Value>,
}
```

#### 3.3.2 List Tools
```rust
#[tauri::command]
async fn list_mcp_tools(
    client_id: String,
    filter: Option<ToolFilter>
) -> Result<Vec<Tool>, Error> {
    // Implementation
}

// Types
struct ToolFilter {
    categories: Option<Vec<String>>,
    capabilities: Option<Vec<String>>,
}

struct Tool {
    name: String,
    description: String,
    parameters: JSONSchema,
    capabilities: Vec<String>,
}
```

### 3.4 Prompt Management

#### 3.4.1 Register Prompt
```rust
#[tauri::command]
async fn register_mcp_prompt(
    client_id: String,
    prompt: PromptDefinition
) -> Result<PromptHandle, Error> {
    // Implementation
}

// Types
struct PromptDefinition {
    id: String,
    template: String,
    parameters: Value,
    resources: Vec<String>,
}

struct PromptHandle {
    id: String,
    status: PromptStatus,
}
```

#### 3.4.2 Execute Prompt
```rust
#[tauri::command]
async fn execute_mcp_prompt(
    client_id: String,
    prompt_id: String,
    parameters: Value
) -> Result<PromptResult, Error> {
    // Implementation
}

// Types
struct PromptResult {
    output: String,
    metadata: HashMap<String, Value>,
    resources_used: Vec<String>,
}
```

## 4. MCP Protocol APIs

### 4.1 Message Types

```typescript
// Base Message
interface MCPMessage {
    jsonrpc: "2.0";
    id?: string | number;
}

// Request Message
interface MCPRequest extends MCPMessage {
    method: string;
    params: unknown;
}

// Response Message
interface MCPResponse extends MCPMessage {
    result?: unknown;
    error?: {
        code: number;
        message: string;
        data?: unknown;
    };
}

// Notification Message
interface MCPNotification extends MCPMessage {
    method: string;
    params: unknown;
}
```

### 4.2 Transport Protocols

#### 4.2.1 SSE Transport
```typescript
// Connection URL format
sse://<host>:<port>/<path>?token=<auth_token>

// Message format
event: <event_type>
data: <json_message>
id: <message_id>
```

#### 4.2.2 Stdio Transport
```typescript
// Message format
Content-Length: <length>
Content-Type: application/vnd.mcp+json

<json_message>
```

## 5. External APIs

### 5.1 AI Model Integration

#### 5.1.1 MCP AI Server
```typescript
// Server Configuration
interface MCPAIServer {
    name: string;
    version: string;
    capabilities: {
        models: string[];
        tools: Tool[];
        resources: Resource[];
    };
}

// Tool Execution
interface AIToolRequest {
    model: string;
    prompt: string;
    parameters: Record<string, unknown>;
    resources: string[];
}

interface AIToolResponse {
    result: string;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
    metadata: Record<string, unknown>;
}
```

## 6. WebSocket APIs

### 6.1 Real-time Updates
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

## 7. Error Handling

### 7.1 Error Format
```typescript
interface ApiError {
    code: string;
    message: string;
    details?: object;
    stack?: string; // Only in development
}
```

### 7.2 Common Error Codes
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

### 7.3 HTTP Status Codes
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
