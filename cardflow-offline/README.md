# CardFlow - Quick Start Guide

## 🚀 One-Minute Install

### Windows
```
Download → Double-click CardFlow_1.0.0_x64-setup.exe → Done!
```

### Linux (Debian/Ubuntu)
```bash
wget https://github.com/your-repo/releases/download/v1.0.0/cardflow_1.0.0_amd64.deb
sudo dpkg -i cardflow_1.0.0_amd64.deb
```

### macOS
```
Download CardFlow_1.0.0_x64.dmg → Drag to Applications → Done!
```

### Mobile (iOS/Android)
```
Visit cardflow-url.com in browser → "Add to Home Screen" → Done!
```

---

## 📖 Full Installation Guide

See **[INSTALL.md](INSTALL.md)** for:
- Detailed step-by-step instructions
- Building from source
- Troubleshooting
- System requirements

---

## 🛠️ Build Commands

```bash
# Install dependencies
yarn install

# Development
yarn start

# Build Desktop (Tauri - lightweight)
yarn tauri:build

# Build Desktop (Electron)
yarn electron:build

# Build PWA for mobile
yarn build
```

---

## 📁 Project Structure

```
cardflow-offline/
├── src/                  # React source code
│   ├── lib/
│   │   ├── database.js   # SQLite operations
│   │   └── stores.js     # State management
│   ├── pages/            # Page components
│   └── components/       # UI components
├── public/               # Static files + PWA config
├── src-tauri/            # Tauri desktop config
├── electron/             # Electron config
├── INSTALL.md            # Full installation guide
└── package.json
```

---

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| Infinite Canvas | Pan, zoom, drag cards anywhere |
| Visual Links | 7 link types (depends_on, blocks, etc.) |
| Multiple Views | Canvas, Kanban, List |
| Offline First | 100% local, no internet needed |
| SQLite Database | Fast, reliable, exportable |
| Cross-Platform | Windows, Linux, macOS, Mobile |

---

## 📱 Mobile PWA Hosting

Host the `build/` folder on any of these (free):

| Service | Command |
|---------|---------|
| Vercel | `cd build && vercel` |
| Netlify | Drag `build/` folder to netlify.com |
| GitHub Pages | Push `build/` to gh-pages branch |

---

## 🆘 Need Help?

- Full guide: [INSTALL.md](INSTALL.md)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**Made for visual thinkers** ✨
