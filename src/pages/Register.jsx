import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleRegister(event) {
    event.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Completa todos los campos.')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    const result = register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    })

    if (!result.success) {
      setError(result.message)
      return
    }

    navigate('/')
  }

  return (
    <div>
      <h1>Crear cuenta</h1>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <input
          type="password"
          placeholder="Crear contraseña"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <p>{error}</p>}

        <button type="submit">
          Registrarse
        </button>
      </form>
    </div>
  )
}

export default Register