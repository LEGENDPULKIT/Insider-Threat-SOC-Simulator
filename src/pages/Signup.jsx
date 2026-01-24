export default function Signup({ setPage }) {
  return (
    <>
      <h2>Create Account</h2>
      <input placeholder="Name" />
      <input placeholder="Email" />
      <input type="password" placeholder="Password" />
      <input type="password" placeholder="Confirm Password" />
      <button className="primary">Sign Up</button>
      <p className="switch" onClick={() => setPage('login')}>
        Already have an account? <span>Login</span>
      </p>
    </>
  )
}
