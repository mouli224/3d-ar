import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './components/HomePage';
import ARView from './components/ARView';
import ModelUpload from './components/ModelUpload';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e5ff', // Cyan blue
      light: '#64ffda',
      dark: '#00acc1',
    },
    secondary: {
      main: '#ff6ec7', // Pink/magenta
      light: '#ffb3ff',
      dark: '#c2185b',
    },
    background: {
      default: '#0a0a0a',
      paper: 'rgba(15, 15, 25, 0.9)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3e5fc',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
      background: 'linear-gradient(45deg, #00e5ff, #ff6ec7)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h4: {
      fontWeight: 600,
      color: '#00e5ff',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 25,
          textTransform: 'none',
          padding: '12px 24px',
          background: 'linear-gradient(45deg, #00e5ff, #ff6ec7)',
          '&:hover': {
            background: 'linear-gradient(45deg, #64ffda, #ffb3ff)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 229, 255, 0.3)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 15, 25, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 229, 255, 0.2)',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(45deg, #00e5ff, #ff6ec7)',
          '&:hover': {
            background: 'linear-gradient(45deg, #64ffda, #ffb3ff)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/upload" element={<ModelUpload />} />
            <Route path="/ar" element={<ARView />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
