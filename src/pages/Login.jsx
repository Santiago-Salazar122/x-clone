
import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'

function Login() {
  const { setAuthenticatedUser } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiRequest('/api/users/login', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password
        })
      })

      setAuthenticatedUser(data)
      navigate('/')
    } catch (error) {
      setError(error.message || 'No se pudo conectar con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>

      <p>
        ¿No tienes una cuenta?{' '}
        <a href="/register">Crear cuenta</a>
      </p>
    </div>
  )
}

export default Login
