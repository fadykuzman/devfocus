# Phase 1: MVP Flow Timer Implementation

**Duration**: 1-2 weeks (10-15 hours total)
**Goal**: Replace current Pomodoro countdown with working flow-based timer system
**Success**: Automatic time tracking without flow interruption, clear visibility into daily development time

---

## Overview: What We're Building

**Current State**: Traditional Pomodoro countdown timer (40min countdown + 10sec break)
**Target State**: Flow-based count-up timer with automatic VS Code integration and session analytics

**Core Components**:
1. **Go Backend Service** - Session tracking and data storage
2. **VS Code Extension** - Primary timer interface and activity tracking
3. **Web Dashboard** - Analytics and session visualization (evolved from current React app)

**Key Paradigm Shift**: From forced breaks to natural flow sessions with optional break suggestions

---

## Component 1: Go Backend Service (6-8 hours)

### **1.1 Project Structure & Setup** (1 hour)

```
devfocus-backend/
├── cmd/
│   └── devfocus/
│       └── main.go                 # Application entry point
├── internal/
│   ├── api/
│   │   ├── handlers.go            # HTTP request handlers
│   │   ├── routes.go              # Route definitions
│   │   └── middleware.go          # CORS, logging middleware
│   ├── models/
│   │   ├── session.go             # Session data structures
│   │   └── activity.go            # Activity data structures
│   ├── storage/
│   │   ├── sqlite.go              # Database operations
│   │   └── migrations.go          # Database schema
│   └── services/
│       ├── session_manager.go     # Session business logic
│       └── timer_service.go       # Flow timer logic
├── go.mod
├── go.sum
└── README.md
```

**Initialize Go module**:
```bash
go mod init github.com/[username]/devfocus-backend
go get github.com/gofiber/fiber/v2
go get github.com/mattn/go-sqlite3
go get github.com/gofiber/fiber/v2/middleware/cors
```

### **1.2 Data Models** (1 hour)

**File**: `internal/models/session.go`
```go
package models

import (
    "time"
)

type Session struct {
    ID              int       `json:"id" db:"id"`
    StartTime       time.Time `json:"start_time" db:"start_time"`
    EndTime         *time.Time `json:"end_time,omitempty" db:"end_time"`
    Duration        int       `json:"duration" db:"duration"` // seconds
    ProjectPath     string    `json:"project_path" db:"project_path"`
    ProjectName     string    `json:"project_name" db:"project_name"`
    IDEType         string    `json:"ide_type" db:"ide_type"`
    Status          string    `json:"status" db:"status"` // active, paused, completed
    PauseCount      int       `json:"pause_count" db:"pause_count"`
    LastActivity    time.Time `json:"last_activity" db:"last_activity"`
}

type SessionSummary struct {
    TotalSessions   int           `json:"total_sessions"`
    TotalDuration   int           `json:"total_duration"`
    AverageSession  int           `json:"average_session"`
    ProjectsWorked  []string      `json:"projects_worked"`
    LongestSession  int           `json:"longest_session"`
}
```

**File**: `internal/models/activity.go`
```go
package models

import "time"

type Activity struct {
    ID           int       `json:"id" db:"id"`
    SessionID    int       `json:"session_id" db:"session_id"`
    Timestamp    time.Time `json:"timestamp" db:"timestamp"`
    ActivityType string    `json:"activity_type" db:"activity_type"`
    FilePath     string    `json:"file_path,omitempty" db:"file_path"`
    LineNumber   int       `json:"line_number,omitempty" db:"line_number"`
    IDEType      string    `json:"ide_type" db:"ide_type"`
}

type Context struct {
    ID           int       `json:"id" db:"id"`
    SessionID    int       `json:"session_id" db:"session_id"`
    Timestamp    time.Time `json:"timestamp" db:"timestamp"`
    FilePath     string    `json:"file_path" db:"file_path"`
    LineNumber   int       `json:"line_number" db:"line_number"`
    FunctionName string    `json:"function_name,omitempty" db:"function_name"`
    Notes        string    `json:"notes,omitempty" db:"notes"`
}
```

### **1.3 Database Layer** (1.5 hours)

