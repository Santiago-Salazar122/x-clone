
import { createContext, useContext, useState, useEffect } from 'react'
import { apiRequest } from './services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('x-clone-current-user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('x-clone-token') || null
  })

  const [loading, setLoading] = useState(true)

  function setAuthenticatedUser(user) {
    const authenticatedUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email
    }

    localStorage.setItem(
      'x-clone-current-user',
      JSON.stringify(authenticatedUser)
    )

    if (user.token) {
      localStorage.setItem('x-clone-token', user.token)
      setToken(user.token)
    }

    setCurrentUser(authenticatedUser)
  }

  function logout() {
    localStorage.removeItem('x-clone-current-user')
    localStorage.removeItem('x-clone-token')
    setCurrentUser(null)
    setToken(null)
  }

  useEffect(() => {
    function handleUnauthorized() {
      logout()
    }

    window.addEventListener('x-clone-unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('x-clone-unauthorized', handleUnauthorized)
    }
  }, [])

  useEffect(() => {
    async function validateSession() {
      const savedToken = localStorage.getItem('x-clone-token')

      if (!savedToken) {
        setLoading(false)
        return
      }

      try {
        const user = await apiRequest('/api/users/me')

        setAuthenticatedUser(user)
      } catch {
        logout()
      } finally {
        setLoading(false)
      }
    }

    validateSession()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        logout,
        setAuthenticatedUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  }

  return context
}
