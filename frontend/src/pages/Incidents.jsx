import React from 'react';
import { ShieldAlert, Clock, User, HardDrive, AlertTriangle } from 'lucide-react';

export default function Incidents({ logs }) {
  // Severity logic based on risk_score from main.py
  const getSeverity = (score) => {
    if (score >= 180) return { label: "CRITICAL", color: "bg-red-600", text: "text-red-600" };
    if (score >= 100) return { label: "HIGH", color: "bg-orange-500", text: "text-orange-500" };
    if (score >= 50) return { label: "MEDIUM", color: "bg-yellow-500", text: "text-yellow-600" };
    return { label: "LOW", color: "bg-blue-500", text: "text-blue-600" };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b pb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
            <ShieldAlert className="text-[#86b059] w-8 h-8" /> 
            Incident Response Queue
          </h2>
          <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-1">
            Real-time SIEM Log Analysis • {logs.length} Total Events
          </p>
        </div>
        <div className="flex gap-2">
          <span className="bg-red-50 text-red-600 px-3 py-1 rounded text-[10px] font-black border border-red-100">
            {logs.filter(l => l.risk_score >= 180).length} CRITICAL INCIDENTS
          </span>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <th className="p-5 border-b">Priority</th>
              <th className="p-5 border-b">Incident ID</th>
              <th className="p-5 border-b">Subject</th>
              <th className="p-5 border-b">Activity Details</th>
              <th className="p-5 border-b">Risk Score</th>
              <th className="p-5 border-b">Detected At</th>
            </tr>
          </thead>
          <tbody className="text-[11px] text-slate-700 font-medium">
            {logs.slice().reverse().map((log, i) => {
              const severity = getSeverity(log.risk_score);
              return (
                <tr key={i} className="hover:bg-slate-50/50 border-b border-gray-50 transition-colors group">
                  <td className="p-5">
                    <span className={`${severity.color} text-white px-2 py-0.5 rounded-sm font-black text-[9px] shadow-sm`}>
                      {severity.label}
                    </span>
                  </td>
                  <td className="p-5 font-mono text-gray-400 group-hover:text-blue-500 transition-colors">
                    #INC-{log.id ? log.id.slice(-6).toUpperCase() : `100${i}`}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 overflow-hidden border border-white shadow-sm">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.username}`} alt="u" />
                      </div>
                      <span className="font-bold text-slate-800 uppercase">{log.username}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="space-y-0.5">
                      <div className="font-black text-slate-700 uppercase tracking-tight">{log.action}</div>
                      <div className="text-[9px] text-gray-400 font-mono italic flex items-center gap-1">
                        <HardDrive size={10} /> {log.resource || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="p-5 font-black text-[13px] text-orange-600">
                    +{log.risk_score}
                  </td>
                  <td className="p-5 text-gray-400 font-bold uppercase flex items-center gap-1.5 pt-7">
                    <Clock size={12} className="opacity-50" />
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'LIVE'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
            <AlertTriangle className="text-gray-200 w-12 h-12" />
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest italic">
              Awaiting data from agents...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}