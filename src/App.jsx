
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import { PostProvider } from './PostContext'
import { AuthProvider } from './AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import { FollowProvider } from './FollowContext'
import ProfileSearch from './components/ProfileSearch'


function App() {
  return (
    <AuthProvider>
      <FollowProvider>
        <PostProvider>
          <BrowserRouter>

            <div className="app-layout">
              <aside className="app-navbar">
                <Navbar />
              </aside>

              <main className="app-content">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/users/:username"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                  />
                </Routes>
              </main>

              <aside className="app-sidebar">
                <ProfileSearch />
              </aside>
            </div>
          </BrowserRouter>
        </PostProvider>
      </FollowProvider>
    </AuthProvider>
  )
}

export default App
