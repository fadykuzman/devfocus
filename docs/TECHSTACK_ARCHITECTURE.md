# DevFocus Technical Architecture: IDE-Centric Flow Timer

## Architecture Overview

**Core Principle**: Timer lives IN the IDE, not as separate application
**Backend**: Go service for session management and cross-IDE coordination
**Frontend**: Native IDE plugins + optional web dashboard for analytics

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                           Activity Tracking Layer                             │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│   nvim Plugin   │ IntelliJ Plugin │ VS Code Extension│   Browser Extensions    │
│     (Lua)       │     (Java)      │   (TypeScript)   │ Chrome/Firefox (JS)     │
│                 │                 │                  │                         │
│ • Status line   │ • Status bar    │ • Status bar     │ • Dev domain tracking   │
│ • File tracking │ • Project det.  │ • Activity track │ • Research categorization│
│ • HTTP client   │ • HTTP client   │ • HTTP client    │ • Local processing      │
└─────────┬───────┴─────────┬───────┴─────────┬───────┴─────────┬───────────────┘
          │                 │                 │                 │
          └─────────────────┼─────────────────┼─────────────────┘
                            │                 │
                    ┌───────▼─────────────────▼───────────────────────┐
                    │           Terminal Tracking                     │
                    │                                                 │
                    │ • Shell hooks (bash/zsh)                       │
                    │ • Command categorization                        │
                    │ • Privacy-safe logging                          │
                    └─────────────────┬───────────────────────────────┘
                                      │ REST API (HTTP)
              ┌─────────────────────────▼─────────────────────────────────────┐
              │                  Go Backend Service                           │
              │                                                               │
              │ • Multi-source activity aggregation (IDE+Browser+Terminal)    │
              │ • Cross-context session synchronization                       │
              │ • SQLite database (local storage)                             │
              │ • Context preservation logic                                  │
              │ • AI pattern analysis engine                                  │
              │ • REST API server (:8080)                                     │
              │ • Privacy-first data processing                               │
              └─────────────────────────┬─────────────────────────────────────┘
                                        │ HTTP API
              ┌─────────────────────────▼─────────────────────────────────────┐
              │                 Web Dashboard (Essential)                     │
              │                                                               │
              │ • React/Next.js comprehensive analytics                       │
              │ • Multi-source session visualization                          │
              │ • Cross-context insights (coding + research + terminal)       │
              │ • AI-generated workflow recommendations                        │
              │ • Privacy controls and data export                            │
              └───────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend: Go Service

**Framework**: Standard library + Fiber/Gin for HTTP
**Database**: SQLite (local, privacy-first)
**Communication**: REST API for IDE plugins
**Deployment**: Single binary executable

```go
// Core packages
github.com/gofiber/fiber/v2       // HTTP framework
github.com/mattn/go-sqlite3       // Database
github.com/fsnotify/fsnotify      // File system watching
golang.org/x/sync                 // Concurrency primitives
```

**Key responsibilities**:
- Session lifecycle management (start/pause/resume/end)
- Multi-source activity aggregation (IDE + browser + terminal)
- Cross-context session correlation
- Context preservation and restoration
- AI pattern analysis on comprehensive workflow data
- Local data storage and privacy-first processing

### IDE Plugins

#### Neovim Plugin (Lua)
```lua
-- File: ~/.config/nvim/lua/devfocus/init.lua
-- Uses built-in HTTP client and nvim API
-- Minimal overhead, fast startup
-- Status line integration
-- File/buffer change tracking
```

**Lua advantages**:
- Native neovim scripting language
- Excellent performance
- Direct access to nvim API
- Simple HTTP client capabilities

#### IntelliJ Plugin (Java/Kotlin)
```java
// Uses IntelliJ Platform SDK
// com.intellij.openapi.project.Project
// com.intellij.openapi.application.ApplicationManager
// Status bar widget integration
// Project and file activity listeners
```

**Java advantages**:
- Native IntelliJ platform integration
- Full access to IDE internals
- Robust plugin ecosystem
- Enterprise-grade tooling

#### VS Code Extension (TypeScript)
```typescript
// Uses VS Code Extension API
// vscode.workspace for project detection
// vscode.window.onDidChangeActiveTextEditor
// Status bar integration
// Activity tracking via API events
```