**File**: `internal/storage/sqlite.go`
```go
package storage

import (
    "database/sql"
    "fmt"
    "time"

    _ "github.com/mattn/go-sqlite3"
    "github.com/[username]/devfocus-backend/internal/models"
)

type Database struct {
    db *sql.DB
}

func NewDatabase(dbPath string) (*Database, error) {
    db, err := sql.Open("sqlite3", dbPath)
    if err != nil {
        return nil, fmt.Errorf("failed to open database: %w", err)
    }

    d := &Database{db: db}
    if err := d.migrate(); err != nil {
        return nil, fmt.Errorf("failed to migrate database: %w", err)
    }

    return d, nil
}

func (d *Database) migrate() error {
    schema := `
    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time DATETIME NOT NULL,
        end_time DATETIME,
        duration INTEGER DEFAULT 0,
        project_path TEXT NOT NULL,
        project_name TEXT NOT NULL,
        ide_type TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        pause_count INTEGER DEFAULT 0,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        activity_type TEXT NOT NULL,
        file_path TEXT,
        line_number INTEGER,
        ide_type TEXT NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions (id)
    );

    CREATE TABLE IF NOT EXISTS contexts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        file_path TEXT NOT NULL,
        line_number INTEGER,
        function_name TEXT,
        notes TEXT,
        FOREIGN KEY (session_id) REFERENCES sessions (id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
    CREATE INDEX IF NOT EXISTS idx_activities_session_id ON activities(session_id);
    CREATE INDEX IF NOT EXISTS idx_contexts_session_id ON contexts(session_id);
    `

    _, err := d.db.Exec(schema)
    return err
}

// Session operations
func (d *Database) CreateSession(session *models.Session) error {
    query := `
        INSERT INTO sessions (start_time, project_path, project_name, ide_type, status, last_activity)
        VALUES (?, ?, ?, ?, ?, ?)
    `
    result, err := d.db.Exec(query, session.StartTime, session.ProjectPath,
                            session.ProjectName, session.IDEType, session.Status, session.LastActivity)
    if err != nil {
        return err
    }

    id, err := result.LastInsertId()
    if err != nil {
        return err
    }

    session.ID = int(id)
    return nil
}

func (d *Database) GetActiveSession() (*models.Session, error) {
    query := `SELECT * FROM sessions WHERE status = 'active' ORDER BY start_time DESC LIMIT 1`

    var session models.Session
    err := d.db.QueryRow(query).Scan(
        &session.ID, &session.StartTime, &session.EndTime, &session.Duration,
        &session.ProjectPath, &session.ProjectName, &session.IDEType,
        &session.Status, &session.PauseCount, &session.LastActivity,
    )

    if err == sql.ErrNoRows {
        return nil, nil // No active session
    }

    return &session, err
}

func (d *Database) UpdateSessionActivity(sessionID int, lastActivity time.Time) error {
    query := `UPDATE sessions SET last_activity = ? WHERE id = ?`
    _, err := d.db.Exec(query, lastActivity, sessionID)
    return err
}

func (d *Database) UpdateSessionDuration(sessionID int, duration int) error {
    query := `UPDATE sessions SET duration = ? WHERE id = ?`
    _, err := d.db.Exec(query, duration, sessionID)
    return err
}

func (d *Database) EndSession(sessionID int, endTime time.Time, finalDuration int) error {
    query := `UPDATE sessions SET end_time = ?, status = 'completed', duration = ? WHERE id = ?`
    _, err := d.db.Exec(query, endTime, finalDuration, sessionID)
    return err
}

func (d *Database) GetSessionsToday() ([]models.Session, error) {
    today := time.Now().Format("2006-01-02")
    query := `
        SELECT * FROM sessions
        WHERE DATE(start_time) = ?
        ORDER BY start_time DESC
    `

    rows, err := d.db.Query(query, today)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var sessions []models.Session
    for rows.Next() {
        var session models.Session
        err := rows.Scan(
            &session.ID, &session.StartTime, &session.EndTime, &session.Duration,
            &session.ProjectPath, &session.ProjectName, &session.IDEType,
            &session.Status, &session.PauseCount, &session.LastActivity,
        )
        if err != nil {
            return nil, err
        }
        sessions = append(sessions, session)
    }

    return sessions, nil
}

// Activity operations
func (d *Database) CreateActivity(activity *models.Activity) error {
    query := `
        INSERT INTO activities (session_id, timestamp, activity_type, file_path, line_number, ide_type)
        VALUES (?, ?, ?, ?, ?, ?)
    `
    _, err := d.db.Exec(query, activity.SessionID, activity.Timestamp, activity.ActivityType,
                       activity.FilePath, activity.LineNumber, activity.IDEType)
    return err
}

// Context operations
func (d *Database) SaveContext(context *models.Context) error {
    query := `
        INSERT INTO contexts (session_id, timestamp, file_path, line_number, function_name, notes)
        VALUES (?, ?, ?, ?, ?, ?)
    `
    _, err := d.db.Exec(query, context.SessionID, context.Timestamp, context.FilePath,
                       context.LineNumber, context.FunctionName, context.Notes)
    return err
}

func (d *Database) GetLatestContext(sessionID int) (*models.Context, error) {
    query := `SELECT * FROM contexts WHERE session_id = ? ORDER BY timestamp DESC LIMIT 1`

    var context models.Context
    err := d.db.QueryRow(query, sessionID).Scan(
        &context.ID, &context.SessionID, &context.Timestamp,
        &context.FilePath, &context.LineNumber, &context.FunctionName, &context.Notes,
    )

    if err == sql.ErrNoRows {
        return nil, nil
    }

    return &context, err
}
```

### **1.4 Session Management Service** (1.5 hours)

**File**: `internal/services/session_manager.go`
```go
package services

import (
    "fmt"
    "path/filepath"
    "strings"
    "time"

    "github.com/[username]/devfocus-backend/internal/models"
    "github.com/[username]/devfocus-backend/internal/storage"
)

type SessionManager struct {
    db *storage.Database
}

func NewSessionManager(db *storage.Database) *SessionManager {
    return &SessionManager{db: db}
}

func (sm *SessionManager) StartSession(projectPath, ideType string) (*models.Session, error) {
    // Check if there's already an active session
    activeSession, err := sm.db.GetActiveSession()
    if err != nil {
        return nil, fmt.Errorf("error checking active session: %w", err)
    }

    if activeSession != nil {
        // Update existing session if same project, otherwise end it
        if activeSession.ProjectPath == projectPath && activeSession.IDEType == ideType {
            return activeSession, nil
        }

        // End the current session and start new one
        if err := sm.EndSession(activeSession.ID); err != nil {
            return nil, fmt.Errorf("error ending previous session: %w", err)
        }
    }

    // Extract project name from path
    projectName := sm.extractProjectName(projectPath)

    session := &models.Session{
        StartTime:    time.Now(),
        ProjectPath:  projectPath,
        ProjectName:  projectName,
        IDEType:      ideType,
        Status:       "active",
        LastActivity: time.Now(),
    }

    if err := sm.db.CreateSession(session); err != nil {
        return nil, fmt.Errorf("error creating session: %w", err)
    }

    return session, nil
}

func (sm *SessionManager) UpdateActivity(sessionID int, activityType, filePath string, lineNumber int, ideType string) error {
    // Update session last activity
    if err := sm.db.UpdateSessionActivity(sessionID, time.Now()); err != nil {
        return fmt.Errorf("error updating session activity: %w", err)
    }

    // Create activity record
    activity := &models.Activity{
        SessionID:    sessionID,
        Timestamp:    time.Now(),
        ActivityType: activityType,
        FilePath:     filePath,
        LineNumber:   lineNumber,
        IDEType:      ideType,
    }

    if err := sm.db.CreateActivity(activity); err != nil {
        return fmt.Errorf("error creating activity: %w", err)
    }

    // Update session duration
    session, err := sm.GetCurrentSession()
    if err != nil {
        return err
    }

    if session != nil && session.ID == sessionID {
        duration := int(time.Since(session.StartTime).Seconds())
        if err := sm.db.UpdateSessionDuration(sessionID, duration); err != nil {
            return fmt.Errorf("error updating session duration: %w", err)
        }
    }

    return nil
}

func (sm *SessionManager) PauseSession(sessionID int) error {
    // For flow timer, "pause" means IDE lost focus
    // We just stop updating the session but don't end it
    return sm.UpdateActivity(sessionID, "focus_lost", "", 0, "system")
}

func (sm *SessionManager) ResumeSession(sessionID int, ideType string) error {
    return sm.UpdateActivity(sessionID, "focus_gained", "", 0, ideType)
}

func (sm *SessionManager) EndSession(sessionID int) error {
    session, err := sm.db.GetActiveSession()
    if err != nil {
        return err
    }

    if session == nil || session.ID != sessionID {
        return fmt.Errorf("no active session with ID %d", sessionID)
    }

    finalDuration := int(time.Since(session.StartTime).Seconds())
    return sm.db.EndSession(sessionID, time.Now(), finalDuration)
}

func (sm *SessionManager) GetCurrentSession() (*models.Session, error) {
    return sm.db.GetActiveSession()
}

func (sm *SessionManager) SaveContext(sessionID int, filePath string, lineNumber int, functionName, notes string) error {
    context := &models.Context{
        SessionID:    sessionID,
        Timestamp:    time.Now(),
        FilePath:     filePath,
        LineNumber:   lineNumber,
        FunctionName: functionName,
        Notes:        notes,
    }

    return sm.db.SaveContext(context)
}

func (sm *SessionManager) GetRestoreContext(sessionID int) (*models.Context, error) {
    return sm.db.GetLatestContext(sessionID)
}

func (sm *SessionManager) GetTodaySummary() (*models.SessionSummary, error) {
    sessions, err := sm.db.GetSessionsToday()
    if err != nil {
        return nil, err
    }

    if len(sessions) == 0 {
        return &models.SessionSummary{}, nil
    }

    totalDuration := 0
    longestSession := 0
    projectMap := make(map[string]bool)

    for _, session := range sessions {
        totalDuration += session.Duration
        if session.Duration > longestSession {
            longestSession = session.Duration
        }
        projectMap[session.ProjectName] = true
    }

    projects := make([]string, 0, len(projectMap))
    for project := range projectMap {
        projects = append(projects, project)
    }

    return &models.SessionSummary{
        TotalSessions:  len(sessions),
        TotalDuration:  totalDuration,
        AverageSession: totalDuration / len(sessions),
        ProjectsWorked: projects,
        LongestSession: longestSession,
    }, nil
}

func (sm *SessionManager) extractProjectName(projectPath string) string {
    // Extract project name from path
    // Example: /home/user/projects/my-app -> my-app
    parts := strings.Split(projectPath, string(filepath.Separator))
    if len(parts) > 0 {
        return parts[len(parts)-1]
    }
    return "unknown"
}

// ShouldSuggestBreak suggests break after 90 minutes of continuous work
func (sm *SessionManager) ShouldSuggestBreak(sessionID int) (bool, time.Duration, error) {
    session, err := sm.db.GetActiveSession()
    if err != nil {
        return false, 0, err
    }

    if session == nil || session.ID != sessionID {
        return false, 0, nil
    }

    duration := time.Since(session.StartTime)

    // Suggest break after 90 minutes
    if duration >= 90*time.Minute {
        return true, duration, nil
    }

    return false, duration, nil
}
```

### **1.5 HTTP API Layer** (2 hours)

**File**: `internal/api/handlers.go`
```go
package api

import (
    "log"
    "strconv"
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/[username]/devfocus-backend/internal/services"
)

type Handlers struct {
    sessionManager *services.SessionManager
}

func NewHandlers(sessionManager *services.SessionManager) *Handlers {
    return &Handlers{
        sessionManager: sessionManager,
    }
}

type StartSessionRequest struct {
    ProjectPath string `json:"project_path"`
    IDEType     string `json:"ide_type"`
}

type UpdateActivityRequest struct {
    ActivityType string `json:"activity_type"`
    FilePath     string `json:"file_path,omitempty"`
    LineNumber   int    `json:"line_number,omitempty"`
    IDEType      string `json:"ide_type"`
}

type SaveContextRequest struct {
    FilePath     string `json:"file_path"`
    LineNumber   int    `json:"line_number"`
    FunctionName string `json:"function_name,omitempty"`
    Notes        string `json:"notes,omitempty"`
}

// POST /api/v1/sessions/start
func (h *Handlers) StartSession(c *fiber.Ctx) error {
    var req StartSessionRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    if req.ProjectPath == "" || req.IDEType == "" {
        return c.Status(400).JSON(fiber.Map{"error": "project_path and ide_type are required"})
    }

    session, err := h.sessionManager.StartSession(req.ProjectPath, req.IDEType)
    if err != nil {
        log.Printf("Error starting session: %v", err)
        return c.Status(500).JSON(fiber.Map{"error": "Failed to start session"})
    }

    return c.JSON(session)
}

// PUT /api/v1/sessions/{id}/activity
func (h *Handlers) UpdateActivity(c *fiber.Ctx) error {
    sessionIDStr := c.Params("id")
    sessionID, err := strconv.Atoi(sessionIDStr)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid session ID"})
    }

    var req UpdateActivityRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    if req.ActivityType == "" || req.IDEType == "" {
        return c.Status(400).JSON(fiber.Map{"error": "activity_type and ide_type are required"})
    }

    err = h.sessionManager.UpdateActivity(sessionID, req.ActivityType, req.FilePath, req.LineNumber, req.IDEType)
    if err != nil {
        log.Printf("Error updating activity: %v", err)
        return c.Status(500).JSON(fiber.Map{"error": "Failed to update activity"})
    }

    return c.JSON(fiber.Map{"status": "success"})
}

// POST /api/v1/sessions/{id}/pause
func (h *Handlers) PauseSession(c *fiber.Ctx) error {
    sessionIDStr := c.Params("id")
    sessionID, err := strconv.Atoi(sessionIDStr)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid session ID"})
    }

    err = h.sessionManager.PauseSession(sessionID)
    if err != nil {
        log.Printf("Error pausing session: %v", err)
        return c.Status(500).JSON(fiber.Map{"error": "Failed to pause session"})
    }

    return c.JSON(fiber.Map{"status": "paused"})
}

// POST /api/v1/sessions/{id}/resume
func (h *Handlers) ResumeSession(c *fiber.Ctx) error {
    sessionIDStr := c.Params("id")
    sessionID, err := strconv.Atoi(sessionIDStr)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid session ID"})
    }

    var req struct {
        IDEType string `json:"ide_type"`
    }
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    err = h.sessionManager.ResumeSession(sessionID, req.IDEType)
    if err != nil {
        log.Printf("Error resuming session: %v", err)
        return c.Status(500).JSON(fiber.Map{"error": "Failed to resume session"})
    }

    return c.JSON(fiber.Map{"status": "resumed"})
}

// POST /api/v1/sessions/{id}/end
func (h *Handlers) EndSession(c *fiber.Ctx) error {
    sessionIDStr := c.Params("id")
    sessionID, err := strconv.Atoi(sessionIDStr)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid session ID"})
    }

    err = h.sessionManager.EndSession(sessionID)
    if err != nil {
        log.Printf("Error ending session: %v", err)
        return c.Status(500).JSON(fiber.Map{"error": "Failed to end session"})
    }

    return c.JSON(fiber.Map{"status": "ended"})
}

// GET /api/v1/sessions/current
func (h *Handlers) GetCurrentSession(c *fiber.Ctx) error {
    session, err := h.sessionManager.GetCurrentSession()
    if err != nil {
        log.Printf("Error getting current session: %v", err)
        return c.Status(500).JSON(fiber.Map{"error": "Failed to get current session"})
    }

    if session == nil {
        return c.JSON(fiber.Map{"session": nil})
    }

    // Calculate current duration
    if session.Status == "active" {
        session.Duration = int(time.Since(session.StartTime).Seconds())
    }

    // Check if should suggest break
    shouldBreak, duration, err := h.sessionManager.ShouldSuggestBreak(session.ID)
    if err != nil {
        log.Printf("Error checking break suggestion: %v", err)
    }

    response := fiber.Map{
        "session":          session,
        "suggest_break":    shouldBreak,
        "session_duration": int(duration.Seconds()),
    }

    return c.JSON(response)
}

// POST /api/v1/context/save
func (h *Handlers) SaveContext(c *fiber.Ctx) error {
    sessionIDStr := c.Query("session_id")
    sessionID, err := strconv.Atoi(sessionIDStr)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid session ID"})
    }

    var req SaveContextRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    if req.FilePath == "" {
        return c.Status(400).JSON(fiber.Map{"error": "file_path is required"})
    }

    err = h.sessionManager.SaveContext(sessionID, req.FilePath, req.LineNumber, req.FunctionName, req.Notes)
    if err != nil {
        log.Printf("Error saving context: %v", err)
        return c.Status(500).JSON(fiber.Map{"error": "Failed to save context"})
    }

    return c.JSON(fiber.Map{"status": "saved"})
}

// GET /api/v1/context/restore?session_id={id}
func (h *Handlers) RestoreContext(c *fiber.Ctx) error {
    sessionIDStr := c.Query("session_id")
    sessionID, err := strconv.Atoi(sessionIDStr)
    if err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid session ID"})
    }

    context, err := h.sessionManager.GetRestoreContext(sessionID)
    if err != nil {
        log.Printf("Error restoring context: %v", err)
        return c.Status(500).JSON(fiber.Map{"error": "Failed to restore context"})
    }

    return c.JSON(fiber.Map{"context": context})
}

// GET /api/v1/analytics/summary
func (h *Handlers) GetTodaySummary(c *fiber.Ctx) error {
    summary, err := h.sessionManager.GetTodaySummary()
    if err != nil {
        log.Printf("Error getting today's summary: %v", err)
        return c.Status(500).JSON(fiber.Map{"error": "Failed to get summary"})
    }

    return c.JSON(summary)
}

// Health check endpoint
func (h *Handlers) HealthCheck(c *fiber.Ctx) error {
    return c.JSON(fiber.Map{
        "status":    "healthy",
        "timestamp": time.Now(),
        "service":   "devfocus-backend",
    })
}
```

**File**: `internal/api/routes.go`
```go
package api

import (
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
)

func SetupRoutes(app *fiber.App, handlers *Handlers) {
    // Middleware
    app.Use(logger.New())
    app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:3000,http://localhost:8080",
        AllowHeaders: "Origin, Content-Type, Accept",
        AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
    }))

    // Health check
    app.Get("/health", handlers.HealthCheck)

    // API routes
    api := app.Group("/api/v1")

    // Session management
    sessions := api.Group("/sessions")
    sessions.Post("/start", handlers.StartSession)
    sessions.Put("/:id/activity", handlers.UpdateActivity)
    sessions.Post("/:id/pause", handlers.PauseSession)
    sessions.Post("/:id/resume", handlers.ResumeSession)
    sessions.Post("/:id/end", handlers.EndSession)
    sessions.Get("/current", handlers.GetCurrentSession)

    // Context management
    context := api.Group("/context")
    context.Post("/save", handlers.SaveContext)
    context.Get("/restore", handlers.RestoreContext)

    // Analytics
    analytics := api.Group("/analytics")
    analytics.Get("/summary", handlers.GetTodaySummary)
}
```

**File**: `cmd/devfocus/main.go`
```go
package main

import (
    "log"
    "os"
    "path/filepath"

    "github.com/gofiber/fiber/v2"
    "github.com/[username]/devfocus-backend/internal/api"
    "github.com/[username]/devfocus-backend/internal/services"
    "github.com/[username]/devfocus-backend/internal/storage"
)

func main() {
    // Create data directory if it doesn't exist
    homeDir, err := os.UserHomeDir()
    if err != nil {
        log.Fatal("Failed to get user home directory:", err)
    }

    dataDir := filepath.Join(homeDir, ".devfocus")
    if err := os.MkdirAll(dataDir, 0755); err != nil {
        log.Fatal("Failed to create data directory:", err)
    }

    // Initialize database
    dbPath := filepath.Join(dataDir, "devfocus.db")
    db, err := storage.NewDatabase(dbPath)
    if err != nil {
        log.Fatal("Failed to initialize database:", err)
    }

    // Initialize services
    sessionManager := services.NewSessionManager(db)

    // Initialize handlers
    handlers := api.NewHandlers(sessionManager)

    // Create Fiber app
    app := fiber.New(fiber.Config{
        ErrorHandler: func(c *fiber.Ctx, err error) error {
            code := fiber.StatusInternalServerError
            if e, ok := err.(*fiber.Error); ok {
                code = e.Code
            }

            return c.Status(code).JSON(fiber.Map{
                "error": err.Error(),
            })
        },
    })

    // Setup routes
    api.SetupRoutes(app, handlers)

    // Start server
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("DevFocus backend starting on port %s", port)
    log.Printf("Database location: %s", dbPath)
    log.Printf("Health check: http://localhost:%s/health", port)

    if err := app.Listen(":" + port); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}
```

---

## Component 2: VS Code Extension (4-5 hours)

### **2.1 Extension Setup & Configuration** (1 hour)

**Initialize VS Code extension**:
```bash
mkdir devfocus-vscode
cd devfocus-vscode
npm init -y
npm install @types/vscode typescript
```

**File**: `package.json`
```json
{
    "name": "devfocus",
    "displayName": "DevFocus Flow Timer",
    "description": "Flow-based timer for developers with automatic session tracking",
    "version": "0.1.0",
    "engines": {
        "vscode": "^1.74.0"
    },
    "categories": ["Other"],
    "activationEvents": [
        "onStartupFinished"
    ],
    "main": "./out/extension.js",
    "contributes": {
        "commands": [
            {
                "command": "devfocus.startSession",
                "title": "Start Focus Session"
            },
            {
                "command": "devfocus.endSession",
                "title": "End Focus Session"
            },
            {
                "command": "devfocus.showSummary",
                "title": "Show Today's Summary"
            }
        ],
        "configuration": {
            "title": "DevFocus",
            "properties": {
                "devfocus.backend.url": {
                    "type": "string",
                    "default": "http://localhost:8080",
                    "description": "DevFocus backend URL"
                },
                "devfocus.autoStart": {
                    "type": "boolean",
                    "default": true,
                    "description": "Automatically start session when VS Code opens"
                },
                "devfocus.breakReminder": {
                    "type": "boolean",
                    "default": true,
                    "description": "Show break reminders after 90 minutes"
                }
            }
        }
    },
    "scripts": {
        "vscode:prepublish": "npm run compile",
        "compile": "tsc -p ./",
        "watch": "tsc -watch -p ./"
    },
    "devDependencies": {
        "@types/node": "16.x",
        "@types/vscode": "^1.74.0",
        "typescript": "^4.9.4"
    }
}
```

### **2.2 Core Extension Logic** (2 hours)

**File**: `src/extension.ts`
```typescript
import * as vscode from 'vscode';
import { SessionTracker } from './sessionTracker';
import { StatusBarManager } from './statusBar';
import { ApiClient } from './apiClient';

let sessionTracker: SessionTracker;
let statusBarManager: StatusBarManager;

export function activate(context: vscode.ExtensionContext) {
    console.log('DevFocus extension activated');

    // Initialize components
    const apiClient = new ApiClient();
    statusBarManager = new StatusBarManager();
    sessionTracker = new SessionTracker(apiClient, statusBarManager);

    // Register commands
    const startCommand = vscode.commands.registerCommand('devfocus.startSession', () => {
        sessionTracker.startSession();
    });

    const endCommand = vscode.commands.registerCommand('devfocus.endSession', () => {
        sessionTracker.endSession();
    });

    const summaryCommand = vscode.commands.registerCommand('devfocus.showSummary', () => {
        sessionTracker.showTodaySummary();
    });

    // Add to subscriptions
    context.subscriptions.push(startCommand, endCommand, summaryCommand);
    context.subscriptions.push(statusBarManager.getStatusBarItem());

    // Auto-start session if enabled
    const config = vscode.workspace.getConfiguration('devfocus');
    if (config.get('autoStart', true)) {
        setTimeout(() => sessionTracker.startSession(), 1000);
    }

    // Setup event listeners
    setupEventListeners(context);
}

function setupEventListeners(context: vscode.ExtensionContext) {
    // Track document changes
    const docChangeListener = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.uri.scheme === 'file') {
            sessionTracker.onDocumentChange(event.document);
        }
    });

    // Track active editor changes
    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && editor.document.uri.scheme === 'file') {
            sessionTracker.onEditorChange(editor);
        }
    });

    // Track window focus
    const focusListener = vscode.window.onDidChangeWindowState((state) => {
        if (state.focused) {
            sessionTracker.onWindowFocus();
        } else {
            sessionTracker.onWindowBlur();
        }
    });

    context.subscriptions.push(docChangeListener, editorChangeListener, focusListener);
}

export function deactivate() {
    if (sessionTracker) {
        sessionTracker.dispose();
    }
    if (statusBarManager) {
        statusBarManager.dispose();
    }
}
```

**File**: `src/apiClient.ts`
```typescript
import * as vscode from 'vscode';

export interface Session {
    id: number;
    start_time: string;
    duration: number;
    project_path: string;
    project_name: string;
    ide_type: string;
    status: string;
}

export interface SessionSummary {
    total_sessions: number;
    total_duration: number;
    average_session: number;
    projects_worked: string[];
    longest_session: number;
}

export class ApiClient {
    private baseUrl: string;

    constructor() {
        const config = vscode.workspace.getConfiguration('devfocus');
        this.baseUrl = config.get('backend.url', 'http://localhost:8080');
    }

    async startSession(projectPath: string, ideType: string = 'vscode'): Promise<Session | null> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/sessions/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    project_path: projectPath,
                    ide_type: ideType,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to start session:', error);
            vscode.window.showErrorMessage(`Failed to start DevFocus session: ${error}`);
            return null;
        }
    }

    async updateActivity(sessionId: number, activityType: string, filePath?: string, lineNumber?: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/sessions/${sessionId}/activity`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    activity_type: activityType,
                    file_path: filePath,
                    line_number: lineNumber,
                    ide_type: 'vscode',
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to update activity:', error);
            return false;
        }
    }

    async pauseSession(sessionId: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/sessions/${sessionId}/pause`, {
                method: 'POST',
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to pause session:', error);
            return false;
        }
    }

    async resumeSession(sessionId: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/sessions/${sessionId}/resume`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ide_type: 'vscode',
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to resume session:', error);
            return false;
        }
    }

    async endSession(sessionId: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/sessions/${sessionId}/end`, {
                method: 'POST',
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to end session:', error);
            return false;
        }
    }

    async getCurrentSession(): Promise<{session: Session | null, suggest_break: boolean, session_duration: number} | null> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/sessions/current`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get current session:', error);
            return null;
        }
    }

    async getTodaySummary(): Promise<SessionSummary | null> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/analytics/summary`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get today summary:', error);
            return null;
        }
    }

    async saveContext(sessionId: number, filePath: string, lineNumber: number, functionName?: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/api/v1/context/save?session_id=${sessionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file_path: filePath,
                    line_number: lineNumber,
                    function_name: functionName,
                }),
            });

            return response.ok;
        } catch (error) {
            console.error('Failed to save context:', error);
            return false;
        }
    }
}
```

