# CardFlow - Visual Project Planning (Offline Edition)

**100% Offline • SQLite Database • Cross-Platform**

---

## ⚡ Quick Start - Run Locally in 2 Minutes

### Step 1: Install Node.js
Download and install from: https://nodejs.org/ (LTS version)

### Step 2: Install Yarn
Open terminal/command prompt and run:
```bash
npm install -g yarn
```

### Step 3: Install Dependencies
```bash
cd cardflow-offline
yarn install
```

### Step 4: Run the App
```bash
yarn start
```

The app opens in your browser at `http://localhost:3000` ✅

---

## 📁 What's Included

```
cardflow-offline/
├── src/                      # Source code
│   ├── App.js               # Main app component
│   ├── index.js             # Entry point
│   ├── index.css            # Styles
│   ├── lib/
│   │   ├── database.js      # SQLite database (sql.js)
│   │   └── stores.js        # State management (Zustand)
│   ├── pages/
│   │   ├── Landing.jsx      # Landing page
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Register page
│   │   ├── Dashboard.jsx    # Dashboard with workspaces/boards
│   │   └── BoardView.jsx    # Canvas/Kanban/List views
│   └── components/
│       └── CardNode.jsx     # Card component for canvas
├── public/
│   ├── index.html           # HTML template
│   ├── manifest.json        # PWA manifest
│   └── sw.js                # Service worker for offline
├── src-tauri/               # Tauri desktop config
├── electron/                # Electron desktop config
├── package.json             # Dependencies
├── SETUP.md                 # Full setup guide
└── INSTALL.md               # User installation guide
```

---

## 🖥️ Run Locally (Development Mode)

### Prerequisites
- Node.js 18+ (https://nodejs.org/)
- Yarn (`npm install -g yarn`)

### Commands

```bash
# 1. Navigate to project folder
cd cardflow-offline

# 2. Install all dependencies (first time only)
yarn install

# 3. Start the development server
yarn start
```

**What happens:**
- Terminal shows "Compiled successfully!"
- Browser opens to http://localhost:3000
- Changes auto-reload when you edit code
- Press `Ctrl+C` to stop

---

## 🔨 Build Executable Files

**The .exe, .deb, .dmg files are NOT included - you must BUILD them.**

### Build for Windows (.exe)

#### Prerequisites:
1. Install Rust: https://rustup.rs/
2. Install Visual Studio Build Tools: https://visualstudio.microsoft.com/visual-cpp-build-tools/
   - Select "Desktop development with C++"

#### Build Command:
```bash
yarn tauri:build
```

#### Output Files:
```
src-tauri/target/release/bundle/nsis/
├── CardFlow_1.0.0_x64-setup.exe      # Installer
└── CardFlow_1.0.0_x64_portable.exe   # Portable (no install)
```

---

### Build for Linux (.deb, .AppImage)

#### Prerequisites:
```bash
# Install build dependencies
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev libfuse2

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

#### Build Command:
```bash
yarn tauri:build
```

#### Output Files:
```
src-tauri/target/release/bundle/
├── deb/cardflow_1.0.0_amd64.deb           # Debian/Ubuntu package
└── appimage/CardFlow_1.0.0_amd64.AppImage # Universal Linux
```

#### Install .deb:
```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/cardflow_1.0.0_amd64.deb
cardflow  # Run the app
```

#### Run AppImage:
```bash
chmod +x src-tauri/target/release/bundle/appimage/CardFlow_1.0.0_amd64.AppImage
./CardFlow_1.0.0_amd64.AppImage
```

---

### Build for macOS (.dmg)

#### Prerequisites:
```bash
# Install Xcode command line tools
xcode-select --install

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

#### Build Command:
```bash
yarn tauri:build
```

#### Output Files:
```
src-tauri/target/release/bundle/
├── dmg/CardFlow_1.0.0_x64.dmg    # Disk image
└── macos/CardFlow.app            # Application
```

---

### Build for Mobile (PWA)

No special tools needed!

#### Build Command:
```bash
yarn build
```

#### Output:
A `build/` folder is created. Host it online:

**Option 1: Vercel (free)**
```bash
npm install -g vercel
cd build
vercel
```

**Option 2: Netlify (free)**
1. Go to https://app.netlify.com/drop
2. Drag the `build` folder onto the page
3. Get your URL

#### Install on Phone:
1. Open the URL in browser
2. **Android (Chrome):** Menu → "Add to Home screen"
3. **iOS (Safari):** Share → "Add to Home Screen"

---

## 📋 All Commands Reference

| Command | Description |
|---------|-------------|
| `yarn install` | Install dependencies (first time) |
| `yarn start` | Run locally at localhost:3000 |
| `yarn build` | Build for web/PWA |
| `yarn tauri:build` | Build desktop app (requires Rust) |
| `yarn electron:build` | Build desktop app (no Rust, larger file) |

---

## 🔧 Alternative: Electron Build (No Rust Required)

If you don't want to install Rust, use Electron instead:

```bash
yarn electron:build
```

**Output:**
- Windows: `dist-electron/CardFlow Setup 1.0.0.exe`
- Linux: `dist-electron/CardFlow-1.0.0.AppImage`
- macOS: `dist-electron/CardFlow-1.0.0.dmg`

**Note:** Electron builds are ~150MB vs Tauri's ~10MB.

---

## 💾 How Data is Stored

CardFlow uses **SQLite** (via sql.js) stored in your browser's localStorage.

- All data stays on your device
- Works 100% offline
- Export/Import database from the app menu

---

## 🐛 Troubleshooting

### "yarn: command not found"
```bash
npm install -g yarn
```

### "Cannot find module" errors
```bash
rm -rf node_modules
yarn install
```

### Tauri build: "rustc not found"
```bash
# Linux/macOS
source ~/.cargo/env

# Windows: Restart terminal after Rust install
```

### Tauri build: "webkit2gtk not found" (Linux)
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

### Port 3000 already in use
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/macOS:
lsof -i :3000
kill -9 <PID>
```

---

## 📖 More Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup guide with screenshots
- **[INSTALL.md](INSTALL.md)** - End-user installation guide

---

## 🎯 Features

- ✅ Infinite canvas with pan & zoom
- ✅ Visual card linking (7 relationship types)
- ✅ Multiple views (Canvas, Kanban, List)
- ✅ SQLite local database
- ✅ 100% offline functionality
- ✅ Dark/Light theme
- ✅ Export/Import data
- ✅ Cross-platform (Windows, Linux, macOS, Mobile)

---

## ❓ FAQ

**Q: Why aren't .exe files included?**
A: Executables must be built on your machine. This keeps the download small and ensures compatibility.

**Q: Do I need Rust for development?**
A: No! `yarn start` runs without Rust. Rust is only needed to build desktop installers.

**Q: Can I just use the web version?**
A: Yes! Run `yarn build` and host the `build/` folder anywhere. Works as a PWA.

**Q: Where is my data saved?**
A: In your browser's localStorage (web) or app data folder (desktop).

---

**Made for visual thinkers** ✨
