import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import Navbar from './components/Navbar';
import './App.css';

import { supabase } from './supabase';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await checkUser();
        await initAdmin();
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const checkUser = async () => {
    try {
      const savedUser = localStorage.getItem('technosoft_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Error parsing saved user:", e);
      localStorage.removeItem('technosoft_user');
    }
  };

  const initAdmin = async () => {
    try {
      const { data: admins, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', 'admin');

      if (!admins || admins.length === 0) {
        await supabase.from('users').insert([{
          username: 'admin',
          password: '123',
          role: 'admin',
          name: 'مدير النظام',
          active: true
        }]);
      }
    } catch (e) {
      console.warn("Could not auto-init admin, might already exist or DB is offline.");
    }
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('technosoft_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('technosoft_user');
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;

  return (
    <Router>
      <div className="app">
        {user && <Navbar user={user} logout={logout} />}
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login login={login} /> : <Navigate to={user.role === 'admin' ? '/admin' : (user.role === 'student' ? '/student' : '/login')} />}
          />
          <Route
            path="/student"
            element={user && user.role === 'student' ? <StudentDashboard user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
