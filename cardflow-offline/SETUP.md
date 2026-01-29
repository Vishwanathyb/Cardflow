# CardFlow - Complete Setup & Installation Guide

**Version 1.0.0**

This guide will walk you through setting up CardFlow from scratch, even if you've never done development before. Follow each step carefully.

---

# Table of Contents

1. [Overview](#1-overview)
2. [Installing Prerequisites on Windows](#2-installing-prerequisites-on-windows)
3. [Installing Prerequisites on Linux (Ubuntu/Debian)](#3-installing-prerequisites-on-linux-ubuntudebian)
4. [Installing Prerequisites on macOS](#4-installing-prerequisites-on-macos)
5. [Downloading the Project](#5-downloading-the-project)
6. [Installing Project Dependencies](#6-installing-project-dependencies)
7. [Running in Development Mode](#7-running-in-development-mode)
8. [Building for Windows](#8-building-for-windows)
9. [Building for Linux](#9-building-for-linux)
10. [Building for macOS](#10-building-for-macos)
11. [Building for Mobile (iOS/Android)](#11-building-for-mobile-iosandroid)
12. [Distributing Your App](#12-distributing-your-app)
13. [Troubleshooting](#13-troubleshooting)
14. [FAQ](#14-faq)

---

# 1. Overview

## What You'll Build

CardFlow is a visual project planning app that works on:
- ✅ Windows (10, 11)
- ✅ Linux (Ubuntu, Debian, Fedora, etc.)
- ✅ macOS (10.15+)
- ✅ Mobile (iOS, Android via PWA)

## What You Need to Install

| Software | Purpose | Required For |
|----------|---------|--------------|
| Node.js | Runs JavaScript code | All platforms |
| Yarn | Package manager | All platforms |
| Git | Download code | All platforms |
| Rust | Compiles native app | Desktop (Tauri) |
| Build Tools | Compiles code | Desktop |

## Time Required

- Prerequisites: 15-30 minutes
- Building: 5-15 minutes

---

# 2. Installing Prerequisites on Windows

## Step 2.1: Install Node.js

Node.js runs the JavaScript code.

### Download:
1. Open your browser
2. Go to: **https://nodejs.org/**
3. Click the **LTS** version (green button) - example: "20.11.0 LTS"
4. Save the file (example: `node-v20.11.0-x64.msi`)

### Install:
1. Double-click the downloaded `.msi` file
2. Click **"Next"**
3. Check **"I accept the terms"** → Click **"Next"**
4. Keep default install location → Click **"Next"**
5. Keep default features → Click **"Next"**
6. **IMPORTANT:** Check ✅ **"Automatically install the necessary tools"**
7. Click **"Next"** → Click **"Install"**
8. Click **"Finish"**

### Verify Installation:
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Type this command and press Enter:
```cmd
node --version
```
4. You should see something like: `v20.11.0`

If you see a version number, Node.js is installed! ✅

---

## Step 2.2: Install Yarn

Yarn manages project packages (libraries).

### Install:
1. Open Command Prompt (Press `Win + R`, type `cmd`, press Enter)
2. Type this command and press Enter:
```cmd
npm install -g yarn
```
3. Wait for it to finish (about 30 seconds)

### Verify Installation:
```cmd
yarn --version
```
You should see something like: `1.22.19`

---

## Step 2.3: Install Git

Git downloads the project code.

### Download:
1. Go to: **https://git-scm.com/download/win**
2. Download should start automatically
3. If not, click **"Click here to download manually"**

### Install:
1. Double-click the downloaded file (example: `Git-2.43.0-64-bit.exe`)
2. Click **"Next"** through all screens (default options are fine)
3. Click **"Install"**
4. Click **"Finish"**

### Verify Installation:
Open a **new** Command Prompt and type:
```cmd
git --version
```
You should see something like: `git version 2.43.0.windows.1`

---

## Step 2.4: Install Rust (For Desktop Apps)

Rust compiles the desktop application. **Skip this if you only want the mobile/web version.**

### Download:
1. Go to: **https://rustup.rs/**
2. Click **"Download rustup-init.exe (64-bit)"**

### Install:
1. Double-click `rustup-init.exe`
2. A terminal window opens
3. Type `1` and press Enter (for default installation)
4. Wait for download and installation (5-10 minutes)
5. When it says "Rust is installed", press Enter to close

### Verify Installation:
**Close all terminals and open a new Command Prompt**, then type:
```cmd
rustc --version
```
You should see something like: `rustc 1.75.0`

---

## Step 2.5: Install Visual Studio Build Tools (For Desktop Apps)

Windows needs these tools to compile code. **Skip if you only want mobile/web version.**

### Download:
1. Go to: **https://visualstudio.microsoft.com/visual-cpp-build-tools/**
2. Click **"Download Build Tools"**

### Install:
1. Run the downloaded file
2. Wait for Visual Studio Installer to load
3. Find **"Desktop development with C++"** and check ✅ it
4. Click **"Install"** (bottom right)
5. Wait for installation (10-20 minutes, downloads ~2GB)
6. Restart your computer when done

---

## Step 2.6: Verify All Windows Prerequisites

Open a **new** Command Prompt and run these commands:

```cmd
node --version
```
Expected: `v18.x.x` or higher ✅

```cmd
yarn --version
```
Expected: `1.22.x` ✅

```cmd
git --version
```
Expected: `git version 2.x.x` ✅

```cmd
rustc --version
```
Expected: `rustc 1.x.x` ✅ (only if you installed Rust)

**If all show version numbers, you're ready!** 🎉

---

# 3. Installing Prerequisites on Linux (Ubuntu/Debian)

Open Terminal (press `Ctrl + Alt + T`)

## Step 3.1: Update System Packages

```bash
sudo apt update && sudo apt upgrade -y
```
Enter your password when prompted (you won't see it as you type).

---

## Step 3.2: Install Node.js

### Method A: Using NodeSource (Recommended)

```bash
# Install curl if not present
sudo apt install -y curl

# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs
```

### Verify:
```bash
node --version
```
Expected: `v20.x.x` ✅

---

## Step 3.3: Install Yarn

```bash
# Install Yarn via npm
sudo npm install -g yarn
```

### Verify:
```bash
yarn --version
```
Expected: `1.22.x` ✅

---

## Step 3.4: Install Git

```bash
sudo apt install -y git
```

### Verify:
```bash
git --version
```
Expected: `git version 2.x.x` ✅

---

## Step 3.5: Install Build Dependencies (For Desktop Apps)

These are required for compiling Tauri desktop apps:

```bash
sudo apt install -y \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libwebkit2gtk-4.1-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libfuse2 \
    libgtk-3-dev \
    libsoup2.4-dev \
    patchelf
```

This downloads about 200MB and takes 2-5 minutes.

---

## Step 3.6: Install Rust (For Desktop Apps)

```bash
# Download and run Rust installer
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

When prompted:
1. Type `1` and press Enter (for default installation)
2. Wait for installation (5-10 minutes)

### Load Rust into your terminal:
```bash
source "$HOME/.cargo/env"
```

### Verify:
```bash
rustc --version
```
Expected: `rustc 1.x.x` ✅

**IMPORTANT:** Run `source "$HOME/.cargo/env"` every time you open a new terminal, OR add it to your `.bashrc`:
```bash
echo 'source "$HOME/.cargo/env"' >> ~/.bashrc
```

---

## Step 3.7: Verify All Linux Prerequisites

```bash
node --version    # Should show v18+ 
yarn --version    # Should show 1.22+
git --version     # Should show 2.x+
rustc --version   # Should show 1.x+ (if installed)
```

**If all show version numbers, you're ready!** 🎉

---

# 4. Installing Prerequisites on macOS

## Step 4.1: Install Homebrew (Package Manager)

Homebrew makes installing software easy on Mac.

Open Terminal (press `Cmd + Space`, type "Terminal", press Enter)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

- Enter your password when prompted
- Press Enter when asked to continue
- Wait for installation (5-10 minutes)

### After installation, run these commands:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Verify:
```bash
brew --version
```
Expected: `Homebrew 4.x.x` ✅

---

## Step 4.2: Install Node.js

```bash
brew install node
```

### Verify:
```bash
node --version
```
Expected: `v20.x.x` or higher ✅

---

## Step 4.3: Install Yarn

```bash
npm install -g yarn
```

### Verify:
```bash
yarn --version
```
Expected: `1.22.x` ✅

---

## Step 4.4: Install Git

```bash
brew install git
```

### Verify:
```bash
git --version
```
Expected: `git version 2.x.x` ✅

---

## Step 4.5: Install Xcode Command Line Tools (For Desktop Apps)

```bash
xcode-select --install
```

A popup appears - click **"Install"** and wait (5-10 minutes).

---

## Step 4.6: Install Rust (For Desktop Apps)

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

1. Type `1` and press Enter
2. Wait for installation

### Load Rust:
```bash
source "$HOME/.cargo/env"
```

### Add to shell profile:
```bash
echo 'source "$HOME/.cargo/env"' >> ~/.zshrc
```

### Verify:
```bash
rustc --version
```
Expected: `rustc 1.x.x` ✅

---

## Step 4.7: Verify All macOS Prerequisites

```bash
node --version    # Should show v18+
yarn --version    # Should show 1.22+
git --version     # Should show 2.x+
rustc --version   # Should show 1.x+ (if installed)
```

**If all show version numbers, you're ready!** 🎉

---

# 5. Downloading the Project

## Option A: Clone from GitHub (Recommended)

```bash
# Navigate to where you want the project
cd ~/Documents

# Clone the repository (replace with your repo URL)
git clone https://github.com/YOUR_USERNAME/cardflow-offline.git

# Enter the project folder
cd cardflow-offline
```

## Option B: Download ZIP File

1. Go to your GitHub repository
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract the ZIP file
5. Open terminal and navigate to the extracted folder:

```bash
# Windows (Command Prompt)
cd C:\Users\YourName\Downloads\cardflow-offline-main

# Linux/macOS
cd ~/Downloads/cardflow-offline-main
```

---

# 6. Installing Project Dependencies

From inside the project folder, run:

```bash
yarn install
```

### What this does:
- Downloads all required JavaScript packages
- Takes 1-3 minutes
- Downloads about 200MB of packages

### Expected output:
```
yarn install v1.22.19
[1/4] Resolving packages...
[2/4] Fetching packages...
[3/4] Linking dependencies...
[4/4] Building fresh packages...
Done in 62.23s.
```

**If you see "Done", the project is set up!** ✅

---

# 7. Running in Development Mode

Test that everything works:

```bash
yarn start
```

### What happens:
1. Terminal shows "Compiled successfully!"
2. Browser opens automatically to `http://localhost:3000`
3. You see the CardFlow landing page

### To stop the development server:
Press `Ctrl + C` in the terminal

---

# 8. Building for Windows

## Option A: Tauri Build (Recommended - ~10MB installer)

Make sure you completed:
- ✅ [Step 2.4: Install Rust](#step-24-install-rust-for-desktop-apps)
- ✅ [Step 2.5: Install Visual Studio Build Tools](#step-25-install-visual-studio-build-tools-for-desktop-apps)

### Build:
```cmd
yarn tauri:build
```

**First build takes 10-20 minutes** (downloads and compiles Rust packages).
Subsequent builds take 2-5 minutes.

### Find your installer:
```
cardflow-offline\
└── src-tauri\
    └── target\
        └── release\
            └── bundle\
                └── nsis\
                    ├── CardFlow_1.0.0_x64-setup.exe    ← INSTALLER
                    └── CardFlow_1.0.0_x64_portable.exe ← PORTABLE
```

### Test the installer:
1. Navigate to the folder above
2. Double-click `CardFlow_1.0.0_x64-setup.exe`
3. Install and run CardFlow!

---

## Option B: Electron Build (~150MB installer)

No Rust needed, but creates larger files.

### Build:
```cmd
yarn electron:build
```

### Find your installer:
```
cardflow-offline\
└── dist-electron\
    └── CardFlow Setup 1.0.0.exe
```

---

# 9. Building for Linux

## Option A: Tauri Build (Recommended)

Make sure you completed:
- ✅ [Step 3.5: Install Build Dependencies](#step-35-install-build-dependencies-for-desktop-apps)
- ✅ [Step 3.6: Install Rust](#step-36-install-rust-for-desktop-apps)

### Load Rust (if new terminal):
```bash
source "$HOME/.cargo/env"
```

### Build:
```bash
yarn tauri:build
```

**First build takes 10-20 minutes.**

### Find your packages:
```
cardflow-offline/
└── src-tauri/
    └── target/
        └── release/
            └── bundle/
                ├── appimage/
                │   └── CardFlow_1.0.0_amd64.AppImage  ← UNIVERSAL
                └── deb/
                    └── cardflow_1.0.0_amd64.deb      ← DEBIAN/UBUNTU
```

### Install .deb package:
```bash
sudo dpkg -i src-tauri/target/release/bundle/deb/cardflow_1.0.0_amd64.deb

# Run the app
cardflow
```

### Run AppImage:
```bash
chmod +x src-tauri/target/release/bundle/appimage/CardFlow_1.0.0_amd64.AppImage
./src-tauri/target/release/bundle/appimage/CardFlow_1.0.0_amd64.AppImage
```

---

## Option B: Electron Build

```bash
yarn electron:build
```

### Find and run:
```bash
chmod +x dist-electron/CardFlow-1.0.0.AppImage
./dist-electron/CardFlow-1.0.0.AppImage
```

---

# 10. Building for macOS

## Option A: Tauri Build (Recommended)

Make sure you completed:
- ✅ [Step 4.5: Install Xcode Command Line Tools](#step-45-install-xcode-command-line-tools-for-desktop-apps)
- ✅ [Step 4.6: Install Rust](#step-46-install-rust-for-desktop-apps)

### Load Rust (if new terminal):
```bash
source "$HOME/.cargo/env"
```

### Build:
```bash
yarn tauri:build
```

### Find your app:
```
cardflow-offline/
└── src-tauri/
    └── target/
        └── release/
            └── bundle/
                ├── dmg/
                │   └── CardFlow_1.0.0_x64.dmg    ← DISK IMAGE
                └── macos/
                    └── CardFlow.app              ← APPLICATION
```

### Install:
1. Double-click `CardFlow_1.0.0_x64.dmg`
2. Drag CardFlow to Applications folder
3. **First time only:** Right-click CardFlow → Open → Click "Open"

---

## Option B: Electron Build

```bash
yarn electron:build
```

Find DMG at: `dist-electron/CardFlow-1.0.0.dmg`

---

# 11. Building for Mobile (iOS/Android)

Mobile uses PWA (Progressive Web App) - the app runs in a browser but can be installed.

## Step 11.1: Build the Web App

```bash
yarn build
```

This creates a `build/` folder with all files.

## Step 11.2: Host Online

You need to put the `build/` folder on a web server. Free options:

### Option A: Vercel (Easiest - Recommended)

1. Create account at **https://vercel.com** (use GitHub to sign up)

2. Install Vercel CLI:
```bash
npm install -g vercel
```

3. Deploy:
```bash
cd cardflow-offline/build
vercel
```

4. Follow prompts:
   - **Set up and deploy?** → Y
   - **Which scope?** → Select your account
   - **Link to existing project?** → N
   - **Project name?** → cardflow (or any name)
   - **Directory?** → ./
   - **Override settings?** → N

5. Wait for deployment (1-2 minutes)

6. Get your URL like: `https://cardflow-abc123.vercel.app`

### Option B: Netlify

1. Go to **https://app.netlify.com/drop**
2. Drag and drop the entire `build` folder onto the page
3. Wait for upload
4. Get your URL like: `https://random-name-123.netlify.app`

### Option C: GitHub Pages

1. Install gh-pages:
```bash
yarn add -D gh-pages
```

2. Add to `package.json` in "scripts" section:
```json
"predeploy": "yarn build",
"deploy": "gh-pages -d build"
```

3. Deploy:
```bash
yarn deploy
```

4. Go to GitHub repo → Settings → Pages → Your URL is shown

## Step 11.3: Install on Mobile

### Android:

1. Open **Chrome** browser
2. Go to your hosted URL (e.g., `https://cardflow-abc.vercel.app`)
3. Wait for page to fully load
4. Tap the **⋮** menu (three dots, top right)
5. Tap **"Add to Home screen"** or **"Install app"**
6. Tap **"Install"** or **"Add"**
7. CardFlow icon appears on home screen! ✅

### iPhone/iPad:

1. Open **Safari** browser (MUST be Safari, not Chrome)
2. Go to your hosted URL
3. Wait for page to fully load
4. Tap the **Share** button (square with arrow pointing up)
5. Scroll down and tap **"Add to Home Screen"**
6. Tap **"Add"** (top right)
7. CardFlow icon appears on home screen! ✅

---

# 12. Distributing Your App

## Windows Distribution

Share these files:
- `CardFlow_1.0.0_x64-setup.exe` - Users double-click to install
- `CardFlow_1.0.0_x64_portable.exe` - No install needed, just run

## Linux Distribution

Share these files:
- `cardflow_1.0.0_amd64.deb` - For Debian/Ubuntu: `sudo dpkg -i file.deb`
- `CardFlow_1.0.0_amd64.AppImage` - Universal: `chmod +x file.AppImage && ./file.AppImage`

## macOS Distribution

Share these files:
- `CardFlow_1.0.0_x64.dmg` - Users open and drag to Applications

## Mobile Distribution

Share your hosted URL:
- Users visit in browser and tap "Add to Home Screen"

---

# 13. Troubleshooting

## Common Errors and Solutions

### "yarn: command not found"

**Solution:**
```bash
npm install -g yarn
```
Then close and reopen terminal.

---

### "node: command not found"

**Solution:** Install Node.js from https://nodejs.org/

---

### "rustc: command not found"

**Solution (Linux/macOS):**
```bash
source "$HOME/.cargo/env"
```

**Solution (Windows):** Close and reopen Command Prompt after Rust installation.

---

### "error: linker `link.exe` not found" (Windows)

**Solution:** Install Visual Studio Build Tools with "Desktop development with C++" workload.

---

### "error: failed to run custom build command for webkit2gtk-sys" (Linux)

**Solution:**
```bash
sudo apt install libwebkit2gtk-4.1-dev
```

---

### "Error: EACCES: permission denied" (npm/yarn)

**Solution (Linux/macOS):**
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ~/.config
```

---

### Tauri build fails with memory error

**Solution:** Close other applications and try again. Tauri build needs 4GB+ RAM.

---

### "The application cannot be opened" (macOS)

**Solution:**
```bash
xattr -cr /Applications/CardFlow.app
```
Or: System Preferences → Security & Privacy → "Open Anyway"

---

### AppImage won't run (Linux)

**Solution:**
```bash
sudo apt install libfuse2
chmod +x CardFlow_1.0.0_amd64.AppImage
./CardFlow_1.0.0_amd64.AppImage
```

---

### PWA "Add to Home Screen" not appearing

**Solutions:**
- Make sure URL is HTTPS (not HTTP)
- Wait for page to fully load (all resources)
- Android: Use Chrome browser
- iOS: Use Safari browser
- Clear browser cache and try again

---

### Build takes forever / stuck

**Solutions:**
- First Tauri build downloads ~500MB of packages - be patient
- Check internet connection
- Try: `yarn cache clean` then `yarn install` again

---

# 14. FAQ

## Q: Do I need all these tools just to run the app?

**A:** No! The tools are for *building* the app. End users just need the installer file.

---

## Q: Can I skip Rust if I only want mobile?

**A:** Yes! For mobile/web only:
1. Install just Node.js, Yarn, Git
2. Run `yarn install` then `yarn build`
3. Host the `build/` folder online
4. Install as PWA on phone

---

## Q: How do I update the app later?

**A:** 
1. Pull latest code: `git pull`
2. Install new dependencies: `yarn install`
3. Rebuild: `yarn tauri:build` (or `electron:build`)

---

## Q: Where is my data stored?

**A:**
- Windows: `%APPDATA%\CardFlow\`
- Linux: `~/.local/share/CardFlow/`
- macOS: `~/Library/Application Support/CardFlow/`
- Mobile: Browser's localStorage

---

## Q: How do I backup my data?

**A:**
1. Open CardFlow
2. Click your profile icon
3. Click "Export Database"
4. Save the `.db` file

---

## Q: The app file is huge! Can I make it smaller?

**A:** 
- Use Tauri (~10MB) instead of Electron (~150MB)
- The Tauri build is already optimized

---

## Q: Can I customize the app icon?

**A:** Yes! Replace images in:
- `public/icons/` (for PWA)
- `src-tauri/icons/` (for desktop)

Then rebuild.

---

# Quick Reference Card

## Commands Summary

| Action | Command |
|--------|---------|
| Install packages | `yarn install` |
| Run development | `yarn start` |
| Build web/PWA | `yarn build` |
| Build desktop (Tauri) | `yarn tauri:build` |
| Build desktop (Electron) | `yarn electron:build` |
| Deploy to Vercel | `cd build && vercel` |

## Build Output Locations

| Platform | Location |
|----------|----------|
| Windows Installer | `src-tauri/target/release/bundle/nsis/` |
| Linux .deb | `src-tauri/target/release/bundle/deb/` |
| Linux AppImage | `src-tauri/target/release/bundle/appimage/` |
| macOS .dmg | `src-tauri/target/release/bundle/dmg/` |
| Web/PWA | `build/` |

---

# Need More Help?

1. Check the [Troubleshooting](#13-troubleshooting) section above
2. Search for your error message online
3. Open an issue on the GitHub repository

---

**Happy Building!** 🚀

*Last updated: January 2025*
