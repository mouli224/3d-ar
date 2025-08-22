# AR 3D Viewer

A modern web application that enables users to experience Augmented Reality with 3D models directly in their web browser. Built with React, Three.js, and Django, optimized for mobile devices.

## Features

- **3D Model Upload**: Support for GLB, GLTF, OBJ, and FBX formats
- **Augmented Reality**: View 3D models overlaid on real-world camera feed
- **Interactive Controls**: Rotate, zoom, and pan 3D models with touch gestures
- **Screenshot Capture**: Save AR experiences as images
- **Mobile Optimized**: Responsive design for mobile browsers
- **Real-time Camera**: Live camera feed with AR overlay

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Three.js** for 3D graphics
- **Material-UI** for responsive UI components
- **Axios** for API communication
- **React Router** for navigation

### Backend
- **Django 5.2** with Django REST Framework
- **SQLite** database for development
- **CORS headers** for cross-origin requests
- **Pillow** for image processing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Modern web browser with camera support
- Mobile device recommended for best AR experience

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd NewApp
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

## Usage Guide

### 1. Upload 3D Models
- Navigate to the upload page
- Select a 3D model file (GLB, GLTF, OBJ, FBX - max 10MB)
- Provide a name and optional description
- Click "Upload Model"

### 2. Enter AR Mode
- From the home page, click "Enter AR Mode"
- Select a previously uploaded 3D model
- Click "Start AR Experience"
- Allow camera permissions when prompted

### 3. AR Controls
- **Rotate**: Drag on screen to rotate the model
- **Zoom**: Use zoom in/out buttons
- **Reset**: Reset model rotation
- **Screenshot**: Capture the AR scene
- **Exit**: Return to main menu

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models/` | List all 3D models |
| POST | `/api/models/` | Upload new 3D model |
| GET | `/api/models/{id}/` | Get specific model |
| DELETE | `/api/models/{id}/` | Delete model |
| GET | `/api/health/` | Health check |

## Project Structure

```
NewApp/
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
│   │   │   ├── HomePage.tsx
│   │   │   ├── ModelUpload.tsx
│   │   │   └── ARView.tsx
│   │   ├── services/       # API services
│   │   └── App.tsx         # Main App component
│   └── package.json        # Node dependencies
└── .vscode/                # VS Code configuration
    └── tasks.json          # Build tasks
```

## Mobile Browser Support

### Tested Browsers
- **Chrome Mobile** (Android): Full support
- **Safari Mobile** (iOS): Full support
- **Firefox Mobile**: Partial support
- **Samsung Internet**: Full support

### Required Permissions
- Camera access for AR functionality
- Microphone access (automatically requested with camera)

## Development

### Adding New 3D Model Formats
1. Update `FileExtensionValidator` in `backend/models_api/models.py`
2. Add format to accepted list in `frontend/src/components/ModelUpload.tsx`
3. Ensure Three.js loader supports the format

### Customizing AR Experience
- Modify lighting in `ARView.tsx` `initThreeJS()` function
- Adjust model scaling and positioning in `loadModel()` function
- Add new touch gestures in `setupControls()` function

## Troubleshooting

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- [ ] Model preview thumbnails
- [ ] Multiple model placement in AR
- [ ] Cloud storage integration
- [ ] Social sharing features
- [ ] Advanced lighting controls
- [ ] Model animations support
- [ ] Collaborative AR sessions
