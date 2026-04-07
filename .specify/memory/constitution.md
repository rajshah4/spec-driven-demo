# Project Constitution

This document defines non-negotiable principles for this project. All AI agents and human contributors must follow these guidelines.

## Code Quality

- All new code must include appropriate tests
- Follow existing patterns and conventions in the codebase
- No debug statements (console.log, print, etc.) in production code
- Code must be self-documenting with clear naming

## Architecture

- Keep components/modules small and focused on a single responsibility
- Prefer composition over inheritance
- Avoid premature optimization
- Document architectural decisions in spec files

## Security

- Never commit secrets, API keys, or credentials
- Validate all user inputs
- Follow the principle of least privilege

## Process

- All changes must go through the OpenSpec workflow for non-trivial features
- Atomic commits with clear messages
- Link all PRs to their originating issues
