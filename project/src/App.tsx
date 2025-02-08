import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Tenants from './pages/Tenants';
import Payments from './pages/Payments';
import Properties from './pages/Properties';
import Login from './pages/Login';
import { useStore } from './lib/store';
import { supabase } from './lib/supabase';

function App() {
  const { user, setUser, darkMode } = useStore();

  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile);
        }
      }
    };

    checkSession();
  }, [setUser]);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="/tenants" element={user ? <Tenants /> : <Navigate to="/login" replace />} />
          <Route path="/payments" element={user ? <Payments /> : <Navigate to="/login" replace />} />
          <Route path="/properties" element={user ? <Properties /> : <Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;