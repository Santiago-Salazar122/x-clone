
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

    setCurrentUser(authenticatedUser)
  }

  function logout() {
    localStorage.removeItem('x-clone-current-user')
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
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
