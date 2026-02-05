import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Monitor, MapPin, Clock, Calendar, Activity, ShieldAlert } from 'lucide-react';

export default function UserProfile() {
  const { username } = useParams();
  const [logs, setLogs] = useState([]);
  const navigate = useNavigate();
  
  // Get current user to determine where "Back" should go
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const fetchData = () => {
      axios.get("http://127.0.0.1:8000/view-logs").then(res => {
        setLogs(res.data.filter(l => l.username === username));
      });
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [username]);

  const latest = logs[0] || {};
  const isSuspended = (latest.risk_score || 0) >= 180;

  // FIXED: Role-based back navigation
  const handleBackNavigation = () => {
    if (currentUser?.role === 'master') {
      navigate('/'); // Master goes to SIEM Home
    } else {
      navigate('/access'); // Employee goes back to File Access
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        {/* Updated Functional Button */}
        <button 
          onClick={handleBackNavigation} 
          className="text-blue-500 font-black uppercase text-[11px] flex items-center gap-2 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        {isSuspended && (
          <div className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 animate-pulse">
            <ShieldAlert size={14} /> Account Blocked for Nonsense
          </div>
        )}
      </div>

      <div className={`bg-white border p-8 rounded-xl flex justify-between items-center shadow-sm ${isSuspended ? 'border-red-500 shadow-red-50' : ''}`}>
        <div className="flex gap-6 items-center">
          <div className={`w-20 h-20 rounded-full overflow-hidden border-2 transition-all ${isSuspended ? 'grayscale border-red-200' : 'border-[#86b059]'}`}>
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt="avatar" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase text-slate-800 tracking-tighter">{username}</h1>
            <div className="flex gap-4 mt-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Monitor size={12} /> PC: {latest.hostname || "Detecting..."}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <MapPin size={12} /> IP: {latest.ip_address || "Determining..."}
              </span>
            </div>
          </div>
        </div>
        <div className={`text-center px-8 py-4 rounded-xl shadow-lg text-white transition-colors ${isSuspended ? 'bg-red-600 shadow-red-100' : 'bg-[#86b059] shadow-green-50'}`}>
          <p className="text-[9px] font-black uppercase opacity-70">Forensic Risk Score</p>
          <p className="text-4xl font-black italic">{latest.risk_score || 0}</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
          <h2 className="text-[11px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
            <Activity size={14} /> Behavioral Evidence Audit
          </h2>
          <span className="text-[9px] font-bold text-slate-300 uppercase">Live Telemetry Linked</span>
        </div>
        <div className="p-4 space-y-3">
          {logs.map((log, i) => (
            <div key={i} className="flex justify-between items-center p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-[12px] font-bold text-slate-700 uppercase leading-none">{log.action}</p>
                <p className="text-[9px] text-slate-400 font-medium flex items-center gap-1 mt-2 uppercase tracking-tighter">
                  <Calendar size={10} /> {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className={`text-[13px] font-black ${log.risk_score >= 100 ? 'text-red-600' : 'text-orange-600'}`}>+{log.risk_score}</span>
                <p className="text-[8px] font-black text-gray-300 uppercase mt-1">Severity</p>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="text-center py-10 text-xs text-gray-300 italic font-black uppercase">No behavior recorded</p>}
        </div>
      </div>
    </div>
  );
}