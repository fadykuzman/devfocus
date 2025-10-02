# DevFocus Pivot Plan: From Pomodoro to Flow-Based Developer Timer

## Current State Analysis

**What's Built**: Traditional countdown Pomodoro timer (40min focus, 10sec break) with React/Next.js
**What's Needed**: Flow-based count-up timer with automatic tracking and IDE integration

## Phase 1: Core Pivot (Week 1-2)
*Priority: Critical - Make it actually useful for your workflow*

### 1.1 Transform Timer from Countdown to Count-Up
- **Modify `useCountdownTimer.tsx`** → `useFlowtimeTimer.tsx`
- **Count UP from 0** instead of counting down from fixed time
- **Remove forced breaks** - only suggest breaks after 90+ minutes
- **Add session duration tracking** for later analysis

### 1.2 Fix Break Logic
- **Remove 10-second break mode** (clearly a placeholder)
- **Add natural break suggestions** when session hits 90+ minutes
- **Make break timing optional** - you control when to stop

### 1.3 Add Basic Time Tracking
- **Local storage** for session history
- **Session start/end timestamps**
- **Simple daily/weekly summaries**

## Phase 2: Essential Features (Week 3-4)
*Priority: High - Address your core pain points*

### 2.1 Desktop Application Foundation
- **Electron wrapper** for proper desktop integration
- **System tray** for unobtrusive access
- **Always-on-top option** for timer visibility

### 2.2 Basic IDE Integration (Start with VS Code)
- **VS Code extension** that communicates with main app
- **Auto-start timer** when VS Code becomes active
- **Auto-pause timer** when VS Code loses focus
- **Project detection** from open VS Code workspace

### 2.3 Context Preservation MVP
- **Capture current file/line** when timer pauses
- **Simple restoration prompt** when resuming
- **Basic session notes** for complex problem tracking

## Phase 3: Multi-IDE Support (Week 5-6)
*Priority: High - Your specific multi-IDE workflow*

### 3.1 IntelliJ Plugin
- **Basic time tracking** for Java development
- **Project context detection**
- **Integration with main desktop app**

### 3.2 Neovim Integration
- **Lightweight plugin** for nvim
- **File/project tracking**
- **Session state preservation**

### 3.3 Unified Dashboard
- **Cross-IDE session aggregation**
- **Project-based time allocation**
- **Daily flow session summaries**

## Phase 4: AI Insights Foundation (Week 7-8)
*Priority: Medium - Start building data for AI*

### 4.1 Data Collection Infrastructure
- **Detailed session metadata** (duration, interruptions, projects)
- **Productivity pattern tracking** (best times, stuck points)
- **Local ML model preparation** (privacy-first approach)

### 4.2 Basic Pattern Recognition
- **Optimal work time identification**
- **Interruption pattern analysis**
- **Break timing recommendations**

## Phase 5: Advanced Features (Month 3+)
*Priority: Lower - Once core workflow is solid*

### 5.1 AI-Powered Insights
- **Repetitive task detection**
- **Automation suggestions**
- **Workflow optimization**

### 5.2 Self-Hosted Sync
- **Multi-device synchronization**
- **Privacy-preserving architecture**
- **Backup/restore functionality**

---

## Immediate Next Steps (This Week)

### Step 1: Pivot the Timer Logic
**File**: `devfocus/src/hooks/useCountdownTimer.tsx`
- Rename to `useFlowtimeTimer.tsx`
- Change from countdown to count-up
- Remove fixed break durations
- Add natural break suggestions

### Step 2: Update UI Components
**Files**: `Timer.tsx`, `TimerDisplay.tsx`
- Show elapsed time instead of remaining time
- Update break logic to be suggestion-based
- Add session tracking display

### Step 3: Add Local Storage
**New file**: `src/hooks/useSessionTracking.tsx`
- Track session start/end times
- Store session metadata locally
- Basic analytics for your patterns

### Step 4: Plan Desktop App
- Research Electron + Next.js integration
- Plan VS Code extension architecture
- Design cross-IDE communication protocol

---

## Success Metrics for Pivot

### Week 1-2: Core Timer Works
- ✅ Can start count-up session without time limit
- ✅ Suggests break after 90 minutes (doesn't force)
- ✅ Tracks session duration locally

### Week 3-4: Desktop + Basic IDE
- ✅ Desktop app runs alongside VS Code
- ✅ Auto-starts when coding begins
- ✅ Captures basic context on interruption

### Month 2: Multi-IDE Workflow
- ✅ Works across nvim, IntelliJ, VS Code
- ✅ Aggregates time across all development tools
- ✅ Faster context recovery after interruptions

### Month 3+: AI-Powered Optimization
- ✅ Identifies your productivity patterns
- ✅ Suggests workflow improvements
- ✅ Reduces repetitive research time

---

## Technology Stack Adjustments

### Current: Web-Only React App
```
Next.js → Web UI only
React hooks → Timer logic
Local storage → Basic persistence
```

### Target: Desktop + Multi-IDE System
```
Next.js → Web dashboard
Electron → Desktop app wrapper
IDE plugins → nvim, IntelliJ, VS Code
Local SQLite → Session database
REST API → IDE communication
Local ML → Pattern analysis (later)
```

---

## Risk Mitigation

### Risk: Over-engineering too early
**Mitigation**: Start with minimal viable flow timer, add complexity gradually

### Risk: IDE integration complexity
**Mitigation**: Begin with VS Code (easiest), add others after core works

### Risk: Privacy concerns with tracking
**Mitigation**: Local-first architecture from day 1, no cloud dependencies

### Risk: Abandoning current codebase
**Mitigation**: Reuse React components, timer state management, test infrastructure

---

## Decision Points

### Week 2: Desktop App Framework
- **Option A**: Electron (web tech you know)
- **Option B**: Tauri (Rust-based, smaller)
- **Recommendation**: Electron for faster development

### Week 4: IDE Integration Approach
- **Option A**: LSP-based universal plugin
- **Option B**: Native plugins per IDE
- **Recommendation**: Native plugins for better integration

### Month 2: AI/ML Framework
- **Option A**: Cloud ML APIs (OpenAI, etc.)
- **Option B**: Local models (privacy-first)
- **Recommendation**: Local models aligned with your privacy needs

The key insight: **Your current codebase is a solid foundation, but implementing the wrong timer paradigm for your workflow**. The pivot focuses on changing the core timer logic while leveraging your existing React architecture.