import React, { useRef, useEffect } from 'react';
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
  Moon
} from 'lucide-react';

function Layout() {
  const { logout, darkMode, toggleDarkMode } = useStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

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

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Tenants', href: '/tenants', icon: Users },
    { name: 'Properties', href: '/properties', icon: Building2 },
    { name: 'Payments', href: '/payments', icon: CreditCard },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      {/* Mobile menu button - Fixed position */}
      <button
        ref={menuButtonRef}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 bg-gray-900' : 'hover:bg-gray-100 bg-white'} shadow-md`}
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 sm:gap-4">
          {/* Sidebar for desktop */}
          <div className={`hidden md:flex flex-col gap-1 w-64 p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-xl">Dashboard</h2>
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
            
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? darkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-blue-50 text-blue-600'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}

            <button
              onClick={() => logout()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>

          {/* Sidebar for mobile */}
          {isMobileMenuOpen && (
            <div
              ref={sidebarRef}
              className={`fixed top-0 left-0 z-40 h-full w-64 p-4 ${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } shadow-lg md:hidden flex flex-col`}
            >
              <div className="flex items-center justify-between mb-6 pl-10">
                <h2 className="font-semibold text-xl">Dashboard</h2>
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>

              <div className="flex-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                      isActive(item.href)
                        ? darkMode
                          ? 'bg-gray-700 text-white'
                          : 'bg-blue-50 text-blue-600'
                        : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </div>

              <button
                onClick={() => logout()}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-4 ${
                  darkMode
                    ? 'text-gray-300 hover:bg-gray-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1">
            <main className="py-6 px-4 sm:px-6 lg:px-8 md:mt-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Layout;