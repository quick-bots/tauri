@plan "Define technical architecture for Tauri v2 + Next.js AIM-inspired desktop application with MCP"
<!-- cascade-run:
  - lint-check
  - style-guide
  - vulnerability-scan
-->

# Software Design Document (SDD)

## Document Control
- **Document Title:** Software Design Document
- **Document Version:** 1.2.0
- **Date:** 2025-02-18
- **Status:** Draft
- **Author:** Preston Sparks & ChatGPT o1

## Table of Contents
1. [Introduction](#introduction)  
2. [System Architecture](#system-architecture)  
3. [Data Design](#data-design)  
4. [Interface Design](#interface-design)  
5. [Component Design](#component-design)  
6. [Security Design](#security-design)

---

## 1. Introduction

### 1.1 Purpose
@validate "Ensure comprehensive technical specification coverage"

This **Software Design Document (SDD)** details the **Tauri v2** + **Next.js** architecture for an **AIM-inspired** cross-platform desktop application with **MCP-based AI integration**. It covers data structures, component design, security, and multi-platform considerations—anchored in the **latest** research (see `project-overview.md`).

### 1.2 Scope
This document addresses:
- **System Architecture** and core components  
- **Data Flows** (local DB, AI context, resource usage)  
- **UI/UX** guidelines (AIM-style buddy list, chat windows)  
- **MCP** integration for local/remote AI  
- **Security** (ACL, encryption, resource sandboxing)

### 1.3 References
- [project-overview.md](../project-overview.md) - Primary Project Specification  
- [cascade-guidelines.md](../windsurf/cascade-guidelines.md) - Cascade AI Documentation Guidelines  

---

## 2. System Architecture

### 2.1 High-Level Architecture
@enforce "Maintain clear boundaries for Tauri, Next.js, and MCP-based AI"

```mermaid
graph TD
    subgraph "Desktop App (Tauri v2)"
        UI[Next.js/AIM UI] --> TB[Tauri Bridge]
        TB --> FL[Frontend Layer (TS)]
        TB --> BL[Backend Layer (Rust)]
    end

    subgraph "AI Integration via MCP"
        MC[MCP Client (Rust/TS)]
        MS[MCP Servers (Local & Remote)]
        LI[Local Inference]
        RM[Remote Models]
    end

    BL --> MC
    MC --> MS
    MS --> LI
    MS --> RM

    subgraph "Storage & Security"
        DB[Local DB/Key-Value Store]
        VA[Vault/Encrypted Storage]
        ACL[ACL Permissions]
    end

    BL --> DB
    BL --> VA
    BL --> ACL
```

- **Frontend Layer**: Next.js (static export), provides AIM-style UI  
- **Backend Layer**: Rust-based Tauri commands, bridging to MCP client calls  
- **MCP**: Standard protocol for local AI and external model usage  
- **Security**: Tauri v2 ACL, encryption, resource sandboxing  

### 2.2 Component Overview

- **Frontend**: Chat windows, buddy list, login, settings  
- **Backend**: Tauri commands (Rust), local AI services, logging  
- **MCP**: Resource management, prompt context, tool execution  
- **Storage & Security**: DB queries, cryptographic ops, ACL enforcement

---

## 3. Data Design

### 3.1 Database Schema
@enforce "Implement secure data storage patterns"

#### 3.1.1 Users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

#### 3.1.2 Agents
```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    capabilities JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.3 Messages
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    sender_id UUID REFERENCES users(id),
    agent_id UUID REFERENCES agents(id),
    content_encrypted BYTEA NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
```

### 3.2 Data Flows
@validate "Demonstrate how MCP, Tauri, and DB interact"

**Chat Flow**:
1. UI triggers a chat message → Tauri command → Rust backend  
2. Rust calls MCP if AI processing is needed → returns AI response  
3. Message content is encrypted/stored in DB  
4. UI updates with new message or AI output  

**Agent Status Flow**:
1. UI polls or receives push updates from Rust  
2. Rust fetches agent statuses via MCP (local/remote)  
3. Database updates status or logs events  
4. UI buddy list re-renders with fresh statuses  

---

## 4. Interface Design

### 4.1 UI Components
@enforce "Use AIM-inspired design metaphors"

1. **Login Window**  
   - Username/password fields + “Remember Me”  
   - Subtle info about server connections, MCP status  
   - Version information

2. **Buddy List**  
   - Collapsible categories  
   - Online/offline icons  
   - MCP-based capabilities (tool icons, agent type)

3. **Chat Window**  
   - Message history (time-stamped)  
   - Input area (text, attachments)  
   - Optional AI “reply” indicator if local or remote model is active

### 4.2 API Interfaces
@enforce "Implement Tauri commands + MCP calls"

#### 4.2.1 Tauri Commands
- `#[tauri::command] fn mcp_invoke(...) -> Result<...>`  
- `#[tauri::command] fn send_message(...) -> ...`  
- `#[tauri::command] fn get_agent_status(...) -> ...`  

#### 4.2.2 MCP Endpoints
- **Resource system**: Access local DB or remote files  
- **Tool system**: Handle local inference or remote model calls  
- **Prompt management**: Manage multi-step AI dialogues

---

## 5. Component Design

### 5.1 Frontend Components
@enforce "Adopt Next.js with static export"

- **LoginScreen**  
  - Manages user credentials and Tauri handshake  
  - Possibly shows simplified server list or agent readiness

- **BuddyList**  
  - Displays agent categories, real-time statuses  
  - MCP-based health or availability indicators

- **ChatView**  
  - Renders conversation, attachments, timestamps  
  - Invokes Tauri commands for AI inference or remote calls  
  - Displays typing or AI “thinking” indicators

### 5.2 Backend Components
@enforce "Use Rust for local AI, Tauri commands, and MCP bridging"

- **Command Handlers**  
  - `mcp_invoke`: Bridges AI requests from UI to MCP servers  
  - `get_agents`: Lists agents from DB  
  - `send_message`: Stores messages, optionally calls AI

- **AI Modules**  
  - **Local Inference** (ONNX or Rust-based NLP)  
  - **Remote AI** (HTTP/WebSocket endpoints wrapped by MCP)  
  - Session or context management for multi-step AI

- **Security & Resource Management**  
  - Tauri v2 ACL to restrict commands by window or user  
  - Resource isolation or sandbox for local AI tools  
  - Logging (e.g., `tracing`) for all AI or user actions

---

## 6. Security Design
@validate "Ensure compliance with Tauri v2 ACL, encryption, resource sandboxing"

### 6.1 Authentication & Authorization
- Tauri commands gated by ACL (`tauri.conf.json`)  
- Role-based restrictions (admin, user) from DB  
- Potential multi-factor auth in the future

### 6.2 Encryption & Key Management
- `ring` or other cryptographic libraries for message content  
- Optional local key storage in `tauri-plugin-store`  
- Secure channel (TLS) for remote AI endpoints

### 6.3 Resource Access Control
- **MCP** sessions determine permissible tools/resources  
- Each agent or user has a separate context with only assigned capabilities  
- Audit logs for all resource or tool calls

### 6.4 Audit Logging
- Record all Tauri commands (time, user, action)  
- Log MCP calls (local vs. remote AI usage)  
- Store data in DB for compliance or debugging

---

<!-- cascade-run: vulnerability-scan -->