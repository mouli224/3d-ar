# 🌟 AR 3D Viewer - Frontend-Only Edition

A modern, mobile-friendly **Augmented Reality 3D Model Viewer** built with React, Three.js, and AR.js. This frontend-only version uses browser localStorage for model storage, making it perfect for quick deployment to platforms like Vercel.

## ✨ Features

- 📱 **Mobile-First Design** - Optimized for mobile browsers
- 📸 **Camera Integration** - Access device camera for AR experience
- 🎯 **AR Mode** - View 3D models in augmented reality
- 📤 **Model Upload** - Upload .glb/.gltf files (stored locally)
- 🎮 **Interactive Controls** - Rotate, zoom, and pan 3D models
- 🖼️ **Screenshot Capture** - Save AR scenes as images
- 💫 **Modern UI** - Animated interface with AR-themed colors
- 🔄 **Local Storage** - No backend required, everything stored in browser

## 🚀 Quick Start

### Development

```bash
# Clone the repository
git clone https://github.com/mouli224/3d-ar.git
cd 3d-ar

# Install dependencies
cd frontend
npm install

# Start development server
npm start
```

Visit `http://localhost:3000` to see the app.

### Production Deployment

The app is configured for easy deployment to Vercel:

```bash
# Deploy to Vercel
npx vercel

# Or connect your GitHub repo to Vercel for automatic deployments
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **3D Graphics**: Three.js + GLTFLoader
- **AR**: AR.js (WebRTC camera access)
- **UI**: Material-UI + Custom animations
- **Storage**: Browser localStorage (no backend needed)
- **Deployment**: Vercel-ready configuration

## 📱 Browser Support

- ✅ Chrome/Edge (Recommended)
- ✅ Safari (iOS/macOS)
- ✅ Firefox
- ⚠️ Camera access requires HTTPS in production

## 🎮 How to Use

1. **Home Page**: Overview and navigation
2. **Upload Models**: Add .glb/.gltf files (stored locally)
3. **AR View**: 
   - Allow camera permissions
   - Select a 3D model from the list
   - Use touch controls to manipulate the model:
     - 🤏 **Pinch** to zoom
     - 👆 **Drag** to rotate
     - 📸 **Camera button** to take screenshot

## 🔧 Local Storage

The app uses browser localStorage to store:
- 3D model metadata
- Model files (as base64)
- User preferences

**Note**: localStorage has size limits (~5-10MB). For larger models, consider implementing cloud storage.

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

The `vercel.json` configuration is already optimized for this project.

### Other Platforms

The app works on any static hosting service:
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Firebase Hosting

## 🔄 Architecture Changes

This version has been converted from a full-stack Django + React app to a frontend-only React app:

### What Changed:
- ❌ **Removed**: Django backend, PostgreSQL database, server APIs
- ✅ **Added**: Client-side localStorage service
- ✅ **Added**: Blob URL handling for 3D models
- ✅ **Simplified**: Single-command deployment

### Benefits:
- 🚀 **Faster deployment** - No server setup needed
- 💰 **Cost effective** - No backend hosting costs
- 🔒 **Privacy focused** - All data stays on user's device
- 📱 **Offline capable** - Works without internet after first load

## 🛡️ Privacy

- All data stored locally in your browser
- No external servers or data collection
- Models never leave your device

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ for the AR community**
