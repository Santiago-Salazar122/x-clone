import { Link, useNavigate } from 'react-router-dom'
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
    <nav>
      <Link to="/">Inicio</Link>

      {' | '}

      <Link to={`/users/${username}`}>
        Mi perfil
      </Link>

      {' | '}

      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </nav>
  )
}

export default Navbar