**TypeScript advantages**:
- Native VS Code extension language
- Excellent developer experience
- Rich extension API
- Strong typing support

### Browser Extensions

#### Chrome/Firefox Extensions (JavaScript)
```javascript
// Uses Web Extensions API
// chrome.tabs for activity tracking
// Local storage for privacy-first processing
// Whitelisted domain filtering
// Integration with Go backend via HTTP
```

**JavaScript advantages**:
- Cross-browser compatibility (Chrome + Firefox)
- Rich Web Extensions API
- Local processing capabilities
- Privacy-friendly implementation possible

### Terminal Integration

#### Shell Hooks (Bash/Zsh)
```bash
# Shell integration via PROMPT_COMMAND
# Command categorization and timing
# Privacy-safe logging (command types only)
# HTTP integration with Go backend
# Cross-shell compatibility
```

**Shell integration advantages**:
- Universal across Linux/macOS environments
- Lightweight and non-intrusive
- Privacy-preserving by design
- Easy installation and setup

### Web Dashboard (Essential)

**Framework**: React/Next.js (reuse existing codebase)
**Purpose**: Comprehensive analytics, multi-source insights, configuration
**Access**: `http://localhost:8080/dashboard`
**Usage**: Essential for visualizing cross-context workflow data (IDE + browser + terminal)

## Data Flow & Session Management

### Session Lifecycle

1. **Session Start**
   ```
   IDE Opens → Plugin detects → HTTP POST /sessions/start
   ```

2. **Activity Tracking**
   ```
   File changes → Plugin sends → HTTP PUT /sessions/activity
   Typing detected → Plugin sends → HTTP PUT /sessions/activity
   ```

3. **Cross-IDE Switching**
   ```
   nvim → IntelliJ: Session continues seamlessly
   Backend aggregates activity from both IDEs
   ```

4. **Interruption Handling**
   ```
   Slack message → IDE loses focus → HTTP POST /sessions/pause
   Context captured: current file, line, function
   ```

5. **Session Resume**
   ```
   Return to IDE → Plugin sends → HTTP POST /sessions/resume
   Backend responds with restoration context
   ```

### API Design

```go
// REST API endpoints
POST   /api/v1/sessions/start
PUT    /api/v1/sessions/activity
POST   /api/v1/sessions/pause
POST   /api/v1/sessions/resume
POST   /api/v1/sessions/end
GET    /api/v1/sessions/current
POST   /api/v1/context/save
GET    /api/v1/context/restore
POST   /api/v1/terminal/activity
POST   /api/v1/browser/activity
GET    /api/v1/analytics/patterns
GET    /api/v1/analytics/sessions
GET    /api/v1/analytics/cross-context
```

### Database Schema

```sql
-- SQLite schema for local storage
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY,
    start_time DATETIME,
    end_time DATETIME,
    total_duration INTEGER, -- seconds
    project_path TEXT,
    project_name TEXT,
    ide_type TEXT, -- nvim, intellij, vscode
    pause_count INTEGER,
    interruption_duration INTEGER
);

CREATE TABLE activities (
    id INTEGER PRIMARY KEY,
    session_id INTEGER,
    timestamp DATETIME,
    source_type TEXT, -- ide, browser, terminal
    source_detail TEXT, -- nvim, chrome, bash
    file_path TEXT,
    line_number INTEGER,
    activity_type TEXT, -- typing, file_change, focus_lost, command, page_view
    metadata TEXT, -- JSON for source-specific data
    FOREIGN KEY (session_id) REFERENCES sessions (id)
);

CREATE TABLE browser_activities (
    id INTEGER PRIMARY KEY,
    session_id INTEGER,
    timestamp DATETIME,
    domain TEXT,
    page_title TEXT,
    url_hash TEXT, -- hashed for privacy
    category TEXT, -- research, tickets, docs, distraction
    duration INTEGER,
    FOREIGN KEY (session_id) REFERENCES sessions (id)
);

CREATE TABLE terminal_activities (
    id INTEGER PRIMARY KEY,
    session_id INTEGER,
    timestamp DATETIME,
    command_category TEXT, -- git, npm, terraform, etc
    duration INTEGER,
    project_path TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions (id)
);

CREATE TABLE contexts (
    id INTEGER PRIMARY KEY,
    session_id INTEGER,
    timestamp DATETIME,
    file_path TEXT,
    line_number INTEGER,
    function_name TEXT,
    notes TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions (id)
);
```

