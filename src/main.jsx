// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import faviconPng from './assets/favicon.png';

// Enforce dynamic cache-busting for browser tab favicon
if (typeof document !== 'undefined') {
  try {
    const existingIcons = document.querySelectorAll("link[rel*='icon']");
    existingIcons.forEach((el) => el.remove());
    const link = document.createElement('link');
    link.type = 'image/png';
    link.rel = 'icon';
    link.href = faviconPng;
    document.head.appendChild(link);

    const shortcut = document.createElement('link');
    shortcut.type = 'image/png';
    shortcut.rel = 'shortcut icon';
    shortcut.href = faviconPng;
    document.head.appendChild(shortcut);
  } catch (e) {
    console.warn('Favicon injection notice:', e);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
