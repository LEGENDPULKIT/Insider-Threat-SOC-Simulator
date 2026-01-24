import Signup from '../pages/Signup'
import Login from '../pages/Login'

export default function AuthCard({ page, setPage }) {
  return (
    <div className="ui-card">
      {page === 'signup'
        ? <Signup setPage={setPage} />
        : <Login setPage={setPage} />
      }
    </div>
  )
}
