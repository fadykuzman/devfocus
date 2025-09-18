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