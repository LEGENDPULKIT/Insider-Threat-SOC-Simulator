import React, { useState, useEffect } from 'react';
import { FileText, Lock, ShieldAlert, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function EmployeeAccess() {
  const [files, setFiles] = useState([]);
  const [fileContent, setFileContent] = useState(null);
  const [error, setError] = useState('');
  const [activeFile, setActiveFile] = useState('');
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  // FETCH DYNAMIC FILE LIST
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/list-files");
      setFiles(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to sync with local folder", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const accessFile = async (filename) => {
    setError('');
    setFileContent(null);
    setActiveFile(filename);

    try {
      const res = await axios.get(`http://127.0.0.1:8000/fetch-file/${filename}`, {
        params: { username: user.username }
      });
      // Note: FileResponse might return a stream; for demo content we treat as text
      setFileContent("File downloaded successfully. Accessing contents...");
    } catch (err) {
      setError(err.response?.data?.detail || "Access Denied");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-6 animate-in fade-in duration-500">
      <div className="bg-white border rounded-xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black uppercase text-slate-800 tracking-tighter flex items-center gap-2">
            <Lock size={20} className="text-[#86b059]" /> Internal File Server
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">SENSITIVE_DATA Synchronized</p>
        </div>
        <button onClick={fetchFiles} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-500 p-4 rounded-xl flex items-center gap-4 animate-shake">
          <ShieldAlert className="text-red-600" size={28} />
          <div>
            <p className="text-red-700 font-black uppercase text-xs">Security Violation / Account Suspended</p>
            <p className="text-red-500 text-[10px] font-bold mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {files.length > 0 ? files.map((file) => (
          <div 
            key={file.name}
            onClick={() => accessFile(file.name)}
            className={`group cursor-pointer p-4 rounded-xl border-2 transition-all hover:shadow-md active:scale-95 ${
              activeFile === file.name ? 'border-[#86b059] bg-green-50' : 'border-gray-100 bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 rounded-lg ${file.risk === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                <FileText size={20} />
              </div>
              {file.risk === 'High' && <AlertCircle size={14} className="text-red-300" />}
            </div>
            <p className="text-[11px] font-black text-slate-700 truncate">{file.name}</p>
            <p className={`text-[9px] font-bold uppercase mt-1 ${file.risk === 'High' ? 'text-red-400' : 'text-slate-300'}`}>
              {file.type} Access
            </p>
          </div>
        )) : (
            <div className="col-span-3 py-10 text-center text-slate-300 font-black uppercase text-xs">
                No files found in SENSITIVE_DATA folder.
            </div>
        )}
      </div>
    </div>
  );
}