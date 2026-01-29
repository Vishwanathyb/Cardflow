# CardFlow - Complete Setup Guide

A step-by-step guide to set up CardFlow from scratch and build for all platforms.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Setup](#2-project-setup)
3. [Running in Development](#3-running-in-development)
4. [Building for Windows](#4-building-for-windows)
5. [Building for Linux (Debian/Ubuntu)](#5-building-for-linux-debianubuntu)
6. [Building for macOS](#6-building-for-macos)
7. [Building for Mobile (PWA)](#7-building-for-mobile-pwa)
8. [Project Structure](#8-project-structure)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

### All Platforms Need:

| Software | Version | Download |
|----------|---------|----------|
| Node.js | 18 or higher | https://nodejs.org/ |
| Yarn | Latest | `npm install -g yarn` |
| Git | Latest | https://git-scm.com/ |

### Check Your Versions:
```bash
node --version    # Should be v18.x.x or higher
yarn --version    # Should be 1.22.x or higher
git --version     # Any recent version
```

---

## 2. Project Setup

### Step 1: Get the Code

```bash
# Clone from GitHub (replace with your repo URL)
git clone https://github.com/YOUR_USERNAME/cardflow-offline.git

# OR if you downloaded a ZIP, extract it and navigate to folder
cd cardflow-offline
```

### Step 2: Install Dependencies

```bash
# Install all Node.js packages
yarn install
```

This will take 1-2 minutes and install everything needed.

### Step 3: Verify Setup

```bash
# Start development server to test
yarn start
```

If a browser opens with the CardFlow app, setup is complete! Press `Ctrl+C` to stop.

---

## 3. Running in Development

```bash
# Start the development server
yarn start

# App will open at http://localhost:3000
# Changes auto-reload in the browser
```

---

## 4. Building for Windows

### Option A: Tauri Build (Recommended - Small ~10MB)

#### Step 1: Install Rust

1. Download Rust installer from https://rustup.rs/
2. Run `rustup-init.exe`
3. Select **"1) Proceed with installation (default)"**
4. **Close and reopen** your terminal/PowerShell

Verify Rust installed:
```powershell
rustc --version
# Should show: rustc 1.xx.x
```

#### Step 2: Install Visual Studio Build Tools

1. Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Run installer
3. Select **"Desktop development with C++"**
4. Click Install (this takes 5-10 minutes)

#### Step 3: Build the App

```powershell
cd cardflow-offline
yarn tauri:build
```

Build takes 5-10 minutes on first run.

#### Step 4: Find Your Installer

```
cardflow-offline/
└── src-tauri/
    └── target/
        └── release/
            └── bundle/
                └── nsis/
                    ├── CardFlow_1.0.0_x64-setup.exe    ← Installer
                    └── CardFlow_1.0.0_x64_portable.exe ← Portable
```

---

### Option B: Electron Build (Larger ~150MB)

No Rust needed, simpler setup.

```powershell
cd cardflow-offline
yarn electron:build
```

Find installer at: `dist-electron/CardFlow Setup 1.0.0.exe`

---

## 5. Building for Linux (Debian/Ubuntu)

### Option A: Tauri Build (Recommended - Small ~10MB)

#### Step 1: Install System Dependencies

```bash
# Update package list
sudo apt update

# Install required libraries
sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libfuse2
```

#### Step 2: Install Rust

```bash
# Download and install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Select option 1 (default installation)

# Load Rust into current terminal
source ~/.cargo/env

# Verify installation
rustc --version
```

#### Step 3: Build the App

```bash
cd cardflow-offline
yarn tauri:build
```

Build takes 5-15 minutes on first run.

#### Step 4: Find Your Packages

```
cardflow-offline/
└── src-tauri/
    └── target/
        └── release/
            └── bundle/
                ├── appimage/
                │   └── CardFlow_1.0.0_amd64.AppImage  ← Universal Linux
                └── deb/
                    └── cardflow_1.0.0_amd64.deb      ← Debian/Ubuntu
```

#### Step 5: Install the .deb Package

```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/cardflow_1.0.0_amd64.deb

# Run from terminal or applications menu
cardflow
```

---

### Option B: Electron Build (Larger ~150MB)

```bash
cd cardflow-offline
yarn electron:build
```

Find AppImage at: `dist-electron/CardFlow-1.0.0.AppImage`

```bash
# Make executable and run
chmod +x dist-electron/CardFlow-1.0.0.AppImage
./dist-electron/CardFlow-1.0.0.AppImage
```

---

## 6. Building for macOS

### Option A: Tauri Build (Recommended - Small ~10MB)

#### Step 1: Install Xcode Command Line Tools

```bash
xcode-select --install
```

Click "Install" in the popup dialog.

#### Step 2: Install Rust

```bash
# Download and install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Select option 1 (default)

# Load Rust
source ~/.cargo/env

# Verify
rustc --version
```

#### Step 3: Build the App

```bash
cd cardflow-offline
yarn tauri:build
```

#### Step 4: Find Your App

```
cardflow-offline/
└── src-tauri/
    └── target/
        └── release/
            └── bundle/
                ├── dmg/
                │   └── CardFlow_1.0.0_x64.dmg    ← Disk Image
                └── macos/
                    └── CardFlow.app              ← Application
```

#### Step 5: Install

- Double-click the `.dmg` file
- Drag CardFlow to Applications folder
- First time: Right-click → Open → Click "Open" in dialog

---

### Option B: Electron Build

```bash
cd cardflow-offline
yarn electron:build
```

Find DMG at: `dist-electron/CardFlow-1.0.0.dmg`

---

## 7. Building for Mobile (PWA)

CardFlow works as a Progressive Web App on phones/tablets.

### Step 1: Build the Web App

```bash
cd cardflow-offline
yarn build
```

This creates a `build/` folder with all files.

### Step 2: Host It Online

You need to upload the `build/` folder to a web host. Free options:

#### Option A: Vercel (Easiest)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd build
vercel

# Follow prompts, get your URL like: cardflow-xxx.vercel.app
```

#### Option B: Netlify

1. Go to https://app.netlify.com/drop
2. Drag and drop the `build` folder
3. Get your URL like: cardflow-xxx.netlify.app

#### Option C: GitHub Pages

```bash
# Install gh-pages
yarn add -D gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d build"

# Deploy
yarn build
yarn deploy
```

### Step 3: Install on Phone

#### Android:
1. Open Chrome
2. Go to your hosted URL
3. Tap ⋮ menu → "Add to Home screen" or "Install app"

#### iPhone/iPad:
1. Open Safari (must be Safari!)
2. Go to your hosted URL
3. Tap Share button (square with arrow)
4. Tap "Add to Home Screen"

---

## 8. Project Structure

```
cardflow-offline/
│
├── public/                    # Static files
│   ├── index.html            # HTML template
│   ├── manifest.json         # PWA configuration
│   └── sw.js                 # Service worker for offline
│
├── src/                      # Source code
│   ├── App.js               # Main React component
│   ├── index.js             # Entry point
│   ├── index.css            # Global styles
│   │
│   ├── lib/
│   │   ├── database.js      # SQLite database operations
│   │   └── stores.js        # Zustand state management
│   │
│   ├── pages/
│   │   ├── Landing.jsx      # Home page
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Registration page
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   └── BoardView.jsx    # Canvas/Kanban/List view
│   │
│   └── components/
│       └── CardNode.jsx     # Card component for canvas
│
├── src-tauri/               # Tauri configuration
│   ├── tauri.conf.json     # App settings
│   ├── Cargo.toml          # Rust dependencies
│   └── src/
│       └── main.rs         # Rust entry point
│
├── electron/               # Electron configuration
│   └── main.js            # Electron entry point
│
├── package.json           # Node.js dependencies & scripts
├── tailwind.config.js     # Tailwind CSS config
├── postcss.config.js      # PostCSS config
├── README.md              # Quick start guide
├── INSTALL.md             # Installation guide for users
└── SETUP.md               # This file - developer setup
```

---

## 9. Troubleshooting

### "yarn: command not found"

```bash
npm install -g yarn
```

### "Node.js version too old"

Download latest from https://nodejs.org/

### Tauri Build: "rustc not found"

```bash
# Linux/macOS
source ~/.cargo/env

# Or restart your terminal
```

### Tauri Build: Windows "link.exe not found"

Install Visual Studio Build Tools with "Desktop development with C++"

### Tauri Build: Linux "webkit2gtk not found"

```bash
sudo apt install libwebkit2gtk-4.1-dev
```

### Electron Build: "Cannot find module 'electron'"

```bash
yarn add -D electron electron-builder
```

### PWA: "Add to Home Screen" not showing

- Make sure site is served over HTTPS
- Wait for page to fully load
- Android: Use Chrome browser
- iOS: Use Safari browser

### App data lost after reinstall

Data is stored locally. Export before uninstalling:
1. Open CardFlow
2. Click profile menu
3. Click "Export Database"
4. Save the .db file

---

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `yarn install` |
| Run development | `yarn start` |
| Build for web/PWA | `yarn build` |
| Build Tauri desktop | `yarn tauri:build` |
| Build Electron desktop | `yarn electron:build` |

---

## Need Help?

- Check [Troubleshooting](#9-troubleshooting) above
- Open an issue on GitHub
- Make sure all prerequisites are installed

---

**Happy Building! 🚀**
