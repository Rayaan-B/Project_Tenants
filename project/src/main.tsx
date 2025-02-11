import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  console.log('Service Worker is supported');
  
  // Wait for window load
  window.addEventListener('load', async () => {
    try {
      console.log('Attempting to register service worker...');
      
      // Unregister any existing service workers first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        await registration.unregister();
      }
      
      // Register new service worker
      const registration = await navigator.serviceWorker.register('/Project_Tenants/service-worker.js', {
        scope: '/Project_Tenants/'
      });
      
      console.log('ServiceWorker registration successful:', registration);
      
      // Listen for the beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('beforeinstallprompt event fired');
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
      });
      
    } catch (err) {
      console.error('ServiceWorker registration failed: ', err);
    }
  });
} else {
  console.log('Service workers are not supported');
}
