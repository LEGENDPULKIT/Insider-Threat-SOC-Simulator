import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Monitor, Lock, ShieldAlert, Users, 
  UserMinus, HardDriveDownload, Globe, ClipboardList, ShieldCheck
} from 'lucide-react';
import axios from 'axios';

const BentoCard = ({ title, children, icon: Icon, extra }) => (
  <div className="bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group">
    <div className="px-3 py-2 border-b bg-gray-50/50 flex justify-between items-center group-hover:bg-gray-100/50 transition-colors">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-gray-400 group-hover:text-[#86b059] transition-colors" />}
        <h2 className="text-[11px] font-black uppercase text-slate-600 tracking-widest">{title}</h2>
      </div>
      <span className="text-[10px] text-blue-500 font-bold cursor-pointer hover:underline uppercase">{extra}</span>
    </div>
    <div className="p-3 flex-grow">{children}</div>
  </div>
);

const UserRow = ({ name, score, onClick, role }) => (
  <div onClick={onClick} className="flex justify-between items-center p-2 hover:bg-blue-50 cursor-pointer rounded transition-all group/row">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-white shadow-sm overflow-hidden">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" />
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-bold text-slate-700">{name}</span>
        {role && <span className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">{role}</span>}
      </div>
    </div>
    <span className="text-[11px] font-black text-orange-600">+{score}</span>
  </div>
);

export default function Home({ logs, agents }) {
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/view-audit").then(res => setAuditLogs(res.data));
  }, []);

  const notableUsers = Array.from(new Set(logs.map(l => l.username)))
    .map(u => logs.slice().reverse().find(l => l.username === u))
    .sort((a, b) => b.risk_score - a.risk_score);

  // Filter for Executive/Admin Users
  const execUsers = notableUsers.filter(u => 
    ["admin", "root", "system_user", "mmddf"].includes(u.username.toLowerCase())
  );

  return (
    <main className="max-w-[1600px] mx-auto p-4 space-y-4 animate-in fade-in duration-500">
      
      {/* ROW 1: INCIDENTS (Restored layout) */}
      <div className="grid grid-cols-12 gap-4 h-[280px]">
        <div className="col-span-12 lg:col-span-6">
          <BentoCard title="My Incidents" extra="Create Date">
             <div className="h-full flex items-center justify-center text-gray-300 text-xs italic uppercase font-black tracking-widest">No active assignments</div>
          </BentoCard>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <BentoCard title={`Incidents in My Queues (${logs.filter(l => l.risk_score >= 100).length})`} extra="Severity Feed">
            <div className="space-y-1 overflow-y-auto max-h-[220px] pr-2">
              {logs.slice(-5).reverse().map((log, i) => (
                <div key={i} onClick={() => navigate(`/profile/${log.username}`)} className="flex justify-between items-center p-2 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <div>
                    <p className="text-[11px] font-bold text-slate-700 uppercase">{log.action}</p>
                    <p className="text-[9px] text-gray-400">SOC-100{i} • {log.username}</p>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded text-white ${log.risk_score >= 180 ? 'bg-orange-500' : 'bg-slate-400'}`}>
                    {log.risk_score >= 180 ? 'HIGH' : 'MED'}
                  </span>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>

      {/* ROW 2: CORE MONITORING */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BentoCard title="Notable Users" icon={User} extra="Last day">
          <div className="space-y-1">
            {notableUsers.slice(0, 5).map((u, i) => (
              <UserRow key={i} name={u.username} score={u.risk_score} onClick={() => navigate(`/profile/${u.username}`)} />
            ))}
          </div>
        </BentoCard>

        <BentoCard title="Notable Assets" icon={Monitor} extra="Online Status">
          <div className="space-y-2">
            {Object.entries(agents).map(([host, status], i) => (
              <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-50">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">{host}</span>
                <div className={`w-2 h-2 rounded-full ${status === 'ONLINE' ? 'bg-green-500' : 'bg-red-500'}`} />
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard title="Account Lockouts" icon={Lock} extra="Last day">
           {notableUsers.filter(u => u.risk_score >= 180).map((u, i) => (
             <div key={i} className="flex justify-between items-center p-1">
               <span className="text-[11px] font-bold text-slate-700">{u.username}</span>
               <Lock size={12} className="text-red-500" />
             </div>
           ))}
           {notableUsers.filter(u => u.risk_score >= 180).length === 0 && <p className="text-[10px] text-gray-300 italic text-center py-4">Clear</p>}
        </BentoCard>

        <BentoCard title="Admin Audit Log" icon={ClipboardList} extra="System">
           <div className="space-y-2">
             {auditLogs.slice(0, 3).map((a, i) => (
               <div key={i} className="text-[9px] border-b pb-1">
                 <p className="font-black text-slate-600 uppercase">{a.action}</p>
                 <p className="text-gray-400">Target: {a.target}</p>
               </div>
             ))}
           </div>
        </BentoCard>
      </div>

      {/* ROW 3: SPECIALIZED GROUPS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <BentoCard title="Executive Users" icon={Users} extra="VIP Monitoring">
           <div className="space-y-1">
             {execUsers.length > 0 ? execUsers.map((u, i) => (
               <UserRow key={i} name={u.username} score={u.risk_score} role="VIP/ADMIN" onClick={() => navigate(`/profile/${u.username}`)} />
             )) : <p className="text-[10px] text-gray-300 italic text-center py-4">No VIP anomalies</p>}
           </div>
        </BentoCard>

        <BentoCard title="Suspected Leavers" icon={UserMinus} extra="Last day">
           {notableUsers.filter(u => u.risk_score > 100).slice(0, 2).map((u, i) => (
             <UserRow key={i} name={u.username} score={u.risk_score} onClick={() => navigate(`/profile/${u.username}`)} />
           ))}
        </BentoCard>

        <BentoCard title="Data Exfiltration" icon={HardDriveDownload} extra="Last day">
           {logs.filter(l => l.action.includes('Bulk') || l.risk_score > 150).slice(0, 2).map((l, i) => (
             <UserRow key={i} name={l.username} score={l.risk_score} onClick={() => navigate(`/profile/${l.username}`)} />
           ))}
        </BentoCard>

        {/* UPDATED: Service Accounts linked to Agent Heartbeats */}
        <BentoCard title="Service Accounts" icon={ShieldCheck} extra="Live Status">
           <div className="space-y-3">
            {['svc_av_admin', 'svc_sp_admin', 'svc_prod_1'].map((svc, i) => {
              // Interlink: Check if the service name is in the 'agents' online list
              const isLive = Object.keys(agents).some(host => host.toLowerCase().includes(svc.split('_')[1]));
              return (
                <div key={i} className="flex justify-between items-center text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                  <span>{svc}</span>
                  <span className={isLive ? "text-green-500" : "text-orange-500"}>
                    {isLive ? "ACTIVE" : "IDLE"}
                  </span>
                </div>
              );
            })}
          </div>
        </BentoCard>
      </div>
    </main>
  );
}