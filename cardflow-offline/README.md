# CardFlow Offline - Visual Project Planning

A cross-platform, offline-first visual project planning application with infinite canvas.

## Features

- 🎨 **Infinite Canvas** - Pan, zoom, and place cards anywhere
- 🔗 **Visual Linking** - Connect cards to show dependencies
- 📊 **Multiple Views** - Canvas, Kanban, and List views
- 💾 **SQLite Storage** - Fast, reliable local database
- 📴 **100% Offline** - Works without internet
- 🌙 **Dark/Light Mode** - Theme toggle
- 📦 **Export/Import** - Backup and restore data

## Platforms

- **Windows** (Tauri/Electron)
- **Linux** (Tauri/Electron - AppImage, .deb)
- **macOS** (Tauri/Electron)
- **Mobile** (PWA - iOS/Android)

## Quick Start

### Development

```bash
# Install dependencies
yarn install

# Start development server
yarn start
```

### Build for Desktop (Tauri - Recommended)

Tauri creates lightweight native apps (~10MB).

```bash
# Prerequisites: Install Rust
# Windows: https://rustup.rs/
# Linux: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# macOS: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Linux also needs:
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev

# Build for your platform
yarn tauri:build

# Output locations:
# Windows: src-tauri/target/release/bundle/nsis/CardFlow_1.0.0_x64-setup.exe
# Linux: src-tauri/target/release/bundle/appimage/cardflow_1.0.0_amd64.AppImage
# macOS: src-tauri/target/release/bundle/dmg/CardFlow_1.0.0_x64.dmg
```

### Build for Desktop (Electron - Alternative)

Electron creates larger apps (~150MB) but easier to set up.

```bash
# Build for your platform
yarn electron:build

# Output: dist-electron/
```

### Mobile (PWA)

The app works as a Progressive Web App on mobile devices:

1. Build the production version:
```bash
yarn build
```

2. Host the `build/` folder on any static hosting (Netlify, Vercel, GitHub Pages)

3. On mobile, open the URL in Chrome/Safari and:
   - **Android**: Tap menu → "Add to Home Screen"
   - **iOS**: Tap Share → "Add to Home Screen"

The PWA will work offline after first visit.

## Project Structure

```
cardflow-offline/
├── public/
│   ├── index.html
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service Worker for offline
├── src/
│   ├── components/       # React components
│   ├── lib/
│   │   ├── database.js   # SQLite database operations
│   │   └── stores.js     # Zustand state stores
│   ├── pages/            # Page components
│   ├── App.js            # Main app
│   └── index.css         # Styles
├── src-tauri/            # Tauri native app config
├── electron/             # Electron config
└── package.json
```

## Database

CardFlow uses SQLite (via sql.js) stored in localStorage:

- **Tables**: users, workspaces, boards, cards, links, settings
- **Export**: Download database as `.db` file
- **Import**: Restore from `.db` backup file

## Keyboard Shortcuts

- `Backspace/Delete` - Delete selected card/link
- Canvas zoom: Mouse scroll
- Canvas pan: Click and drag on background

## Tech Stack

- **Frontend**: React 18, React Flow, Tailwind CSS
- **Database**: sql.js (SQLite compiled to WebAssembly)
- **State**: Zustand
- **Desktop**: Tauri 2.0 / Electron
- **PWA**: Service Worker, Web App Manifest

## Build Requirements

### Tauri (Recommended)
- Node.js 18+
- Rust (latest stable)
- Platform-specific dependencies (see Tauri docs)

### Electron
- Node.js 18+

## License

MIT
