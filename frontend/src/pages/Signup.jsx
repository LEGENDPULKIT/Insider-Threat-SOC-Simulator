import { useState, useContext } from 'react'
import { AuthContext } from '../App'

const useAuth = () => useContext(AuthContext);

export default function Signup({ onSuccess, onSwitchToLogin }) {
  const { register } = useAuth();
  const [role, setRole] = useState('employee');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(name, email, password, role);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2>Sign Up</h2>
      <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 10px' }}>
        Choose whether this account is for an employee or an admin.
      </p>

      <div className="role-selector">
        <button
          type="button"
          className={`role-btn ${role === 'employee' ? 'active' : ''}`}
          onClick={() => setRole('employee')}
        >
          Employee
        </button>
        <button
          type="button"
          className={`role-btn ${role === 'admin' ? 'active' : ''}`}
          onClick={() => setRole('admin')}
        >
          Admin
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div style={{ 
            color: '#fca5a5', 
            fontSize: '12px', 
            marginBottom: '8px',
            padding: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            {error}
          </div>
        )}
        
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        
        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="switch-text">
        Already have an account?{' '}
        <span className="link" onClick={onSwitchToLogin}>
          Login
        </span>
      </div>
    </>
  )
}
