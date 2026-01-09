# Claude Code Instructions

## Commands
```bash
make setup      # First-time setup (creates venv, installs deps)
make run        # Run the application
make test       # Run tests
make lint       # Format + lint check
make all        # lint + test + build
```

## Architecture
Three-layer clean architecture: `Domain → Application → Infrastructure`
- Domain: Zero external dependencies (pure business logic)
- Application: Orchestrates domain (use cases)
- Infrastructure: External connections (API, DB, LLM)

## Project Layout
```
src/{project}/domain|application|infrastructure/
tests/           # Mirrors src/ structure
docs/            # See docs structure below
```

## Documentation Structure
```
docs/
├── architecture/architecture.md   # Diagrams, system design
├── claude-code/                   # hooks, mcp-servers, skills, subagents
├── guides/setup.md                # Setup guide
├── learnings/YYYY-MM-session.md   # Session-date based learnings
├── plans/YYYY-MM-DD-topic.md      # Date based plans
└── project/                       # DECISIONS, MILESTONES, SPEC, STATUS
```

**Naming:** UPPERCASE.md for project/, lowercase for others, date prefixes for learnings/plans.

## Skills (update docs automatically)
- `/session-start` - Review STATUS.md, suggest tasks
- `/session-end` - Update STATUS.md, optional retro
- `/update-status` - Update docs/project/STATUS.md
- `/retro` - Create docs/learnings/YYYY-MM-session.md
- `/create-issues` - MILESTONES.md → GitHub issues
- `/new-milestone` - Add to MILESTONES.md

## Workflow
1. `/session-start` at beginning
2. Read relevant files before changes (use `file:line` references)
3. Simplest working version first
4. Run `make lint` after code changes
5. Run `make test` before committing
6. `/session-end` at end (updates STATUS.md)

## Principles
- Simplicity over complexity
- No premature abstraction
- Delete unused code
- Evidence before assertions (run tests, don't assume)