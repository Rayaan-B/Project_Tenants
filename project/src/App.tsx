import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import Payments from './pages/Payments';
import Properties from './pages/Properties';
import Settings from './pages/Settings';
import Offline from './pages/Offline';
import Login from './pages/Login';
import { useStore } from './lib/store';
import { supabase } from './lib/supabase';
import { Profile } from './lib/types';
import { NetworkProvider, useNetwork } from './contexts/NetworkStatus';

// Configure future flags
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function AppRoutes() {
  const { user, setUser } = useStore();
  const { isOnline } = useNetwork();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const profile: Profile = {
          id: session.user.id,
          email: session.user.email ?? '',
          role: 'admin',
          full_name: null,
          phone: null,
          created_at: session.user.created_at,
          updated_at: new Date().toISOString()
        };
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const profile: Profile = {
          id: session.user.id,
          email: session.user.email ?? '',
          role: 'admin',
          full_name: null,
          phone: null,
          created_at: session.user.created_at,
          updated_at: new Date().toISOString()
        };
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="tenants" element={user ? <Tenants /> : <Navigate to="/login" replace />} />
        <Route path="payments" element={user ? <Payments /> : <Navigate to="/login" replace />} />
        <Route path="properties" element={user ? <Properties /> : <Navigate to="/login" replace />} />
        <Route path="settings" element={user ? <Settings /> : <Navigate to="/login" replace />} />
        <Route path="offline" element={<Offline />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <NetworkProvider>
      <Router {...routerOptions}>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </NetworkProvider>
  );
}

export default App;