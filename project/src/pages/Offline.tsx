import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useStore } from '../lib/store';

function Offline() {
  const { darkMode } = useStore();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <WifiOff size={64} className={darkMode ? 'text-purple-400' : 'text-purple-600'} />
        </div>
        <h1 className="text-2xl font-bold mb-4">You're Offline</h1>
        <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          The app is currently offline. Some features may be limited.
        </p>
        <div className="space-y-4">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            You can still:
          </p>
          <ul className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
            <li>• View cached tenant information</li>
            <li>• Check previously loaded payment records</li>
            <li>• Access saved property details</li>
          </ul>
          <button
            onClick={handleRefresh}
            className={`mt-8 inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              darkMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            <RefreshCw size={20} className="mr-2" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Offline;
