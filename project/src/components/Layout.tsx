import React, { useRef, useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useStore } from '../lib/store';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CreditCard,
  LogOut,
  Menu,
  Sun,
  Moon,
  Settings,
  Download
} from 'lucide-react';

function Layout() {
  const { logout, darkMode, toggleDarkMode, user } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installError, setInstallError] = useState<string>('');

  const isLoginPage = location.pathname === '/login';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMobileMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      console.log('beforeinstallprompt captured in Layout');
      setDeferredPrompt(e);
      setIsInstallable(true);
      setInstallError('');
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);

    // Check if running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('Running as installed PWA');
      setInstallError('App is already installed');
    } else {
      console.log('Running in browser');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as EventListener);
    };
  }, []);

  useEffect(() => {
    // Apply dark mode class to HTML element
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setInstallError('Install prompt not available');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User choice: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstallable(false);
        setInstallError('');
      } else {
        setInstallError('Installation was declined');
      }
    } catch (err) {
      console.error('Install error:', err);
      setInstallError(`Install error: ${err.message}`);
    }

    setDeferredPrompt(null);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tenants', href: '/tenants', icon: Users },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Only show menu button and sidebar when user is logged in and not on login page */}
      {user && !isLoginPage && (
        <>
          {/* Floating Menu Button */}
          <button
            ref={menuButtonRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`fixed top-4 left-4 z-50 p-2 rounded-lg ${
              darkMode 
                ? 'text-white bg-gray-800 hover:bg-gray-700' 
                : 'text-gray-900 bg-white hover:bg-gray-100'
            } shadow-lg transition-colors`}
          >
            <Menu size={24} />
          </button>

          {/* Sidebar */}
          <div
            ref={sidebarRef}
            className={`fixed inset-y-0 left-0 transform ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            } w-64 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} transition-transform duration-300 ease-in-out z-40`}
          >
            <div className="h-full flex flex-col justify-between p-4">
              <div>
                <div className="flex items-center px-4 py-2 mb-4">
                  <span className={`text-lg font-medium flex-1 pl-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Tenant Manager
                  </span>
                  <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-white'
                    }`}
                  >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                </div>
                <nav className="space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? darkMode 
                            ? 'bg-gray-700 text-white' 
                            : 'bg-white text-gray-900'
                          : darkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon size={20} />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="space-y-1">
                <button
                  onClick={toggleDarkMode}
                  className={`flex w-full items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                
                {/* Debug info for PWA installation */}
                <div className="px-4 py-2 text-sm">
                  <p>Installable: {isInstallable ? 'Yes' : 'No'}</p>
                  {installError && <p className="text-red-500">{installError}</p>}
                </div>

                {isInstallable && (
                  <button
                    onClick={handleInstall}
                    className={`flex w-full items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    <Download size={20} />
                    <span>Install App</span>
                  </button>
                )}
                
                <button
                  onClick={logout}
                  className={`flex w-full items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className={`flex-1 overflow-y-auto ${user && !isLoginPage ? 'pt-16' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;