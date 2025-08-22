# AR 3D Viewer

A modern web application that enables users to experience Augmented Reality with 3D models directly in their web browser. Built with React, Three.js, and Django, optimized for mobile devices.

## 🚀 Features

- **🎨 Modern UI**: Futuristic gradients with cyan/magenta theme and smooth animations
- **📱 Mobile Optimized**: Perfect touch controls and responsive design for mobile AR
- **🎮 3D Model Upload**: Support for GLB, GLTF, OBJ, and FBX formats (max 10MB)
- **👁️ Augmented Reality**: Live camera feed with 3D models overlaid in real-world
- **🎯 Interactive Controls**: Intuitive touch gestures for rotate, zoom, and pan
- **📸 Screenshot Capture**: Save your AR experiences as images
- **⚡ Real-time Rendering**: Smooth 3D performance with Three.js

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Three.js** for 3D graphics and WebGL rendering
- **Material-UI** with custom AR-themed styling
- **Axios** for API communication
- **React Router** for navigation

### Backend
- **Django 5.2** with Django REST Framework
- **SQLite** database for development
- **CORS headers** for cross-origin requests
- **Pillow** for image processing

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Modern web browser with camera support
- Mobile device recommended for best AR experience

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mouli224/3d-ar.git
   cd 3d-ar
   ```

2. **Backend Setup**
   ```powershell
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```powershell
   cd frontend
   npm install
   npm start
   ```

### Running the Application

#### Option 1: Using VS Code Tasks (Recommended)
- Open the project in VS Code
- Press `Ctrl+Shift+P` and search for "Tasks: Run Task"
- Select "Start Full Stack" to run both frontend and backend

#### Option 2: Manual Start
- **Backend**: `cd backend && python manage.py runserver`
- **Frontend**: `cd frontend && npm start`

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

## 📱 Usage Guide

### 1. Upload 3D Models
- Navigate to the upload page with modern gradient UI
- Select a 3D model file (GLB, GLTF, OBJ, FBX - max 10MB)
- Provide a name and optional description
- Click "Upload Model" with animated button

### 2. Enter AR Mode
- From the home page, click "Enter AR Mode"
- Select a previously uploaded 3D model from the modern dialog
- Click "Start AR Experience" 
- Allow camera permissions when prompted

### 3. AR Controls
- **Rotate**: Drag on screen to rotate the model with smooth touch controls
- **Zoom**: Use stylized zoom in/out floating buttons
- **Reset**: Reset model rotation with animated controls
- **Screenshot**: Capture the AR scene with modern camera button
- **Exit**: Return to main menu with gradient exit button

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models/` | List all 3D models |
| POST | `/api/models/` | Upload new 3D model |
| GET | `/api/models/{id}/` | Get specific model |
| DELETE | `/api/models/{id}/` | Delete model |
| GET | `/api/health/` | Health check |

## 📁 Project Structure

```
3d-ar/
├── backend/                 # Django backend
│   ├── ar_backend/         # Main Django project
│   ├── models_api/         # 3D models API app
│   ├── media/              # Uploaded files
│   ├── static/             # Static files
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── public/             # Public assets
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── HomePage.tsx    # Modern landing page
│   │   │   ├── ModelUpload.tsx # Upload with animations
│   │   │   └── ARView.tsx      # AR experience
│   │   ├── services/       # API services
│   │   └── App.tsx         # Main App with theming
│   └── package.json        # Node dependencies
└── .vscode/                # VS Code configuration
    └── tasks.json          # Build tasks
```

## 📱 Mobile Browser Support

### Tested Browsers
- **Chrome Mobile** (Android): Full support ✅
- **Safari Mobile** (iOS): Full support ✅  
- **Firefox Mobile**: Partial support ⚠️
- **Samsung Internet**: Full support ✅

### Required Permissions
- Camera access for AR functionality
- Microphone access (automatically requested with camera)

## 🎨 UI/UX Features

### Modern Design
- **Futuristic Color Scheme**: Cyan blue (#00e5ff) and magenta pink (#ff6ec7)
- **Gradient Backgrounds**: Dynamic gradients with animated particles
- **Smooth Animations**: Fade, slide, scale, and pulse effects
- **Glass Morphism**: Backdrop blur effects and translucent cards
- **Neon Accents**: Glowing text and border effects

### Animations
- **Loading States**: Elegant progress indicators and spinners
- **Hover Effects**: Interactive button and card transformations
- **Transition Effects**: Smooth page and component transitions
- **AR Status**: Real-time AR active indicator with pulse animation

## 🔧 Development

### Adding New 3D Model Formats
1. Update `FileExtensionValidator` in `backend/models_api/models.py`
2. Add format to accepted list in `frontend/src/components/ModelUpload.tsx`
3. Ensure Three.js loader supports the format

### Customizing AR Experience
- Modify lighting in `ARView.tsx` `initThreeJS()` function
- Adjust model scaling and positioning in `loadModel()` function
- Add new touch gestures in `setupControls()` function

## 🐛 Troubleshooting

### Camera Not Working
- Ensure HTTPS connection (required for camera access)
- Check browser permissions
- Verify camera is not being used by another application

### Models Not Loading
- Check file format compatibility
- Verify file size (max 10MB)
- Ensure backend server is running
- Check CORS configuration

### Performance Issues
- Reduce model complexity/file size
- Check device specifications
- Ensure good lighting conditions for AR tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚀 Future Enhancements

- [ ] Model preview thumbnails
- [ ] Multiple model placement in AR
- [ ] Cloud storage integration
- [ ] Social sharing features
- [ ] Advanced lighting controls
- [ ] Model animations support
- [ ] Collaborative AR sessions
- [ ] Hand gesture recognition
- [ ] Voice commands for AR controls
