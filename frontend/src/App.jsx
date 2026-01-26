import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from './api';
import ThreeScene from './components/ThreeScene';
import AuthCard from './components/AuthCard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './styles/auth.css';

// Auth Context
export const AuthContext = createContext();
const useAuth = () => useContext(AuthContext);

// Auth Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, [token]);

  const login = async (email, password, role) => {
    const { token, user } = await api.login(email, password, role);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const register = async (name, email, password, role) => {
    const { token, user } = await api.register(name, email, password, role);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Confetti Animation Component
function ConfettiAnimation() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <div className="text-9xl">🎉</div>
    </motion.div>
  );
}

// Animated Background
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-1/2 -left-1/2 w-full h-full bg-teal-500/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [90, 0, 90],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-cyan-500/10 rounded-full blur-3xl"
      />
    </div>
  );
}
// 3D Floating Elements Background
function FloatingElements() {
  const elements = [
    { icon: '📚', delay: 0, duration: 15 },
    { icon: '💻', delay: 2, duration: 18 },
    { icon: '🎓', delay: 4, duration: 20 },
    { icon: '⚽', delay: 1, duration: 17 },
    { icon: '📱', delay: 3, duration: 16 },
    { icon: '🎮', delay: 5, duration: 19 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
      {elements.map((el, idx) => (
        <motion.div
          key={idx}
          className="absolute text-6xl opacity-20"
          initial={{ 
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
            y: -100,
            rotate: 0,
            scale: 0.5
          }}
          animate={{
            y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 100,
            rotate: 360,
            scale: [0.5, 1, 0.5],
            x: [
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000)
            ]
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {el.icon}
        </motion.div>
      ))}
    </div>
  );
}

// Animated Earth Background
function AnimatedEarth() {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let rotation = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.35;

      const gradient = ctx.createRadialGradient(
        centerX - radius * 0.3, 
        centerY - radius * 0.3, 
        radius * 0.1,
        centerX, 
        centerY, 
        radius
      );
      gradient.addColorStop(0, 'rgba(100, 200, 255, 0.6)');
      gradient.addColorStop(0.5, 'rgba(20, 184, 166, 0.4)');
      gradient.addColorStop(1, 'rgba(15, 23, 42, 0.2)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)';
      ctx.lineWidth = 3;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI / 4) + rotation;
        ctx.beginPath();
        ctx.ellipse(
          centerX, 
          centerY, 
          radius * Math.abs(Math.cos(angle)), 
          radius, 
          0, 
          0, 
          Math.PI * 2
        );
        ctx.stroke();
      }

      for (let i = 1; i < 5; i++) {
        const y = centerY + (radius * 0.4 * (i - 2.5) / 2);
        const width = Math.sqrt(radius * radius - Math.pow(y - centerY, 2));
        
        ctx.beginPath();
        ctx.ellipse(centerX, y, width, width * 0.15, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.3)';
      ctx.lineWidth = 30;
      ctx.stroke();

      rotation += 0.003;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 opacity-60"
      style={{ pointerEvents: 'none', zIndex: 0 }}
    />
  );
}


// Navbar Component for the website to look professional
function Navbar({ onNavigate }) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Side - Profile */}
          <div className="flex items-center space-x-4">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-cyan-500/50 transition-all ring-2 ring-white/20"
              >
                {user?.name?.charAt(0)}
              </button>
              
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute left-0 top-14 w-64 rounded-xl bg-slate-800/95 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden z-50"
                >
                  <div className="p-4 bg-gradient-to-r from-teal-500/20 to-cyan-600/20 border-b border-white/10">
                    <div className="font-semibold text-white">{user?.name}</div>
                    <div className="text-sm text-slate-300">{user?.email}</div>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-400 text-sm">{'★'.repeat(Math.floor(user?.trustScore || 0))}</span>
                      <span className="text-xs text-slate-400 ml-2">{user?.trustScore} Trust Score</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-slate-300 hover:bg-white/10 transition-colors flex items-center space-x-2"
                  >
                    <span>👤</span>
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={logout}
                    className="w-full px-4 py-3 text-left text-red-300 hover:bg-red-500/10 transition-colors flex items-center space-x-2 border-t border-white/10"
                  >
                    <span>🚪</span>
                    <span>Logout</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
            
            <div>
              <div className="text-sm font-semibold text-white">{user?.name}</div>
              <div className="text-xs text-slate-400">Student</div>
            </div>
          </div>

          {/* Center - Logo */}
          <div 
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <motion.div 
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎓
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Campus Portal
            </span>
          </div>

          {/* Right Side - Quick Actions */}
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('messages')}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">💬</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('requests')}
              className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-2xl">🔔</span>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Login Page
