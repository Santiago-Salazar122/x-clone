
import { Link, useNavigate } from 'react-router-dom'
import {
  House,
  UserRound,
  LogOut,
  CircleUserRound
} from 'lucide-react'
import { useAuth } from '../AuthContext'

function Navbar() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!currentUser) {
    return null
  }

  const username =
    currentUser.username || currentUser.email.split('@')[0]

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo" aria-label="Inicio de X">
        𝕏
      </Link>

      <Link to="/" className="navbar-link">
        <House size={24} />
        <span>Inicio</span>
      </Link>

      <Link
        to={`/users/${username}`}
        className="navbar-link"
      >
        <UserRound size={24} />
        <span>Mi perfil</span>
      </Link>

      <div className="navbar-user">
        <CircleUserRound size={24} />
        <span>
          {currentUser.name || username}
        </span>
      </div>

      <button
        type="button"
        className="navbar-link navbar-logout"
        onClick={handleLogout}
      >
        <LogOut size={24} />
        <span>Cerrar sesión</span>
      </button>
    </nav>
  )
}

export default Navbar