**File**: `src/sessionTracker.ts`
```typescript
import * as vscode from 'vscode';
import * as path from 'path';
import { ApiClient, Session } from './apiClient';
import { StatusBarManager } from './statusBar';

export class SessionTracker {
    private currentSession: Session | null = null;
    private apiClient: ApiClient;
    private statusBarManager: StatusBarManager;
    private activityTimer: NodeJS.Timer | null = null;
    private statusUpdateTimer: NodeJS.Timer | null = null;
    private lastActivityTime: number = Date.now();

    constructor(apiClient: ApiClient, statusBarManager: StatusBarManager) {
        this.apiClient = apiClient;
        this.statusBarManager = statusBarManager;
    }

    async startSession(): Promise<void> {
        const workspaceFolder = this.getWorkspaceFolder();
        if (!workspaceFolder) {
            vscode.window.showWarningMessage('DevFocus: No workspace folder detected. Please open a project folder.');
            return;
        }

        const projectPath = workspaceFolder.uri.fsPath;
        console.log(`Starting DevFocus session for project: ${projectPath}`);

        const session = await this.apiClient.startSession(projectPath);
        if (session) {
            this.currentSession = session;
            this.startTracking();
            vscode.window.showInformationMessage(`DevFocus session started for ${session.project_name}`);
        }
    }

    async endSession(): Promise<void> {
        if (!this.currentSession) {
            vscode.window.showWarningMessage('No active DevFocus session to end');
            return;
        }

        const success = await this.apiClient.endSession(this.currentSession.id);
        if (success) {
            this.stopTracking();
            const duration = this.formatDuration(this.currentSession.duration);
            vscode.window.showInformationMessage(`DevFocus session ended. Duration: ${duration}`);
            this.currentSession = null;
        }
    }

    async onDocumentChange(document: vscode.TextDocument): Promise<void> {
        if (!this.currentSession) return;

        this.lastActivityTime = Date.now();

        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === document) {
            const filePath = this.getRelativeFilePath(document.uri.fsPath);
            const lineNumber = editor.selection.active.line + 1;

            await this.apiClient.updateActivity(
                this.currentSession.id,
                'typing',
                filePath,
                lineNumber
            );
        }
    }

    async onEditorChange(editor: vscode.TextEditor): Promise<void> {
        if (!this.currentSession) return;

        this.lastActivityTime = Date.now();

        const filePath = this.getRelativeFilePath(editor.document.uri.fsPath);
        const lineNumber = editor.selection.active.line + 1;

        await this.apiClient.updateActivity(
            this.currentSession.id,
            'file_change',
            filePath,
            lineNumber
        );
    }

    async onWindowFocus(): Promise<void> {
        if (!this.currentSession) return;

        this.lastActivityTime = Date.now();
        await this.apiClient.resumeSession(this.currentSession.id);
    }

    async onWindowBlur(): Promise<void> {
        if (!this.currentSession) return;

        // Save context before losing focus
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const filePath = this.getRelativeFilePath(editor.document.uri.fsPath);
            const lineNumber = editor.selection.active.line + 1;
            const functionName = this.getCurrentFunctionName(editor);

            await this.apiClient.saveContext(
                this.currentSession.id,
                filePath,
                lineNumber,
                functionName
            );
        }

        await this.apiClient.pauseSession(this.currentSession.id);
    }

    async showTodaySummary(): Promise<void> {
        const summary = await this.apiClient.getTodaySummary();
        if (summary) {
            const totalTime = this.formatDuration(summary.total_duration);
            const avgTime = this.formatDuration(summary.average_session);
            const longestTime = this.formatDuration(summary.longest_session);

            const message = `Today's Summary:\n` +
                          `Sessions: ${summary.total_sessions}\n` +
                          `Total Time: ${totalTime}\n` +
                          `Average Session: ${avgTime}\n` +
                          `Longest Session: ${longestTime}\n` +
                          `Projects: ${summary.projects_worked.join(', ')}`;

            vscode.window.showInformationMessage(message);
        }
    }

    private startTracking(): void {
        // Update status bar every second
        this.statusUpdateTimer = setInterval(async () => {
            const sessionData = await this.apiClient.getCurrentSession();
            if (sessionData && sessionData.session) {
                this.statusBarManager.updateSession(sessionData.session, sessionData.session_duration);

                // Check for break suggestion
                if (sessionData.suggest_break) {
                    const config = vscode.workspace.getConfiguration('devfocus');
                    if (config.get('breakReminder', true)) {
                        this.showBreakSuggestion(sessionData.session_duration);
                    }
                }
            }
        }, 1000);

        // Send periodic activity updates (every 30 seconds if active)
        this.activityTimer = setInterval(async () => {
            if (this.currentSession && Date.now() - this.lastActivityTime < 60000) {
                await this.apiClient.updateActivity(this.currentSession.id, 'heartbeat');
            }
        }, 30000);
    }

    private stopTracking(): void {
        if (this.statusUpdateTimer) {
            clearInterval(this.statusUpdateTimer);
            this.statusUpdateTimer = null;
        }

        if (this.activityTimer) {
            clearInterval(this.activityTimer);
            this.activityTimer = null;
        }

        this.statusBarManager.clear();
    }

    private showBreakSuggestion(duration: number): void {
        const durationStr = this.formatDuration(duration);
        vscode.window.showInformationMessage(
            `You've been coding for ${durationStr}. Consider taking a break!`,
            'Take Break', 'Continue Coding'
        ).then(selection => {
            if (selection === 'Take Break') {
                this.endSession();
            }
        });
    }

    private getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            return vscode.workspace.workspaceFolders[0];
        }
        return undefined;
    }

    private getRelativeFilePath(fullPath: string): string {
        const workspaceFolder = this.getWorkspaceFolder();
        if (workspaceFolder) {
            return path.relative(workspaceFolder.uri.fsPath, fullPath);
        }
        return path.basename(fullPath);
    }

    private getCurrentFunctionName(editor: vscode.TextEditor): string {
        // Simple function name detection - can be improved later
        const document = editor.document;
        const line = editor.selection.active.line;

        // Look backwards for function declarations
        for (let i = line; i >= Math.max(0, line - 20); i--) {
            const lineText = document.lineAt(i).text;
            const functionMatch = lineText.match(/(?:function|const|let|var)\s+(\w+)|(\w+)\s*\(/);
            if (functionMatch) {
                return functionMatch[1] || functionMatch[2] || '';
            }
        }

        return '';
    }

    private formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    dispose(): void {
        this.stopTracking();
    }
}
```

**File**: `src/statusBar.ts`
```typescript
import * as vscode from 'vscode';
import { Session } from './apiClient';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Left,
            100
        );
        this.statusBarItem.command = 'devfocus.showSummary';
        this.statusBarItem.show();
        this.clear();
    }

    updateSession(session: Session, currentDuration: number): void {
        const duration = this.formatDuration(currentDuration);
        const projectName = session.project_name;

        this.statusBarItem.text = `⏱️ ${duration} | ${projectName}`;
        this.statusBarItem.tooltip = `DevFocus Session\nProject: ${projectName}\nDuration: ${duration}\nClick for today's summary`;
    }

    clear(): void {
        this.statusBarItem.text = '⏱️ DevFocus';
        this.statusBarItem.tooltip = 'DevFocus - Click to start session';
    }

    private formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    }

    getStatusBarItem(): vscode.StatusBarItem {
        return this.statusBarItem;
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}
```

### **2.3 TypeScript Configuration** (30 minutes)

**File**: `tsconfig.json`
```json
{
    "compilerOptions": {
        "module": "commonjs",
        "target": "ES2020",
        "outDir": "out",
        "lib": ["ES2020"],
        "sourceMap": true,
        "rootDir": "src",
        "strict": true
    }
}
```

**File**: `.vscodeignore`
```
.vscode/**
.vscode-test/**
src/**
.gitignore
.yarnrc
vsc-extension-quickstart.md
**/tsconfig.json
**/.eslintrc.json
**/*.map
**/*.ts
```

---

## Component 3: Web Dashboard Evolution (2-3 hours)

### **3.1 Transform Current React App** (1.5 hours)

**Modify existing files to evolve from Pomodoro to Flow timer analytics**

**File**: Update `devfocus/src/hooks/useCountdownTimer.tsx` → `useSessionData.tsx`
```typescript
import { useState, useEffect } from 'react';