## Development Phases

### Phase 1: Go Backend + VS Code (Week 1-2)
**Goal**: Prove the architecture with one IDE

```
devfocus-backend/
├── cmd/devfocus/main.go
├── internal/
│   ├── api/          # HTTP handlers
│   ├── session/      # Session management
│   ├── storage/      # SQLite operations
│   └── models/       # Data structures
├── go.mod
└── go.sum

vscode-extension/
├── src/
│   ├── extension.ts      # Main extension entry
│   ├── session-tracker.ts # Activity monitoring
│   ├── api-client.ts     # Backend communication
│   └── status-bar.ts     # UI integration
├── package.json
└── tsconfig.json
```

### Phase 2: Multi-IDE Support (Week 3-4)
**Goal**: Add nvim and IntelliJ plugins

```
nvim-plugin/
├── lua/devfocus/
│   ├── init.lua         # Plugin entry point
│   ├── session.lua      # Session management
│   ├── http.lua         # API client
│   └── statusline.lua   # UI integration

intellij-plugin/
├── src/main/java/com/devfocus/
│   ├── DevFocusPlugin.java
│   ├── SessionTracker.java
│   ├── ApiClient.java
│   └── StatusBarWidget.java
├── plugin.xml
└── build.gradle
```

### Phase 3: AI Insights (Week 5-8)
**Goal**: Pattern analysis and optimization suggestions

```go
// Add to Go backend
internal/
├── ai/
│   ├── pattern_analyzer.go  # Productivity pattern detection
│   ├── repetition_detector.go # Repetitive task identification
│   ├── optimization_engine.go # Workflow suggestions
│   └── models.go            # AI data structures
```

### Phase 4: Advanced Features (Month 3+)
- Self-hosted sync across devices
- Advanced context preservation
- Team coordination features (optional)
- Plugin marketplace distribution

## Privacy & Security

### Local-First Architecture
- **All data stored locally** in SQLite database
- **No cloud dependencies** for core functionality
- **No telemetry** or external data transmission
- **Encrypted sync** option for multi-device (future)

### Data Minimization
- **No code content tracking** - only file paths and metadata
- **No keystroke logging** - activity detection only
- **Configurable tracking** - granular privacy controls
- **Data retention policies** - automatic cleanup options

## Deployment & Distribution

### Go Backend
```bash
# Single binary distribution
go build -o devfocus ./cmd/devfocus
./devfocus  # Starts on :8080
```

### IDE Plugin Distribution
- **VS Code**: VS Code Marketplace
- **nvim**: GitHub releases + package managers
- **IntelliJ**: JetBrains Plugin Repository

### Installation Process
1. Install Go backend binary
2. Install IDE plugin(s) for your editors
3. Plugin auto-discovers backend on localhost:8080
4. Start coding - timer begins automatically

## Performance Considerations

### Go Backend
- **Lightweight**: ~10MB memory footprint
- **Fast startup**: <100ms initialization
- **Efficient storage**: SQLite with indexed queries
- **Low CPU**: Event-driven architecture

### IDE Plugins
- **Minimal overhead**: <1MB memory per plugin
- **Non-blocking**: Async HTTP calls to backend
- **Battery friendly**: Efficient activity detection
- **Fast UI updates**: 1-second timer refresh rate

## Migration from Current React Codebase

### What to Keep
- **React components**: Repurpose for web dashboard
- **Timer logic concepts**: Adapt to Go backend
- **Test patterns**: Apply to Go and plugin testing
- **UI design**: Status bar aesthetics

### What to Replace
- **Next.js timer**: Becomes analytics dashboard
- **React hooks**: Timer logic moves to Go backend
- **Browser focus**: IDE activity detection instead
- **Manual controls**: Automatic session management

### Migration Strategy
1. **Parallel development**: Build Go backend alongside current React app
2. **Gradual transition**: Start with one IDE plugin
3. **Feature parity**: Ensure Go backend matches React timer functionality
4. **Dashboard evolution**: Transform React app into analytics interface
5. **Plugin rollout**: Add IDE plugins incrementally

This architecture prioritizes your actual workflow - seamless flow timing within your development environment, with powerful analytics available when needed.