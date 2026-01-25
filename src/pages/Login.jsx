import { useState } from 'react'

export default function Login() {
  const [role, setRole] = useState('employee') // 'admin' or 'employee'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Login:', { role, email, password })
    // Add your authentication logic here
  }

  return (
    <>
      <h2>Login</h2>
      
      {/* Role Selector */}
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
        <input
          type="text"
          placeholder={role === 'admin' ? 'Admin Credentials' : 'Employee Credentials'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <button type="submit" className="primary">
          Login as {role === 'admin' ? 'Admin' : 'Employee'}
        </button>
      </form>
    </>
  )
}
