import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Monitor, Lock, ShieldAlert, Users, UserMinus, HardDriveDownload, Globe } from 'lucide-react';

const BentoCard = ({ title, children, icon: Icon, extra, onExtraClick, highlight }) => (
  <div className={`bg-white border ${highlight ? 'border-red-500 shadow-lg shadow-red-100' : 'border-gray-200'} rounded shadow-sm transition-all duration-300 flex flex-col h-full overflow-hidden group`}>
    <div className={`px-3 py-2 border-b ${highlight ? 'bg-red-50' : 'bg-gray-50/50'} flex justify-between items-center group-hover:bg-gray-100/50 transition-colors`}>
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className={highlight ? 'text-red-500 animate-pulse' : 'text-gray-400'} />}
        <h2 className={`text-[11px] font-black uppercase tracking-widest ${highlight ? 'text-red-700' : 'text-slate-600'}`}>{title}</h2>
      </div>
      <span onClick={onExtraClick} className="text-[10px] text-blue-500 font-bold cursor-pointer hover:underline uppercase select-none z-10">{extra}</span>
    </div>
    <div className="p-3 flex-grow">{children}</div>
  </div>
);

const UserRow = ({ name, score, onClick, highlight }) => (
  <div onClick={onClick} className={`flex justify-between items-center p-2 ${highlight ? 'bg-red-50 animate-pulse' : 'hover:bg-blue-50'} cursor-pointer rounded transition-all`}>
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-white shadow-sm overflow-hidden">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="avatar" />
      </div>
      <span className={`text-[11px] font-bold ${highlight ? 'text-red-700' : 'text-slate-700'}`}>{name}</span>
    </div>
    <span className={`text-[11px] font-black ${highlight ? 'text-red-600' : 'text-orange-600'}`}>+{score}</span>
  </div>
);

export default function Home({ logs, agents, setTimeframe, isStarred, favoritedUsers }) {
  const navigate = useNavigate();

  // Notable Users logic already uses the 'logs' prop, which App.jsx now filters
  const notableUsers = Array.from(new Set(logs.map(l => l.username)))
    .map(u => logs.slice().reverse().find(l => l.username === u))
    .sort((a, b) => b.risk_score - a.risk_score);

  const blockedUsers = logs.filter(l => l.risk_score >= 180);

  return (
    <main className="max-w-[1600px] mx-auto p-4 space-y-4">
      {/* WATCHLIST NOTIFICATION BANNER */}
      {isStarred && (
        <div className="bg-yellow-50 border border-yellow-100 p-2 rounded text-[10px] font-black text-yellow-700 uppercase text-center animate-in fade-in slide-in-from-top-1 duration-300">
          ⚡ Watchlist Mode: Showing activity for {favoritedUsers?.length || 0} saved users
        </div>
      )}

      {/* ROW 1: INCIDENTS */}
      <div className="grid grid-cols-12 gap-4 h-[280px]">
        <div className="col-span-6">
          <BentoCard title="My Incidents" extra="Create Date" onExtraClick={() => setTimeframe('all')}>
            <div className="h-full flex items-center justify-center text-gray-400 text-xs italic">There are no incidents assigned to you.</div>
          </BentoCard>
        </div>
        <div className="col-span-6">
          <BentoCard 
            title={`Incidents in My Queues (${blockedUsers.length})`} 
            extra="Create Date" 
            onExtraClick={() => setTimeframe('all')}
            highlight={isStarred && blockedUsers.length > 0}
          >
            <div className="space-y-1 overflow-y-auto max-h-[220px] pr-2">
              {logs.filter(l => l.risk_score >= 100).slice(-5).reverse().map((log, i) => (
                <div key={i} onClick={() => navigate(`/profile/${log.username}`)} className="flex justify-between items-center p-2 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">{log.username} • {log.action}</span>
                  <span className="text-[11px] font-black text-red-500">+{log.risk_score}</span>
                </div>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>

      {/* ROW 2: NOTABLES */}
      <div className="grid grid-cols-4 gap-4">
        <BentoCard title="Notable Users" icon={User} extra="Last day" onExtraClick={() => setTimeframe('last_day')}>
          <div className="space-y-1">
            {notableUsers.slice(0, 5).map((u, i) => (
              <UserRow 
                key={i} 
                name={u.username} 
                score={u.risk_score} 
                onClick={() => navigate(`/profile/${u.username}`)} 
                highlight={isStarred && u.risk_score >= 180} 
              />
            ))}
          </div>
        </BentoCard>

        <BentoCard title="Notable Assets" icon={Monitor} extra="Last day" onExtraClick={() => setTimeframe('last_day')}>
          <div className="space-y-3">
            {Object.entries(agents).map(([host, status], i) => (
              <div key={i} className="flex justify-between items-center p-2 rounded bg-slate-50/50">
                <span className="text-[11px] font-bold text-slate-700 uppercase">{host}</span>
                <div className={`w-2 h-2 rounded-full ${status === 'ONLINE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              </div>
            ))}
          </div>
        </BentoCard>

        <BentoCard title="Account Lockouts" icon={Lock} extra="Last day" onExtraClick={() => setTimeframe('last_day')} highlight={isStarred && blockedUsers.length > 0}>
          <div className="space-y-2">
            {blockedUsers.slice(0, 2).map((u, i) => (
              <UserRow key={i} name={u.username} score={u.risk_score} />
            ))}
            {blockedUsers.length === 0 && <p className="text-[10px] text-gray-400 italic text-center py-10">No recent lockouts</p>}
          </div>
        </BentoCard>

        <BentoCard title="Service Accounts" extra="Last day" onExtraClick={() => setTimeframe('last_day')}>
          <div className="space-y-3 text-[11px] font-bold">
            <div className="flex justify-between"><span>svc_av_admin</span><span className="text-orange-500">145</span></div>
            <div className="flex justify-between"><span>svc_sp_admin</span><span className="text-orange-600">87</span></div>
            <div className="flex justify-between text-green-500"><span>svc_prod_1</span><span>0</span></div>
          </div>
        </BentoCard>
      </div>

      {/* ROW 3: DETECTIONS */}
      <div className="grid grid-cols-4 gap-4">
        <BentoCard title="Executive Users" icon={Users} extra="Last day" onExtraClick={() => setTimeframe('last_day')}>
          <div className="text-[10px] text-gray-400 italic">No unusual activity detected.</div>
        </BentoCard>

        <BentoCard title="Suspected Leavers" icon={UserMinus} extra="Last day" onExtraClick={() => setTimeframe('last_day')}>
          {logs.filter(l => l.action.includes('Delete')).slice(0, 2).map((l, i) => (
            <UserRow key={i} name={l.username} score={l.risk_score} onClick={() => navigate(`/profile/${l.username}`)} />
          ))}
        </BentoCard>

        <BentoCard title="Data Exfiltration" icon={HardDriveDownload} extra="Last day" onExtraClick={() => setTimeframe('last_day')} highlight={isStarred && logs.some(l => l.risk_score > 150)}>
          {logs.filter(l => l.risk_score > 150).slice(0, 1).map((l, i) => (
             <div key={i} className="text-[11px] font-bold text-red-600 p-2 border border-red-100 bg-red-50 rounded">⚠️ {l.username} (Bulk Modify)</div>
          ))}
        </BentoCard>

        <BentoCard title="First VPN from Geo" icon={Globe} extra="Last day" onExtraClick={() => setTimeframe('last_day')}>
          <div className="text-[10px] text-gray-400 italic">No anomalous logins.</div>
        </BentoCard>
      </div>
    </main>
  );
}