# CardFlow - Visual Project Planning Application

## Original Problem Statement
CardFlow is a visual project planning application that allows users to manage work using cards placed on an infinite canvas, with the ability to visually link cards to represent dependencies, workflows, relationships, and ideas.

## Architecture
- **Frontend**: React 19 with React Flow (@xyflow/react) for infinite canvas
- **Backend**: FastAPI with MongoDB
- **Authentication**: JWT (email/password) + Google OAuth via Emergent Auth
- **Offline**: IndexedDB via idb library
- **Styling**: Tailwind CSS with Shadcn/UI components

## User Personas
1. Solo developers managing personal projects
2. Indie hackers planning MVPs
3. Startup engineering teams visualizing roadmaps
4. Designers collaborating with engineers
5. Visual thinkers who want structure without rigidity

## Core Requirements (Static)
1. ✅ Infinite canvas with pan/zoom
2. ✅ Card system (Feature, Task, Bug, Idea, Epic, Note)
3. ✅ Visual linking between cards
4. ✅ Status system (Idea, Planned, In Progress, Testing, Done, Archived)
5. ✅ Workspace and Board management
6. ✅ Multiple views (Canvas, Kanban, List)
7. ✅ Theme toggle (Light/Dark)
8. ✅ Offline support with IndexedDB
9. ✅ Search and filters
10. ✅ Export/Import (JSON)

## What's Been Implemented (January 29, 2026)

### Authentication
- JWT-based registration and login
- Google OAuth via Emergent Auth integration
- Session management with httpOnly cookies
- Protected routes with auth checking

### Workspace System
- Create, read, delete workspaces
- Color-coded workspace organization
- Workspace switching in sidebar

### Board System
- Create boards within workspaces
- Default status system (6 statuses)
- Board cards with preview

### Card System
- Create, edit, delete cards
- Card types: Feature, Task, Bug, Idea, Epic, Note
- Properties: title, description, type, status, priority, tags
- Draggable positions on canvas

### Visual Linking
- Connect cards via drag-and-drop on canvas handles
- Link types: depends_on, blocks, related_to, part_of, uses, references, duplicate_of
- Animated edges for dependency links
- Delete links via keyboard

### Views
- **Canvas View**: React Flow with custom card nodes, minimap, controls
- **Kanban View**: Drag-and-drop between status columns
- **List View**: Table format with sorting

### Offline Support
- IndexedDB for local storage
- Caching of workspaces, boards, cards, links
- Pending changes queue
- Online/offline indicator

### UI/UX
- Manrope + Inter fonts
- Electric Indigo primary color (#4F46E5)
- Glassmorphism toolbars
- Smooth animations
- Theme toggle (light/dark)

## Prioritized Backlog

### P0 (Critical - Next Sprint)
- [ ] Real-time collaboration (WebSocket)
- [ ] Card comments and activity log
- [ ] Keyboard shortcuts

### P1 (Important)
- [ ] Custom card types
- [ ] Custom status workflows
- [ ] Card checklists
- [ ] Due dates with calendar
- [ ] Assignees

### P2 (Nice to Have)
- [ ] Image/file attachments
- [ ] Board templates
- [ ] Import from Trello/Notion
- [ ] Export to PNG/SVG
- [ ] Timeline/Roadmap view

### P3 (Future)
- [ ] AI auto-linking suggestions
- [ ] Desktop app (Tauri/Electron)
- [ ] Team roles and permissions
- [ ] Audit logs

## Next Tasks
1. Implement keyboard shortcuts (Ctrl+N for new card, etc.)
2. Add card comments feature
3. Build real-time collaboration with WebSockets
4. Add due date support with calendar picker

---

## Offline Version (January 29, 2026)

### What's Been Implemented

#### Offline App Structure (`/app/cardflow-offline/`)
- Complete standalone React app with SQLite database
- PWA support with service worker for mobile
- Tauri configuration for desktop apps (Linux/Windows/macOS)
- Electron alternative for larger desktop builds

#### SQLite Database (`src/lib/database.js`)
- sql.js (SQLite compiled to WebAssembly)
- Tables: users, workspaces, boards, cards, links, settings
- Full CRUD operations
- Export/Import database as .db files
- Data stored in localStorage

#### State Management (`src/lib/stores.js`)
- Zustand stores for: Auth, Workspace, Board, Card, Link, Theme
- Persisted state with zustand/middleware
- Reactive data flow

#### Desktop Build Options
1. **Tauri 2.0** (Recommended)
   - ~10MB app size
   - Native performance
   - Linux: AppImage, .deb
   - Windows: NSIS installer, portable
   - macOS: DMG

2. **Electron** (Alternative)
   - ~150MB app size
   - Easier setup
   - Same platform support

#### Mobile (PWA)
- Service Worker for offline caching
- Web App Manifest for installability
- Works on iOS and Android via browser install

### Build Commands
```bash
# Development
yarn start

# Tauri Desktop Build
yarn tauri:build

# Electron Desktop Build  
yarn electron:build

# PWA Production Build
yarn build
```

### Files Created
- `/app/cardflow-offline/` - Complete offline app
- `src/lib/database.js` - SQLite operations
- `src/lib/stores.js` - State management
- `src-tauri/` - Tauri native app config
- `electron/main.js` - Electron config
- `public/sw.js` - Service Worker
- `public/manifest.json` - PWA manifest
