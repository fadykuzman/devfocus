# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevFocus is a focus timer application designed specifically for developers to enhance productivity during software development tasks. The application features:

- 40-minute default focus timer with 10-minute break timer
- Start, pause, and reset functionality
- Customizable focus and break durations
- Clean, non-intrusive interface that remains visible but doesn't obstruct workflow
- Timer dominates screen when active, minimizes to small icon when inactive

## Project Status

This is an early-stage project with only documentation files present. No source code has been implemented yet.

## Development Guidelines

From Contribution.md:
- Test code thoroughly before submitting pull requests
- Write clear and concise commit messages
- Follow existing coding style and conventions
- Include relevant documentation and comments
- Be respectful in all communications
- Review and respond to feedback promptly

## Specialized Agents Available

This repository has extensive Claude agent configurations in `.claude/agents/` for:
- Frontend development (React/Vue/Angular)
- Backend architecture
- UI/UX design and optimization
- Mobile development and UX optimization
- Code review and debugging
- Deployment engineering
- API integration
- Data privacy and compliance
- Legal advisory

## Development Approach

**IMPORTANT**: This project follows a guided development approach where:
- The developer implements all code themselves
- Claude provides guidance, suggestions, and direction for tests and implementation
- Claude should NEVER write actual test code or implementation code
- Claude's role is to guide, advise, and provide architectural direction only

## Architecture Considerations

When implementing this focus timer application, consider:
- Simple, intuitive interface design
- Cross-platform compatibility (web, desktop, mobile)
- Local storage for user preferences
- Minimal system resources usage
- Accessibility features for all users
- Timer accuracy and reliability

## Design Decisions

### Timer Mode Switching (Issue #10)

**Decision**: Toggle Switch Approach for focus/break timer mode switching

**Rationale**:
- **Direct Interaction**: Simple toggle switch provides clear, immediate mode switching without hidden interactions
- **Visual Clarity**: Always visible switch clearly shows current mode and switching capability
- **Intentional Switching**: Toggle requires deliberate action but is more discoverable than hidden options
- **Future-Proof**: Toggle pattern easily accommodates additional timer types with multi-state switches

**Implementation Details**:
- Toggle switch prominently displayed at top of timer interface
- Clean black/white monochrome design with typography differentiation
- Focus mode: Left side of toggle with "FOCUS • 40min" label
- Break mode: Right side of toggle with "BREAK • 10min" label
- Switch disabled when timer is active to prevent accidental mode changes
- Confirmation modal when switching during active timer
- Keyboard shortcuts deferred until after core functionality is complete

**Alternative Approaches Considered**:
1. **Minimalist Toggle**: Simple toggle switch - rejected due to potential accidental activation
2. **Structured Tab Approach**: Tab-based interface - rejected as too application-like and space-consuming