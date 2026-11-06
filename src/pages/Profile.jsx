
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { apiRequest } from '../services/api'

const defaultProfile = {
  name: '',
  bio: 'Este es mi perfil en X Clone.'
}

function getSavedProfile(username) {
  try {
    const savedProfile = localStorage.getItem(
      `x-clone-profile-${username}`
    )

    if (savedProfile) {
      return JSON.parse(savedProfile)
    }

    return {
      ...defaultProfile,
      name: username
    }
  } catch {
    return {
      ...defaultProfile,
      name: username
    }
  }
}

function Profile() {
  const { username } = useParams()
  const [userPosts, setUserPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState('')
  const { currentUser, token } = useAuth()
  const [following, setFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [followError, setFollowError] = useState('')
  const [showFollowList, setShowFollowList] = useState(false)
  const [followListType, setFollowListType] = useState('followers')
  const [followList, setFollowList] = useState([])
  const [followListPage, setFollowListPage] = useState(0)


  const isOwnProfile = currentUser?.username === username


  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadProfile() {
      setProfileError('')

      const savedProfile = getSavedProfile(username)

      setName(savedProfile.name || username)
      setBio(savedProfile.bio || defaultProfile.bio)
      setIsEditing(false)

      if (!token) {
        return
      }

      try {
        const user = await apiRequest(
          `/api/users/${encodeURIComponent(username)}`
        )

        if (!isActive) return

        setName(user.name || username)
      } catch {
        if (!isActive) return

        setProfileError(
          'No se pudo cargar el perfil desde el servidor.'
        )
      }
    }

    loadProfile()

    return () => {
      isActive = false
    }
  }, [username, token])

  useEffect(() => {
    let isActive = true

    const loadUserPosts = async () => {
      setPostsLoading(true)
      setPostsError('')
      if (!token) {
        setUserPosts([])
        setPostsLoading(false)
        return
      }

      try {
        const data = await apiRequest(
          `/api/posts/user/${encodeURIComponent(username)}`
        )

        if (isActive) {
          setUserPosts(data)
        }
      } catch (error) {
        if (isActive) {
          setPostsError(error.message)
        }
      } finally {
        if (isActive) {
          setPostsLoading(false)
        }
      }
    }

    loadUserPosts()

    return () => {
      isActive = false
    }
  }, [username, token])


  useEffect(() => {
    if (!token) {
      setFollowing(false)
      setFollowersCount(0)
      setFollowingCount(0)
      return
    }

    let isActive = true

    async function loadFollowData() {
      try {
        const [followersData, followingData, statusData] =
          await Promise.all([
            apiRequest(
              `/api/follows/${encodeURIComponent(username)}/followers/count`
            ),
            apiRequest(
              `/api/follows/${encodeURIComponent(username)}/following/count`
            ),
            apiRequest(
              `/api/follows/${encodeURIComponent(username)}/is-following`
            )
          ])

        if (!isActive) return

        setFollowersCount(followersData.count)
        setFollowingCount(followingData.count)
        setFollowing(statusData.isFollowing)
      } catch (error) {
        if (!isActive) return
        setFollowError(error.message)
      }
    }

    loadFollowData()

    return () => {
      isActive = false
    }
  }, [username, token])


  async function loadFollowList(type, page = 0) {
    if (!token) return

    try {
      const data = await apiRequest(
        `/api/follows/${encodeURIComponent(username)}/${type}?page=${page}&size=10`
      )

      setFollowList(data.content)
      setFollowListPage(data.number)
      setFollowListType(type)
      setShowFollowList(true)
    } catch (error) {
      setFollowError(error.message)
    }
  }



  async function handleFollow() {
    setFollowError('')

    if (!token) {
      setFollowError('Debes iniciar sesión para seguir usuarios.')
      return
    }

    try {
      await apiRequest(
        `/api/follows/${encodeURIComponent(username)}`,
        {
          method: 'POST'
        }
      )

      setFollowing(true)
      setFollowersCount((count) => count + 1)
    } catch (error) {
      setFollowError(error.message || 'No se pudo conectar con el servidor.')
    }
  }


  async function saveProfile() {
    setProfileError('')

    try {
      const data = await apiRequest(
        `/api/users/${encodeURIComponent(username)}`,
        {
          method: 'PUT',
          body: JSON.stringify({ name })
        }
      )

      const updatedProfile = {
        name: data.name || name,
        bio
      }

      localStorage.setItem(
        `x-clone-profile-${username}`,
        JSON.stringify(updatedProfile)
      )

      setName(updatedProfile.name)
      setIsEditing(false)
    } catch (error) {
      setProfileError(
        error.message || 'No se pudo guardar el perfil.'
      )
    }
  }

  return (
    <div className="profile-page">
      <header>
        <h1>Perfil</h1>

        <Link to="/">← Volver al inicio</Link>
      </header>

      <section className="profile-info">
        <div className="profile-avatar">
          {name.charAt(0).toUpperCase()}
        </div>

        <h2>{name}</h2>
        <p>@{username}</p>
        <p>{bio}</p>

        <div className="profile-stats">
          <p
            onClick={() => loadFollowList('following')}
            role="button"
            tabIndex={0}
          >
            <strong>{followingCount}</strong> Seguidos
          </p>

          <p
            onClick={() => loadFollowList('followers')}
            role="button"
            tabIndex={0}
          >
            <strong>{followersCount}</strong> Seguidores
          </p>
        </div>

        {!isOwnProfile && (
          <button
            type="button"
            onClick={handleFollow}
            disabled={following}
          >
            {following ? 'Siguiendo' : 'Seguir'}
          </button>
        )}

        {isOwnProfile && isEditing && (
          <div className="edit-profile-form">
            <label htmlFor="profile-name">Nombre</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <label htmlFor="profile-bio">Biografía</label>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows="3"
            />
          </div>
        )}

        {profileError && <p role="alert">{profileError}</p>}
        {followError && <p role="alert">{followError}</p>}

        {isOwnProfile && (
          isEditing ? (
            <button
              type="button"
              onClick={saveProfile}
              disabled={!token}
            >
              Guardar perfil
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
            >
              Editar perfil
            </button>
          )
        )}
      </section>

      {showFollowList && (
        <div className="follow-modal">
          <div className="follow-modal-content">
            <div className="follow-modal-header">
              <h2>
                {followListType === 'followers' ? 'Seguidores' : 'Seguidos'}
              </h2>

              <button
                type="button"
                onClick={() => setShowFollowList(false)}
              >
                ✕
              </button>
            </div>

            {followList.length === 0 ? (
              <p>No hay usuarios para mostrar.</p>
            ) : (
              followList.map((user) => (
                <div className="follow-user" key={user.id}>
                  <Link to={`/users/${user.username}`}>
                    <strong>{user.name}</strong>
                    <span>@{user.username}</span>
                  </Link>
                </div>
              ))
            )}

            <div className="follow-pagination">
              <button
                type="button"
                onClick={() => loadFollowList(followListType, followListPage - 1)}
                disabled={followListPage === 0}
              >
                Anterior
              </button>

              <span>Página {followListPage + 1}</span>

              <button
                type="button"
                onClick={() => loadFollowList(followListType, followListPage + 1)}
                disabled={followList.length < 10}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="feed">
        <h2>Publicaciones</h2>

        {postsLoading ? (
          <p>Cargando publicaciones...</p>
        ) : postsError ? (
          <p>{postsError}</p>
        ) : userPosts.length === 0 ? (
          <p>Este usuario todavía no tiene publicaciones.</p>
        ) : (
          userPosts.map((post) => (
            <article className="post" key={post.id}>
              <h3>{post.user.name}</h3>
              <p>@{post.user.username}</p>
              <p>{post.content}</p>
              <p>{new Date(post.createdAt).toLocaleString()}</p>
            </article>
          ))
        )}
      </section>
    </div>
  )
}

export default Profile
