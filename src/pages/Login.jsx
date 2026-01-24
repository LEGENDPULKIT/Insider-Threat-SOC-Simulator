export default function Login({ setPage }) {
  return (
    <>
      <h2>Welcome Back</h2>
      <input placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button className="primary">Login</button>
      <p className="switch" onClick={() => setPage('signup')}>
        Don’t have an account? <span>Sign up</span>
      </p>
    </>
  )
}
