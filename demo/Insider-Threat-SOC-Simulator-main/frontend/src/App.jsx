import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, FileText, Shield } from 'lucide-react';
import Home from './pages/Homes';
import Incidents from './pages/Incidents';
import Metrics from './pages/Metrics';
import Playbooks from './pages/Playbooks';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login'; 
import EmployeeAccess from './pages/EmployeeAccess'; // New Import
import { threatService } from './services/api';

// --- SAFE AUTH GUARD ---
const ProtectedRoute = ({ children, roleRequired }) => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return <Navigate to="/login" />;
  
  try {
    const user = JSON.parse(userStr);
    if (roleRequired && user?.role !== roleRequired) {
      // If employee tries to access master pages, redirect to their profile or access portal
      return <Navigate to={`/profile/${user?.username || 'unknown'}`} />;
    }
    return children;
  } catch (e) {
    localStorage.removeItem('user');
    return <Navigate to="/login" />;
  }
};

const Nav = ({ logs }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const userStr = localStorage.getItem('user');
  
  let user = null;
  try { user = userStr ? JSON.parse(userStr) : null; } catch(e) {}

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // If no user, don't show any nav
  if (!user) return null;

  return (
    <nav className="bg-[#86b059] text-white px-6 py-2 flex justify-between items-center shadow-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link to="/" className="font-bold italic text-lg tracking-tighter flex items-center gap-2">
          <Shield size={18} />
          exabeam <span className="font-normal opacity-80 text-sm uppercase ml-1 tracking-widest">Analytics</span>
        </Link>
        
        {/* Navigation for MASTER users */}
        {user.role === 'master' && (
          <div className="hidden md:flex gap-6 text-[11px] font-black ml-10 tracking-widest uppercase">
            <Link to="/" className={`pb-1 ${location.pathname === '/' ? 'border-b-2' : 'opacity-70'}`}>HOME</Link>
            <Link to="/incidents" className={`pb-1 ${location.pathname === '/incidents' ? 'border-b-2' : 'opacity-70'}`}>INCIDENTS</Link>
            <Link to="/metrics" className={`pb-1 ${location.pathname === '/metrics' ? 'border-b-2' : 'opacity-70'}`}>METRICS</Link>
            <Link to="/playbooks" className={`pb-1 ${location.pathname === '/playbooks' ? 'border-b-2' : 'opacity-70'}`}>PLAYBOOKS</Link>
          </div>
        )}

        {/* Navigation for EMPLOYEE users - The Access Gateway */}
        {user.role === 'employee' && (
          <div className="hidden md:flex gap-6 text-[11px] font-black ml-10 tracking-widest uppercase">
            <Link to="/access" className={`pb-1 flex items-center gap-2 ${location.pathname === '/access' ? 'border-b-2' : 'opacity-70'}`}>
              <FileText size={14} /> SECURE DATA ACCESS
            </Link>
            <Link to={`/profile/${user.username}`} className={`pb-1 ${location.pathname.includes('/profile') ? 'border-b-2' : 'opacity-70'}`}>MY RISK PROFILE</Link>
          </div>
        )}
      </div>

      <div className="flex items-center gap-5">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60 border-r pr-5 border-white/20">
          ID: {user.username} ({user.role})
        </span>
        <button onClick={handleLogout} className="hover:text-red-200 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase">
            Logout <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default function App() {
  const [logs, setLogs] = useState([]);
  const [agents, setAgents] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, agentsRes] = await Promise.all([
          threatService.getLogs().catch(() => ({ data: [] })),
          threatService.getAgentStatus().catch(() => ({ data: {} }))
        ]);
        setLogs(logsRes?.data || []);
        setAgents(agentsRes?.data || {});
      } catch (err) {
        console.error("SIEM Connection Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f4f7f6]">
      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-mono animate-pulse">
        Initializing Security Core...
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f4f7f6]">
        <Nav logs={logs} />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Master Protected Routes */}
          <Route path="/" element={<ProtectedRoute roleRequired="master"><Home logs={logs} agents={agents} /></ProtectedRoute>} />
          <Route path="/incidents" element={<ProtectedRoute roleRequired="master"><Incidents logs={logs} /></ProtectedRoute>} />
          <Route path="/metrics" element={<ProtectedRoute roleRequired="master"><Metrics logs={logs} agents={agents} /></ProtectedRoute>} />
          <Route path="/playbooks" element={<ProtectedRoute roleRequired="master"><Playbooks /></ProtectedRoute>} />
          
          {/* General Protected Routes */}
          <Route path="/profile/:username" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          
          {/* Employee Specific Access Portal */}
          <Route path="/access" element={<ProtectedRoute roleRequired="employee"><EmployeeAccess /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}