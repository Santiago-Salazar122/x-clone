
import { createContext, useContext, useState } from 'react'

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

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        logout,
        setAuthenticatedUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
