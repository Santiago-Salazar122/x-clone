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


  function register(user) {
    const savedUsers = localStorage.getItem('x-clone-users')
    const users = savedUsers ? JSON.parse(savedUsers) : []

    const emailExists = users.some(
      (savedUser) => savedUser.email === user.email
    )

    if (emailExists) {
      return {
        success: false,
        message: 'Este correo ya está registrado.'
      }
    }

    const usernameExists = users.some(
      (savedUser) => savedUser.username === user.username
    )

    if (usernameExists) {
      return {
        success: false,
        message: 'Este nombre de usuario ya está ocupado.'
      }
    }

    const newUser = {
      ...user,
      createdAt: new Date().toISOString()
    }

    users.push(newUser)

    localStorage.setItem('x-clone-users', JSON.stringify(users))
    localStorage.setItem('x-clone-current-user', JSON.stringify(newUser))

    setCurrentUser(newUser)

    return { success: true }
  }


  function login(email, password) {
    const savedUsers = localStorage.getItem('x-clone-users')
    const users = savedUsers ? JSON.parse(savedUsers) : []

    const user = users.find(
      (savedUser) =>
        savedUser.email === email.trim().toLowerCase() &&
        savedUser.password === password
    )

    if (!user) {
      return {
        success: false,
        message: 'Correo o contraseña incorrectos.'
      }
    }

    setCurrentUser(user)
    localStorage.setItem('x-clone-current-user', JSON.stringify(user))

    return { success: true }
  }

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
        register,
        login,
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