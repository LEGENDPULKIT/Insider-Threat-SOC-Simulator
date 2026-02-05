import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, UserPlus, ArrowRight } from 'lucide-react';
import { authService } from '../services/api';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '', role: 'employee' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isRegistering) {
        await authService.register(formData);
        setSuccess('Registration successful! Identity authorized.');
        setIsRegistering(false);
      } else {
        const res = await authService.login({
          username: formData.username,
          password: formData.password
        });
        localStorage.setItem('user', JSON.stringify(res.data));
        
        if (res.data.role === 'master') {
          navigate('/');
        } else {
          navigate(`/profile/${res.data.username}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Portal Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500">
        {/* Portal Header */}
        <div className="bg-[#86b059] p-8 text-center text-white">
          <div className="inline-flex p-3 bg-white/20 rounded-full mb-4">
            {isRegistering ? <UserPlus size={32} /> : <Shield size={32} />}
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">
            exabeam <span className="font-light opacity-80">{isRegistering ? 'Register' : 'Access'}</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-70">
            {isRegistering ? 'Provision New Security Identity' : 'Internal Security Gateway'}
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 flex items-center gap-3 text-red-700 text-[10px] font-black uppercase animate-shake">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-[#86b059] p-3 flex items-center gap-3 text-green-700 text-[10px] font-black uppercase">
              <Shield size={14} /> {success}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Assign Username"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#86b059] outline-none transition-all placeholder-gray-300"
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Secure Password"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#86b059] outline-none transition-all placeholder-gray-300"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {isRegistering && (
              <div className="pt-2 border-t border-gray-50 mt-4">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-2">Security Role Authorization</label>
                <select 
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded text-[11px] font-bold uppercase text-gray-600 outline-none cursor-pointer hover:bg-white transition-colors"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="employee">Standard Employee Profile</option>
                  <option value="master">Elevated Master Admin</option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#86b059] text-white font-black uppercase tracking-widest text-[11px] rounded-lg hover:bg-[#759a4d] shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isRegistering ? 'Authorize Creation' : 'Validate Access'} 
            <ArrowRight size={14} />
          </button>

          <div className="text-center mt-6">
            <button 
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }}
              className="text-[9px] font-black text-[#86b059] uppercase tracking-widest hover:text-[#759a4d] transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              {isRegistering ? 'Return to Security Login' : 'System Setup? Request New Identity'}
            </button>
          </div>
        </form>
        
        <div className="bg-gray-50/50 p-6 text-center border-t border-gray-100">
           <p className="text-[9px] text-gray-300 uppercase font-black leading-relaxed tracking-tighter">
            Legal Notice: Unauthorized access or identity fabrication <br /> is a direct violation of internal policy.
           </p>
        </div>
      </div>
    </div>
  );
}