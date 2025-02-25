@plan "High-level API blueprint for Tauri v2.1.0 + Next.js 14.1.0 AIM-inspired desktop application with MCP v1.3.0-rc2"
<!-- cascade-run:
  - lint-check
  - style-guide
  - vulnerability-scan
-->

# API Documentation

## Document Control
- **Document Title:** API Documentation  
- **Document Version:** 1.0.0
- **Parent Document Version:** Project Overview v1.0.0
- **Date:** 2025-02-25  
- **Status:** Preliminary Draft  
- **Author:** Preston Sparks
- **Last Audit:** 2025-02-25

## Changelog
- **1.0.0** (2025-02-25):
  - Aligned version with Project Overview v1.0.0
  - Added explicit framework versions
  - Updated port standards
  - Added parent document reference
  - Added last audit date

- **0.2.0** (2025-02-18):
  - Initial draft of API documentation
  - Added port standards
  - Added MCP integration details
  - Added Tauri command structure

> **IMPORTANT**: This document is a **preliminary draft**. All endpoints, commands, and structures are **subject to change** once the actual code implementation begins. Use it as a **high-level reference**, and update it incrementally with each development milestone.

## Table of Contents
1. [Overview](#overview)  
2. [MCP Integration](#mcp-integration)  
3. [Tauri Commands](#tauri-commands)  
4. [External Services](#external-services)  
5. [WebSocket Events](#websocket-events)  
6. [Error Handling](#error-handling)

---

## 1. Overview
@enforce "Maintain flexible, AI-friendly API structure"

### 1.1 Architecture Overview
The API strategy is **multi-layered**, reflecting:
- **Tauri v2.1.0** commands for desktop integration  
- **MCP v1.3.0-rc2** for local/remote AI models  
- **Next.js 14.1.0** for frontend implementation
- **Local storage** or resource access  
- **External services** (e.g., remote AI, security modules)

### 1.2 Authentication
@enforce "Implement robust authentication and ACL"
@validate "Follow ACL in tauri.conf.json"
@validate "Restrict local resource writes"

- **Token-based** authentication using JWT (JSON Web Tokens)
- Strong cryptographic standards for data storage/transit
- Secure token storage via `tauri-plugin-store`
- ACL-based permission management with Tauri v2's advanced IPC
- Session-based context handling with strict isolation
- MCP-based resource gating and tool sandboxing

#### 1.2.1 Tauri ACL Configuration
```typescript
// @cite "Following Tauri v2 ACL best practices: https://tauri.app/v2/guides/security/acl"
interface CommandACL {
  // System commands require elevated privileges
  'api/v1/system/status': ['ADMIN', 'SYSTEM'],
  'api/v1/system/version': ['*'],  // Public access
  
  // File operations require appropriate permissions
  'api/v1/files/save': ['USER', 'ADMIN'],
  'api/v1/files/read': ['USER', 'ADMIN'],
  
  // MCP operations have granular control
  'api/v1/mcp/resources': ['USER', 'ADMIN', 'AI_AGENT'],
  'api/v1/mcp/models': ['USER', 'ADMIN', 'AI_AGENT'],
  
  // Context and resource isolation
  'api/v1/context/create': ['ADMIN', 'SYSTEM'],
  'api/v1/resource/access': ['USER', 'ADMIN', 'AI_AGENT']
}
```

### 1.3 Port Standards
Following official framework standards:
- **FastAPI Services**: 8000 (primary), 8001-8003 (supporting services)
- **Redis**: 6379
- **RabbitMQ**: 5672 (AMQP), 15672 (Management)
- **Prometheus**: 9090
- **Grafana**: 3000
- **Tauri Development**: 1420 (default)
- **MCP Services**: 8001 (primary), 8002 (worker)
- **WebSocket Events**: 8003
- **Security Services**: 8004

---

## 2. MCP Integration
@enforce "Implement strict context isolation"

### 2.1 Context Isolation Requirements
```typescript
// @version Tauri v2.1.0, MCP v1.3.0-rc2
interface MCPContext {
  id: string;
  securityLevel: 'user' | 'system' | 'agent';
  resourceQuota: {
    maxMemory: number;    // in MB
    maxStorage: number;   // in MB
    maxConcurrency: number;
  };
  allowedOperations: string[];
}

interface ContextIsolationGuard {
  validateCrossContextRequest(source: MCPContext, target: MCPContext): Promise<ValidationResult>;
  auditContextAccess(context: MCPContext, resource: string): Promise<AuditRecord>;
  enforceIsolationBoundaries(contexts: MCPContext[]): Promise<void>;
}

interface MCPClient {
  connect(options: ConnectOptions & { 
    context: MCPContext,
    isolationGuard: ContextIsolationGuard 
  }): Promise<void>;
  // ... existing operations
}
```

### 2.2 Resource Discovery Patterns
```typescript
interface ResourceDiscovery {
  scan(): Promise<AvailableResources>;
  inspect(resource: string): Promise<ResourceMetadata>;
  validateAccess(context: MCPContext, resource: string): Promise<boolean>;
}

interface ValidationMarkup {
  nodes: Array<{
    id: string;
    type: 'tool' | 'pipeline' | 'connection';
    status: 'valid' | 'warning' | 'error';
    message?: string;
    visual: {
      color: string;
      icon: string;
      position: { x: number; y: number };
    };
  }>;
  connections: Array<{
    from: string;
    to: string;
    status: 'valid' | 'warning' | 'error';
    message?: string;
  }>;
}

interface ToolChaining {
  chain(tools: string[]): Promise<Pipeline>;
  validate(pipeline: Pipeline): Promise<ValidationMarkup>;
  pipelineDiagram(pipeline: Pipeline): Promise<PipelineVisualization>;
  execute(pipeline: Pipeline, input: unknown): Promise<unknown>;
}

interface PipelineVisualization {
  svg: string;  // SVG markup for pipeline diagram
  interactive: boolean;
  annotations: ValidationMarkup;
}
```

### 2.3 Client Operations (Placeholder)
```typescript
// Example shape - subject to real implementation
interface MCPClient {
  connect(options: ConnectOptions): Promise<void>;
  executeModel(params: ModelParams): Promise<ModelResult>;
  accessResource(uri: string): Promise<Resource>;
  listTools(): Promise<string[]>;
}
```
- **Connect**: Initiates a session with local or remote AI.  
- **executeModel**: Single or multi-step AI calls.  
- **accessResource**: Retrieves local/remote resources (files, data, etc.).  
- **listTools**: Discovers available AI or system tools.

### 2.4 Resource Management
```typescript
// Example shape - subject to real implementation
interface ResourceOperations {
  discover(): Promise<Resource[]>;
  get(uri: string): Promise<Resource>;
  update(uri: string, content: unknown): Promise<void>;
  watch(uri: string, callback: (update: ResourceUpdate) => void): void;
}
```
- **discover**: Lists resources (local or remote).  
- **get**: Fetches resource content.  
- **update**: Edits or overwrites resource data.  
- **watch**: Subscribes to real-time updates.

---

## 3. Tauri Commands
@plan "Detailed commands to be defined as Tauri code evolves"
@cite "Following Tauri v2 Command API documentation: https://tauri.app/v2/guides/features/command"

### 3.1 Core System Commands
```rust
/// Get system status information
#[tauri::command]
#[command_with_permissions("api/v1/system/status")]
async fn get_system_status() -> Result<SystemStatus, SystemError> {
    // Returns standardized system metrics
}

/// Get application version and build info
#[tauri::command]
#[command_with_permissions("api/v1/system/version")]
async fn get_version() -> Result<VersionInfo, SystemError> {
    // Returns version, build number, and environment
}
```

### 3.2 MCP Resource Commands
```rust
/// Access MCP resources with proper isolation
#[tauri::command]
#[command_with_permissions("api/v1/mcp/resources")]
async fn access_mcp_resource(resource_id: String) -> Result<Resource, MCPError> {
    // Handles MCP resource access with context isolation
}

/// Execute MCP model operations
#[tauri::command]
#[command_with_permissions("api/v1/mcp/models")]
async fn execute_model(model_params: ModelParams) -> Result<ModelResponse, MCPError> {
    // Executes model operations with proper resource management
}
```

### 3.3 Chat Interface Commands
```rust
/// Manage buddy list operations
#[tauri::command]
#[command_with_permissions("api/v1/chat/buddies")]
async fn manage_buddy_list(action: BuddyAction) -> Result<BuddyResponse, ChatError> {
    // Handles buddy list updates and status changes
}

/// Handle chat messages
#[tauri::command]
#[command_with_permissions("api/v1/chat/messages")]
async fn handle_message(message: ChatMessage) -> Result<MessageResponse, ChatError> {
    // Processes chat messages with typing indicators
}
```

---

## 4. External Services
@plan "Exact endpoints to be confirmed once remote AI integrations are selected"

### 4.1 AI Model Services
```typescript
interface ModelService {
  query(input: string): Promise<AIResponse>;
  stream(input: string): AsyncGenerator<AIResponse>;
}
```
- **query**: Single-turn AI requests.  
- **stream**: Stream-based approach for partial or continuous responses.

### 4.2 Security Services
```typescript
interface HardwareSecurityModule {
  // TPM-backed key operations
  generateKey(algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305'): Promise<TPMKey>;
  wrapKey(key: CryptoKey): Promise<TPMWrappedKey>;
  unwrapKey(wrappedKey: TPMWrappedKey): Promise<CryptoKey>;
  attestKey(key: TPMKey): Promise<TPMAttestation>;
}

interface SecurityService {
  // Hardware-backed encryption using TPM
  encrypt(data: Buffer, algorithm: 'AES-256-GCM' | 'ChaCha20-Poly1305'): Promise<{
    encrypted: Buffer,
    keyAttestation: TPMAttestation
  }>;
  decrypt(data: Buffer, wrappedKey: TPMWrappedKey): Promise<Buffer>;
  
  // TPM-backed key management
  rotateKeys(hsm: HardwareSecurityModule): Promise<void>;
  backupKeys(destination: string, hsm: HardwareSecurityModule): Promise<void>;
  
  // Digital signatures using TPM
  sign(payload: Buffer): Promise<{
    signature: Buffer,
    attestation: TPMAttestation
  }>;
  verifySignature(payload: Buffer, signature: Buffer, attestation: TPMAttestation): Promise<boolean>;
}
```
- **encrypt**/**decrypt**: Possibly performed by Rust + Tauri plugin.  
- **verifySignature**: For secure updates or important messages.

---

## 5. WebSocket Events
@enforce "Implement consistent real-time event handling"

### 5.1 Chat Events
```typescript
type DockingPosition = 'left' | 'right' | 'floating' | 'snapped';

interface ChatWindow {
  id: string;
  position: {
    x: number;
    y: number;
    docking: DockingPosition;
  };
  size: {
    width: number;
    height: number;
  };
  snapToGrid: boolean;
}

interface ChatEvents {
  // AIM-style buddy list management
  onBuddyStatus(handler: (update: BuddyStatusUpdate) => void): void;
  onBuddyTyping(handler: (status: BuddyTypingStatus) => void): void;
  onBuddyIdle(handler: (status: BuddyIdleStatus) => void): void;
  
  // Chat window management with AIM-style docking
  onWindowCreate(handler: (window: ChatWindow) => void): void;
  onWindowMinimize(handler: (window: ChatWindow) => void): void;
  onWindowRestore(handler: (window: ChatWindow) => void): void;
  onWindowDock(handler: (window: ChatWindow, position: DockingPosition) => void): void;
  onWindowSnap(handler: (window: ChatWindow, snapGrid: SnapGrid) => void): void;
  
  // Real-time agent updates
  onAgentThinking(handler: (status: AgentThinkingStatus) => void): void;
  onAgentResponse(handler: (response: AgentResponse) => void): void;
  onAgentError(handler: (error: AgentError) => void): void;
}
```
- **onMessage**: Real-time incoming chat messages.  
- **onTypingStatus**: UI updates to show typing/idle states.  
- **onAgentStatus**: Buddy list or AI agent presence changes.

### 5.2 System Events
```typescript
interface SystemEvents {
  onError(handler: (error: SystemError) => void): void;
  onUpdate(handler: (update: AppUpdate) => void): void;
}
```
- **onError**: Global error reporting (could tie to Sentry).  
- **onUpdate**: Tauri’s auto-updater notifications or version prompts.

---

## 6. Error Handling
@enforce "Implement consistent error handling across all endpoints"
@validate "Follow Tauri v2 error handling best practices"

### 6.1 Standard Error Types
```rust
#[derive(Debug, Error)]
pub enum SystemError {
    #[error("System operation failed: {0}")]
    OperationFailed(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    #[error("Resource not found: {0}")]
    NotFound(String),
}

#[derive(Debug, Error)]
pub enum MCPError {
    #[error("MCP operation failed: {0}")]
    OperationFailed(String),
    #[error("Resource access denied: {0}")]
    AccessDenied(String),
    #[error("Resource quota exceeded: {0}")]
    QuotaExceeded(String),
    #[error("Invalid context: {0}")]
    InvalidContext(String),
}

#[derive(Debug, Error)]
pub enum ChatError {
    #[error("Chat operation failed: {0}")]
    OperationFailed(String),
    #[error("Invalid message format: {0}")]
    InvalidFormat(String),
    #[error("Buddy not found: {0}")]
    BuddyNotFound(String),
}
```

### 6.2 Error Response Format
All errors follow a consistent JSON structure:
```typescript
interface ErrorResponse {
  code: string;        // Machine-readable error code
  message: string;     // Human-readable error message
  details?: unknown;   // Optional additional context
  timestamp: string;   // ISO 8601 timestamp
  requestId?: string;  // For tracking/debugging
}
```

### 6.3 Common Error Codes
Standard error codes across all endpoints:
- `SYSTEM_ERROR`: Internal system errors
- `PERMISSION_DENIED`: Authentication or authorization failures
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `INVALID_REQUEST`: Malformed or invalid request
- `QUOTA_EXCEEDED`: Resource usage limits exceeded
- `CONTEXT_ERROR`: MCP context-related issues

### 6.4 Error Handling Best Practices
1. **Consistent Format**: All errors use the standard ErrorResponse structure
2. **Appropriate Detail**: Include helpful context without exposing sensitive information
3. **Logging**: All errors are logged with proper severity levels
4. **Recovery**: Where possible, include suggestions for error recovery
5. **Security**: Sanitize error messages to prevent information disclosure

---

> **Note**:  
> - **This doc** serves as a **starting blueprint** and **will evolve** alongside actual coding.  
> - We use `@plan`, `@phase`, `@enforce`, etc. to guide Cascade AI in code generation, testing, and security checks.  
> - Real endpoints and data structures will be **finalized** once Tauri commands, Next.js components, and MCP servers are concretely defined.  

<!-- cascade-run: vulnerability-scan -->