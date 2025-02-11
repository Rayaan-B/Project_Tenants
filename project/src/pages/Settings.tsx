import React, { useEffect, useState } from 'react';
import { useStore } from '../lib/store';
import { Download, X } from 'lucide-react';

function Settings() {
  const { darkMode } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the default behavior
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstallable(false);
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  return (
    <div className={`p-6 h-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="max-w-2xl">
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Progressive Web App (PWA)</h2>
          
          {showInstallBanner && (
            <div className={`p-4 rounded-lg mb-4 ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Install Tenant Manager</h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Install Tenant Manager on your device for quick access and a better experience.
                    You'll get:
                  </p>
                  <ul className={`list-disc list-inside mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <li>Fast access from your home screen</li>
                    <li>Full-screen experience</li>
                    <li>Work offline</li>
                    <li>Regular updates</li>
                  </ul>
                </div>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className={`p-1 rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
              
              {isInstallable && (
                <button
                  onClick={handleInstall}
                  className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    darkMode
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  <Download size={20} />
                  <span>Install App</span>
                </button>
              )}
            </div>
          )}

          <div className={`p-4 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <h3 className="font-medium mb-2">About PWA</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Tenant Manager is a Progressive Web App (PWA) that provides a native app-like experience.
              You can install it on your device and access it offline.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
