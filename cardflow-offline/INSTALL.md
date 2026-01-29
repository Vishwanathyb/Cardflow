# CardFlow - Visual Project Planning

<p align="center">
  <img src="public/icons/icon-192.png" alt="CardFlow Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Plan projects the way your mind works</strong><br>
  Infinite canvas • Visual linking • 100% Offline
</p>

<p align="center">
  <a href="#windows">Windows</a> •
  <a href="#linux-debian-ubuntu">Linux</a> •
  <a href="#macos">macOS</a> •
  <a href="#mobile-ios--android">Mobile</a>
</p>

---

## Features

- 🎨 **Infinite Canvas** - Pan, zoom, and place cards anywhere
- 🔗 **Visual Linking** - Connect cards with 7 relationship types
- 📊 **Multiple Views** - Canvas, Kanban, and List views
- 💾 **SQLite Storage** - Fast, reliable local database
- 📴 **100% Offline** - No internet required, ever
- 🌙 **Dark/Light Mode** - Easy on the eyes
- 📦 **Export/Import** - Backup and restore anytime

---

## Table of Contents

- [Windows Installation](#windows)
- [Linux (Debian/Ubuntu) Installation](#linux-debian-ubuntu)
- [macOS Installation](#macos)
- [Mobile (iOS & Android)](#mobile-ios--android)
- [Building from Source](#building-from-source)
- [Troubleshooting](#troubleshooting)

---

## Windows

### Option 1: Download Installer (Recommended)

1. **Download** `CardFlow_1.0.0_x64-setup.exe` from [Releases](https://github.com/your-repo/releases)

2. **Run the installer**
   - Double-click the downloaded `.exe` file
   - If Windows SmartScreen appears, click "More info" → "Run anyway"
   - Follow the installation wizard

3. **Launch CardFlow**
   - Find "CardFlow" in Start Menu
   - Or double-click the desktop shortcut

### Option 2: Portable Version (No Install)

1. **Download** `CardFlow_1.0.0_x64_portable.exe` from [Releases](https://github.com/your-repo/releases)

2. **Run directly**
   - Double-click to run - no installation needed
   - Move the file anywhere you like

### Option 3: Build from Source

See [Building from Source - Windows](#windows-build)

### Uninstall (Windows)

- **Settings** → **Apps** → **CardFlow** → **Uninstall**
- Or run the uninstaller from Start Menu

---

## Linux (Debian/Ubuntu)

### Option 1: AppImage (Universal - Recommended)

Works on any Linux distribution.

```bash
# 1. Download the AppImage
wget https://github.com/your-repo/releases/download/v1.0.0/CardFlow_1.0.0_amd64.AppImage

# 2. Make it executable
chmod +x CardFlow_1.0.0_amd64.AppImage

# 3. Run it
./CardFlow_1.0.0_amd64.AppImage
```

**Optional: Integrate with system**
```bash
# Move to applications folder
sudo mv CardFlow_1.0.0_amd64.AppImage /opt/cardflow.AppImage

# Create desktop entry
cat > ~/.local/share/applications/cardflow.desktop << EOF
[Desktop Entry]
Name=CardFlow
Comment=Visual Project Planning
Exec=/opt/cardflow.AppImage
Icon=cardflow
Type=Application
Categories=Office;ProjectManagement;
EOF
```

### Option 2: Debian Package (.deb)

For Debian, Ubuntu, Linux Mint, Pop!_OS, etc.

```bash
# 1. Download the .deb package
wget https://github.com/your-repo/releases/download/v1.0.0/cardflow_1.0.0_amd64.deb

# 2. Install with dpkg
sudo dpkg -i cardflow_1.0.0_amd64.deb

# 3. Fix any dependency issues
sudo apt-get install -f

# 4. Launch from applications menu or terminal
cardflow
```

### Option 3: Build from Source

See [Building from Source - Linux](#linux-build)

### Uninstall (Linux)

```bash
# If installed via .deb
sudo apt remove cardflow

# If using AppImage
rm /opt/cardflow.AppImage
rm ~/.local/share/applications/cardflow.desktop
```

---

## macOS

### Option 1: DMG Installer (Recommended)

1. **Download** `CardFlow_1.0.0_x64.dmg` from [Releases](https://github.com/your-repo/releases)

2. **Install**
   - Double-click the `.dmg` file
   - Drag **CardFlow** to **Applications** folder

3. **First Launch** (Important for unsigned apps)
   - Right-click CardFlow in Applications
   - Select "Open"
   - Click "Open" in the security dialog
   - (Only needed once)

### Option 2: Homebrew (Coming Soon)

```bash
brew install --cask cardflow
```

### Option 3: Build from Source

See [Building from Source - macOS](#macos-build)

### Uninstall (macOS)

- Drag CardFlow from Applications to Trash
- Empty Trash

---

## Mobile (iOS & Android)

CardFlow runs as a **Progressive Web App (PWA)** on mobile devices. This means you install it directly from your browser - no app store needed!

### Android Installation

1. **Open Chrome** browser on your Android device

2. **Visit** `https://your-cardflow-url.com`

3. **Install the app:**
   - Tap the **⋮** menu (three dots) in Chrome
   - Select **"Add to Home screen"** or **"Install app"**
   - Tap **"Install"** in the popup

4. **Done!** CardFlow icon appears on your home screen

**Alternative method:**
- A banner may appear at the bottom saying "Add CardFlow to Home screen"
- Simply tap it to install

### iOS (iPhone/iPad) Installation

1. **Open Safari** browser (PWA install only works in Safari on iOS)

2. **Visit** `https://your-cardflow-url.com`

3. **Install the app:**
   - Tap the **Share** button (square with arrow)
   - Scroll down and tap **"Add to Home Screen"**
   - Tap **"Add"** in the top right

4. **Done!** CardFlow icon appears on your home screen

### Mobile Features

✅ Works 100% offline after first load  
✅ Full canvas, kanban, and list views  
✅ Touch-optimized interface  
✅ Syncs data locally on device  
✅ No account required  

### Hosting Your Own PWA

To use CardFlow on mobile, you need to host it somewhere:

```bash
# Build the PWA
cd cardflow-offline
yarn install
yarn build

# The 'build' folder contains your PWA
# Host it on any of these (free options):
# - Vercel: vercel deploy
# - Netlify: drag & drop build folder
# - GitHub Pages
# - Firebase Hosting
```

**Quick deploy with Vercel:**
```bash
npm i -g vercel
cd cardflow-offline
yarn build
cd build
vercel
```

---

## Building from Source

### Prerequisites (All Platforms)

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Yarn** - `npm install -g yarn`
- **Git** - [Download](https://git-scm.com/)

### Clone the Repository

```bash
git clone https://github.com/your-repo/cardflow-offline.git
cd cardflow-offline
yarn install
```

---

### Windows Build

#### Using Tauri (Recommended - ~10MB)

1. **Install Rust**
   - Download from [rustup.rs](https://rustup.rs/)
   - Run the installer, select default options
   - Restart your terminal

2. **Install Visual Studio Build Tools**
   - Download [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Select "Desktop development with C++"

3. **Build**
   ```powershell
   cd cardflow-offline
   yarn tauri:build
   ```

4. **Output**
   ```
   src-tauri/target/release/bundle/
   ├── nsis/CardFlow_1.0.0_x64-setup.exe    # Installer
   └── nsis/CardFlow_1.0.0_x64_portable.exe # Portable
   ```

#### Using Electron (~150MB)

```powershell
cd cardflow-offline
yarn electron:build
# Output: dist-electron/CardFlow Setup 1.0.0.exe
```

---

### Linux Build

#### Using Tauri (Recommended - ~10MB)

1. **Install dependencies**
   ```bash
   # Debian/Ubuntu
   sudo apt update
   sudo apt install -y \
     libwebkit2gtk-4.1-dev \
     build-essential \
     curl \
     wget \
     file \
     libssl-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev

   # Fedora
   sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file

   # Arch
   sudo pacman -S webkit2gtk-4.1 base-devel curl wget file openssl
   ```

2. **Install Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

3. **Build**
   ```bash
   cd cardflow-offline
   yarn tauri:build
   ```

4. **Output**
   ```
   src-tauri/target/release/bundle/
   ├── appimage/CardFlow_1.0.0_amd64.AppImage
   └── deb/cardflow_1.0.0_amd64.deb
   ```

#### Using Electron (~150MB)

```bash
cd cardflow-offline
yarn electron:build
# Output: dist-electron/CardFlow-1.0.0.AppImage
```

---

### macOS Build

#### Using Tauri (Recommended - ~10MB)

1. **Install Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

2. **Install Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

3. **Build**
   ```bash
   cd cardflow-offline
   yarn tauri:build
   ```

4. **Output**
   ```
   src-tauri/target/release/bundle/
   ├── dmg/CardFlow_1.0.0_x64.dmg
   └── macos/CardFlow.app
   ```

#### Using Electron (~150MB)

```bash
cd cardflow-offline
yarn electron:build
# Output: dist-electron/CardFlow-1.0.0.dmg
```

---

## Troubleshooting

### Windows

**"Windows protected your PC" message**
- Click "More info" → "Run anyway"
- This appears because the app isn't signed with a certificate

**App won't start**
- Install [WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)
- Required for Tauri apps on older Windows versions

### Linux

**AppImage won't run**
```bash
# Make sure FUSE is installed
sudo apt install libfuse2

# Or extract and run
./CardFlow.AppImage --appimage-extract
./squashfs-root/cardflow
```

**Missing libraries error**
```bash
# Install WebKit dependencies
sudo apt install libwebkit2gtk-4.1-0
```

### macOS

**"App is damaged" or "can't be opened"**
```bash
# Remove quarantine attribute
xattr -cr /Applications/CardFlow.app
```

**"Developer cannot be verified"**
- System Preferences → Security & Privacy → "Open Anyway"

### Mobile PWA

**Install option doesn't appear (Android)**
- Make sure you're using Chrome
- Visit the HTTPS version of the site
- Wait for the page to fully load

**Install option doesn't appear (iOS)**
- Must use Safari (not Chrome)
- Use the Share button, not the menu

**App not working offline**
- Open the app once while online
- Wait for "Ready for offline use" message
- Then it works offline

---

## Data Storage

CardFlow stores all data locally:

| Platform | Data Location |
|----------|--------------|
| Windows | `%APPDATA%/CardFlow/` |
| Linux | `~/.local/share/CardFlow/` |
| macOS | `~/Library/Application Support/CardFlow/` |
| Mobile PWA | Browser localStorage |

### Backup Your Data

1. Open CardFlow
2. Click your profile → **"Export Database"**
3. Save the `.db` file somewhere safe

### Restore Data

1. Open CardFlow
2. Click your profile → **"Import Database"**
3. Select your backup `.db` file

---

## System Requirements

| Platform | Minimum | Recommended |
|----------|---------|-------------|
| Windows | Windows 10 (64-bit) | Windows 11 |
| Linux | Ubuntu 20.04+ | Ubuntu 22.04+ |
| macOS | macOS 10.15+ | macOS 12+ |
| Mobile | iOS 14+ / Android 8+ | Latest |
| RAM | 4 GB | 8 GB |
| Storage | 50 MB | 100 MB |

---

## License

MIT License - Free for personal and commercial use.

---

## Support

- 📖 [Documentation](https://github.com/your-repo/wiki)
- 🐛 [Report Bug](https://github.com/your-repo/issues)
- 💡 [Request Feature](https://github.com/your-repo/issues)

---

<p align="center">
  Made with ❤️ for visual thinkers
</p>