interface Session {
  id: number;
  start_time: string;
  duration: number;
  project_path: string;
  project_name: string;
  ide_type: string;
  status: string;
}

interface SessionData {
  session: Session | null;
  suggest_break: boolean;
  session_duration: number;
}

interface SessionSummary {
  total_sessions: number;
  total_duration: number;
  average_session: number;
  projects_worked: string[];
  longest_session: number;
}

const API_BASE = 'http://localhost:8080/api/v1';

export function useSessionData() {
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [todaySummary, setTodaySummary] = useState<SessionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/sessions/current`);
      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data);
      } else {
        setCurrentSession(null);
      }
    } catch (err) {
      console.error('Failed to fetch current session:', err);
      setError('Failed to connect to DevFocus backend');
    }
  };

  const fetchTodaySummary = async () => {
    try {
      const response = await fetch(`${API_BASE}/analytics/summary`);
      if (response.ok) {
        const data = await response.json();
        setTodaySummary(data);
      }
    } catch (err) {
      console.error('Failed to fetch today summary:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCurrentSession(), fetchTodaySummary()]);
      setIsLoading(false);
    };

    loadData();

    // Refresh data every 5 seconds
    const interval = setInterval(() => {
      fetchCurrentSession();
      fetchTodaySummary();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return {
    currentSession,
    todaySummary,
    isLoading,
    error,
    formatDuration,
    refreshData: () => {
      fetchCurrentSession();
      fetchTodaySummary();
    }
  };
}
```

**File**: Create new `devfocus/src/components/SessionDashboard.tsx`
```typescript
import React from 'react';
import { useSessionData } from '../hooks/useSessionData';

const SessionDashboard: React.FC = () => {
  const { currentSession, todaySummary, isLoading, error, formatDuration } = useSessionData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading DevFocus data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <div className="text-sm text-gray-600">
          Make sure the DevFocus backend is running on localhost:8080
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">DevFocus Dashboard</h1>

      {/* Current Session */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Session</h2>
        {currentSession?.session ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {formatDuration(currentSession.session_duration)}
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {currentSession.session.project_name}
              </div>
              <div className="text-sm text-gray-600">Project</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold capitalize">
                {currentSession.session.ide_type}
              </div>
              <div className="text-sm text-gray-600">IDE</div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            No active session. Start coding in VS Code to begin tracking!
          </div>
        )}

        {currentSession?.suggest_break && (
          <div className="mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
            <strong>Break Suggestion:</strong> You've been coding for a while. Consider taking a break!
          </div>
        )}
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Summary</h2>
        {todaySummary ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {todaySummary.total_sessions}
              </div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatDuration(todaySummary.total_duration)}
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatDuration(todaySummary.average_session)}
              </div>
              <div className="text-sm text-gray-600">Avg Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatDuration(todaySummary.longest_session)}
              </div>
              <div className="text-sm text-gray-600">Longest</div>
            </div>
          </div>

          {todaySummary.projects_worked.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Projects Worked On:</h3>
              <div className="flex flex-wrap gap-2">
                {todaySummary.projects_worked.map((project, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {project}
                  </span>
                ))}
              </div>
            </div>
          )}
        ) : (
          <div className="text-center text-gray-500">
            No sessions today. Start coding to see your progress!
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>1. Install the DevFocus VS Code extension</li>
          <li>2. Open a project folder in VS Code</li>
          <li>3. Your coding sessions will be automatically tracked</li>
          <li>4. View real-time data here in the dashboard</li>
        </ul>
      </div>
    </div>
  );
};

export default SessionDashboard;
```

**File**: Update `devfocus/src/app/page.tsx`
```typescript
import SessionDashboard from '@/components/SessionDashboard';

export default function Home() {
  return <SessionDashboard />;
}
```

### **3.2 Remove Old Pomodoro Components** (30 minutes)

Remove or refactor the old timer components:
- Keep `TimerDisplay.tsx` but modify for session duration display
- Remove `PlayPauseButton.tsx` and `ResetButton.tsx` (not needed for automatic timer)
- Remove `TimerModeSwitch.tsx` (no focus/break modes in flow timer)
- Keep test files for reference but update them later

### **3.3 Update Styling and Layout** (1 hour)

Update the overall styling to reflect the new dashboard nature rather than a timer interface.

---

## Testing Strategy & Validation

### **Manual Testing Checklist**

**Backend Testing**:
- [ ] `go run cmd/devfocus/main.go` starts server on :8080
- [ ] Health check: `curl http://localhost:8080/health`
- [ ] Database file created in `~/.devfocus/devfocus.db`
- [ ] Sessions API endpoints respond correctly

**VS Code Extension Testing**:
- [ ] Extension loads without errors
- [ ] Status bar shows "DevFocus" when inactive
- [ ] Auto-starts session when opening a project
- [ ] Status bar updates with project name and duration
- [ ] Commands work: Start Session, End Session, Show Summary

**Integration Testing**:
- [ ] VS Code extension connects to Go backend
- [ ] Sessions are created and tracked in database
- [ ] Activity updates are recorded
- [ ] Dashboard shows real-time session data

**End-to-End Flow**:
1. Start Go backend
2. Open VS Code with project
3. Verify session starts automatically
4. Code for a few minutes and verify activity tracking
5. Open web dashboard and verify data appears
6. Switch files and verify context tracking
7. End session and verify summary

### **Success Criteria for Phase 1**

**Primary Goals Met**:
- [ ] **Automatic time tracking**: Sessions start without manual intervention
- [ ] **Flow preservation**: No forced breaks or countdown pressure
- [ ] **Multi-source data**: IDE activity tracked and stored
- [ ] **Real-time feedback**: Status bar shows current session info
- [ ] **Analytics foundation**: Dashboard displays session insights

**Technical Milestones**:
- [ ] Go backend handles 100+ API requests without issues
- [ ] VS Code extension runs for 8-hour coding day without crashes
- [ ] SQLite database stores and retrieves session data correctly
- [ ] Web dashboard updates within 5 seconds of backend changes

**User Experience Validation**:
- [ ] "I can see exactly how much time I spent coding today"
- [ ] "The timer doesn't interrupt my flow sessions"
- [ ] "I get useful insights about my development patterns"
- [ ] "Setup was straightforward and doesn't require constant management"

---

## Development Setup & Deployment

### **Development Environment**

**Terminal 1: Backend**
```bash
cd devfocus-backend
go run cmd/devfocus/main.go
```

**Terminal 2: VS Code Extension**
```bash
cd devfocus-vscode
npm run compile
# Then open in VS Code and press F5 to debug
```

**Terminal 3: Web Dashboard**
```bash
cd devfocus/devfocus
npm run dev
```

### **Build & Package**

**Backend Binary**:
```bash
cd devfocus-backend
go build -o devfocus cmd/devfocus/main.go
```

**VS Code Extension**:
```bash
cd devfocus-vscode
npm install -g vsce
vsce package
```

### **Installation for Personal Use**

1. **Backend**: Copy `devfocus` binary to `/usr/local/bin`
2. **VS Code**: Install `.vsix` file via Extensions > Install from VSIX
3. **Dashboard**: Access via `http://localhost:8080/dashboard` when backend running

---

## Phase 1 Completion

**Estimated Timeline**: 10-15 hours over 1-2 weeks
**Success Metric**: You can develop using VS Code for a full day and get accurate, insightful data about your coding sessions without any manual timer management

**Next Steps to Phase 2**: Add nvim plugin, terminal tracking, and context preservation features

This Phase 1 implementation creates a solid foundation for flow-based developer time tracking that can be expanded with additional IDEs, analytics, and AI insights in subsequent phases.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Create detailed Phase 1 implementation plan", "status": "completed", "activeForm": "Creating detailed Phase 1 implementation plan"}, {"content": "Define Go backend architecture and API endpoints", "status": "completed", "activeForm": "Defining Go backend architecture and API endpoints"}, {"content": "Specify VS Code extension requirements and implementation", "status": "completed", "activeForm": "Specifying VS Code extension requirements and implementation"}, {"content": "Detail web dashboard modifications from current React app", "status": "completed", "activeForm": "Detailing web dashboard modifications from current React app"}, {"content": "Create testing strategy and success criteria", "status": "completed", "activeForm": "Creating testing strategy and success criteria"}]