function LoginPage({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <ThreeScene />
      <AuthCard>
        {isLogin ? (
          <Login 
            onSuccess={onSuccess} 
            onSwitchToSignup={() => setIsLogin(false)}
          />
        ) : (
          <Signup 
            onSuccess={onSuccess} 
            onSwitchToLogin={() => setIsLogin(true)}
          />
        )}
      </AuthCard>
    </>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 cursor-pointer transition-all shadow-lg hover:shadow-cyan-500/20"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-cyan-400 mb-2">{title}</h3>
      <p className="text-slate-300">{description}</p>
    </motion.div>
  );
}

// Home Dashboard
// Home Dashboard with 3D Motion Graphics
function HomePage({ onNavigate }) {
  const features = [
    { icon: '🔍', title: 'Browse Items', description: 'Find resources to borrow', route: 'browse' },
    { icon: '➕', title: 'List Item', description: 'Share your resources', route: 'list' },
    { icon: '📝', title: 'My Listings', description: 'Manage your items', route: 'mylistings' },
    { icon: '📋', title: 'Requests', description: 'View borrow requests', route: 'requests' },
    { icon: '💬', title: 'Messages', description: 'Chat with users', route: 'messages' },
    { icon: '👤', title: 'Profile', description: 'Edit your profile', route: 'profile' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4" style={{ position: 'relative', zIndex: 2 }}>
      <FloatingElements />
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-6xl font-bold text-white mb-4"
            animate={{ 
              textShadow: [
                "0 0 20px rgba(20, 184, 166, 0.5)",
                "0 0 40px rgba(20, 184, 166, 0.8)",
                "0 0 20px rgba(20, 184, 166, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Welcome Back!
          </motion.h1>
          <motion.p 
            className="text-2xl text-slate-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Do You Want To Share or Borrow Today?
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <FeatureCard 
              key={feature.route} 
              {...feature} 
              index={idx}
              onClick={() => onNavigate(feature.route)} 
            />
          ))}
        </div>

        {/* Floating stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="backdrop-blur-md bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <motion.div 
              className="text-4xl font-bold text-cyan-400"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              250+
            </motion.div>
            <div className="text-slate-300 mt-2">Active Items</div>
          </div>
          <div className="backdrop-blur-md bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <motion.div 
              className="text-4xl font-bold text-teal-400"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              500+
            </motion.div>
            <div className="text-slate-300 mt-2">Happy Users</div>
          </div>
          <div className="backdrop-blur-md bg-white/5 rounded-xl p-6 border border-white/10 text-center">
            <motion.div 
              className="text-4xl font-bold text-cyan-300"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              1000+
            </motion.div>
            <div className="text-slate-300 mt-2">Successful Shares</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Browse Items Page
function BrowseItems({ onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getItems().then((data) => {
      setItems(data);
      setLoading(false);
    }).catch(err => {
      console.error('Error loading items:', err);
      setLoading(false);
    });
  }, []);

  const handleBorrow = async (itemId) => {
    if (confirm('Send borrow request for this item?')) {
      try {
        await api.createRequest(itemId);
        alert('Request sent successfully!');
        onNavigate('requests');
      } catch (err) {
        alert('Failed to send request: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Browse Available Items
        </motion.h1>

        {loading ? (
          <div className="text-center text-slate-300">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-cyan-300">{item.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs ${item.available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-slate-300 text-sm mb-2">Category: {item.category}</p>
                <p className="text-slate-400 text-sm mb-2">Owner: {item.owner}</p>
                <p className="text-slate-400 text-sm mb-4">Location: {item.location}</p>
                {item.available && (
                  <button
                    onClick={() => handleBorrow(item.id)}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    Borrow
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => onNavigate('home')}
          className="mt-8 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-slate-300 hover:bg-white/20 transition-all"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// List Item Page
function ListItem({ onNavigate }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Books',
    availableFrom: '',
    availableUntil: '',
    location: '',
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createItem(formData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onNavigate('mylistings');
      }, 2000);
    } catch (err) {
      alert('Failed to create item: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          List Your Item
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20 shadow-lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
              >
                <option value="Books">Books</option>
                <option value="Electronics">Electronics</option>
                <option value="Sports">Sports</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 mb-2">Available From</label>
                <input
                  type="date"
                  value={formData.availableFrom}
                  onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-2">Available Until</label>
                <input
                  type="date"
                  value={formData.availableUntil}
                  onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              List Item
            </button>
          </form>

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 text-center"
            >
              ✓ Item listed successfully!
            </motion.div>
          )}
        </motion.div>

        <button
          onClick={() => onNavigate('home')}
          className="mt-8 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-slate-300 hover:bg-white/20 transition-all"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// My Listings Page
function MyListings({ onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyListings().then((data) => {
      setItems(data);
      setLoading(false);
    }).catch(err => {
      console.error('Error loading listings:', err);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      try {
        await api.deleteItem(id);
        setItems(items.filter((item) => item.id !== id));
      } catch (err) {
        alert('Failed to delete item: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          My Listings
        </motion.h1>

        {loading ? (
          <div className="text-center text-slate-300">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-slate-300">No listings yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.1 }}
                className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-cyan-300 mb-4">{item.title}</h3>
                <p className="text-slate-300 text-sm mb-4">Category: {item.category}</p>
                <div className="flex space-x-2">
                  <button className="flex-1 py-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/50 hover:bg-blue-500/30 transition-all">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => onNavigate('home')}
          className="mt-8 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-slate-300 hover:bg-white/20 transition-all"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// Requests Page
function Requests({ onNavigate }) {
  const [requests, setRequests] = useState({ outgoing: [], incoming: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRequests().then((data) => {
      setRequests(data);
      setLoading(false);
    }).catch(err => {
      console.error('Error loading requests:', err);
      setLoading(false);
    });
  }, []);

  const handleAction = async (id, action) => {
    try {
      await api.updateRequest(id, action);
      setRequests((prev) => ({
        ...prev,
        incoming: prev.incoming.map((r) => (r.id === id ? { ...r, status: action } : r)),
      }));
    } catch (err) {
      alert('Failed to update request: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Requests
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-cyan-300 mb-4">Outgoing Requests</h2>
            {loading ? (
              <div className="text-slate-300">Loading...</div>
            ) : (
              <div className="space-y-4">
                {requests.outgoing.map((req) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">{req.itemName}</h3>
                    <p className="text-slate-300 text-sm mb-2">Owner: {req.owner}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                      req.status === 'approved' ? 'bg-green-500/20 text-green-300' :
                      req.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                      'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {req.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-cyan-300 mb-4">Incoming Requests</h2>
            {loading ? (
              <div className="text-slate-300">Loading...</div>
            ) : (
              <div className="space-y-4">
                {requests.incoming.map((req) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20"
                  >
                    <h3 className="text-lg font-semibold text-white mb-2">{req.itemName}</h3>
                    <p className="text-slate-300 text-sm mb-4">Borrower: {req.borrower}</p>
                    {req.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAction(req.id, 'approved')}
                          className="flex-1 py-2 rounded-lg bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30 transition-all"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'rejected')}
                          className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30 transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-block px-3 py-1 rounded-full text-xs ${
                        req.status === 'approved' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {req.status}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="mt-8 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-slate-300 hover:bg-white/20 transition-all"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// Messages Page
// Messages Page - One-on-one Chat
function Messages({ onNavigate }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = React.useRef(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await api.getConversations();
      setConversations(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setLoading(false);
    }
  };

  const loadMessages = async (userEmail) => {
    try {
      const data = await api.getMessages(userEmail);
      setSelectedUser(data.otherUser);
      setMessages(data.messages);
      setShowSearch(false);
    } catch (err) {
      console.error('Error loading messages:', err);
      alert('Failed to load messages: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const sentMessage = await api.sendMessage(selectedUser.email, newMessage);
      setMessages([...messages, sentMessage]);
      setNewMessage('');
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (err) {
      alert('Failed to send message: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSearchUsers = async () => {
    if (!searchEmail.trim()) return;

    try {
      const results = await api.searchUsers(searchEmail);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching users:', err);
    }
  };

  const startConversation = (userEmail) => {
    loadMessages(userEmail);
    setSearchEmail('');
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Messages
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 shadow-lg overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:shadow-lg transition-all"
                >
                  + New Conversation
                </button>
              </div>

              {showSearch && (
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <input
                    type="email"
                    placeholder="Search by email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors mb-2"
                  />
                  <button
                    onClick={handleSearchUsers}
                    className="w-full py-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/50 hover:bg-blue-500/30 transition-all"
                  >
                    Search
                  </button>

                  {searchResults.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {searchResults.map((user) => (
                        <div
                          key={user._id}
                          onClick={() => startConversation(user.email)}
                          className="p-3 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-all"
                        >
                          <div className="font-semibold text-cyan-300">{user.name}</div>
                          <div className="text-sm text-slate-400">{user.email}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="overflow-y-auto max-h-96">
                {loading ? (
                  <div className="p-4 text-center text-slate-300">Loading...</div>
                ) : conversations.length === 0 ? (
                  <div className="p-4 text-center text-slate-300">
                    No conversations yet. Start chatting with someone!
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.userId}
                      onClick={() => loadMessages(conv.email)}
                      className={`p-4 border-b border-white/10 cursor-pointer hover:bg-white/10 transition-all ${
                        selectedUser?.email === conv.email ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-semibold">
                          {conv.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{conv.name}</div>
                          <div className="text-sm text-slate-400 truncate">{conv.email}</div>
                          <div className="text-xs text-slate-500 truncate">{conv.lastMessage}</div>
                        </div>
                        {conv.unread && (
                          <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            <div className="backdrop-blur-md bg-white/10 rounded-xl border border-white/20 shadow-lg overflow-hidden h-[600px] flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-semibold">
                        {selectedUser.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{selectedUser.name}</div>
                        <div className="text-sm text-slate-400">{selectedUser.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center text-slate-300 mt-8">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-3 rounded-lg ${
                              msg.isMine
                                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white'
                                : 'bg-white/10 text-slate-200'
                            }`}
                          >
                            <p className="text-sm font-semibold mb-1">{msg.sender}</p>
                            <p>{msg.text}</p>
                            <p className="text-xs opacity-70 mt-1">{msg.timestamp}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-white/10 p-4 flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                      Send
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-300">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-xl">Select a conversation or start a new one</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="mt-8 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-slate-300 hover:bg-white/20 transition-all"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// Profile Page
function Profile({ onNavigate }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateUser(user.id, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Profile
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20 shadow-lg"
        >
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white text-3xl font-semibold">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white">{user?.name}</h2>
              <div className="flex items-center mt-1">
                <span className="text-yellow-400 mr-2">{'★'.repeat(Math.floor(user?.trustScore || 0))}</span>
                <span className="text-slate-300">{user?.trustScore} Trust Score</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2">New Password (leave blank to keep current)</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Save Changes
            </button>
          </form>

          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 rounded-lg bg-green-500/20 border border-green-500/50 text-green-300 text-center"
            >
              ✓ Profile updated successfully!
            </motion.div>
          )}
        </motion.div>

        <button
          onClick={() => onNavigate('home')}
          className="mt-8 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-slate-300 hover:bg-white/20 transition-all"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// Guidelines Page
function Guidelines({ onNavigate }) {
  const guidelines = [
    { icon: '✓', title: 'Be Respectful', text: 'Treat all items and users with respect and care.' },
    { icon: '✓', title: 'Return on Time', text: 'Always return borrowed items by the agreed date.' },
    { icon: '✓', title: 'Report Damage', text: 'Immediately report any damage to the item owner.' },
    { icon: '✓', title: 'Accurate Listings', text: 'Provide accurate descriptions and photos of your items.' },
    { icon: '✗', title: 'No Prohibited Items', text: 'Do not list illegal, dangerous, or inappropriate items.' },
    { icon: '✗', title: 'No Harassment', text: 'Harassment of any kind will result in account suspension.' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-8"
        >
          Community Guidelines
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-md bg-white/10 rounded-xl p-8 border border-white/20 shadow-lg"
        >
          <p className="text-slate-300 mb-8 text-lg">
            Welcome to the Campus Resource Sharing Portal! To maintain a safe and friendly community, please follow these guidelines:
          </p>

          <div className="space-y-6">
            {guidelines.map((guideline, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start space-x-4 p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className={`text-3xl ${guideline.icon === '✓' ? 'text-green-400' : 'text-red-400'}`}>
                  {guideline.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-cyan-300 mb-2">{guideline.title}</h3>
                  <p className="text-slate-300">{guideline.text}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <h3 className="text-xl font-semibold text-cyan-300 mb-2">Trust Score System</h3>
            <p className="text-slate-300">
              Your trust score increases when you return items on time, receive positive feedback, and maintain good communication. 
              High trust scores unlock priority access to popular items!
            </p>
          </div>
        </motion.div>

        <button
          onClick={() => onNavigate('home')}
          className="mt-8 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 text-slate-300 hover:bg-white/20 transition-all"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// Main App Component
function AppContent() {
  const [currentPage, setCurrentPage] = useState('login');
  const { token } = useAuth();

  useEffect(() => {
    if (token && currentPage === 'login') {
      setCurrentPage('home');
    }
  }, [token]);

  const renderPage = () => {
    if (!token && currentPage !== 'login') {
      return <LoginPage onSuccess={() => setCurrentPage('home')} />;
    }

    const pageProps = { onNavigate: setCurrentPage };

    switch (currentPage) {
      case 'login':
        return <LoginPage onSuccess={() => setCurrentPage('home')} />;
      case 'home':
        return <HomePage {...pageProps} />;
      case 'browse':
        return <BrowseItems {...pageProps} />;
      case 'list':
        return <ListItem {...pageProps} />;
      case 'mylistings':
        return <MyListings {...pageProps} />;
      case 'requests':
        return <Requests {...pageProps} />;
      case 'messages':
        return <Messages {...pageProps} />;
      case 'profile':
        return <Profile {...pageProps} />;
      case 'guidelines':
        return <Guidelines {...pageProps} />;
      default:
        return <HomePage {...pageProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
      <AnimatedBackground />
      {token && currentPage !== 'login' && <Navbar onNavigate={setCurrentPage} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}