
import { useParams, Link } from 'react-router-dom'
import { usePosts } from '../PostContext'
import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'

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
  const { posts } = usePosts()
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
        const response = await fetch(
          `http://localhost:8080/api/users/${encodeURIComponent(username)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('No se pudo encontrar el usuario.')
        }

        const user = await response.json()

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
    if (!token) {
      setFollowing(false)
      setFollowersCount(0)
      setFollowingCount(0)
      return
    }

    let isActive = true

    async function loadFollowData() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`
        }

        const [followersResponse, followingResponse, statusResponse] =
          await Promise.all([
            fetch(
              `http://localhost:8080/api/follows/${encodeURIComponent(username)}/followers/count`,
              { headers }
            ),
            fetch(
              `http://localhost:8080/api/follows/${encodeURIComponent(username)}/following/count`,
              { headers }
            ),
            fetch(
              `http://localhost:8080/api/follows/${encodeURIComponent(username)}/is-following`,
              { headers }
            )
          ])

        if (!followersResponse.ok || !followingResponse.ok || !statusResponse.ok) {
          throw new Error('No se pudieron cargar los datos de seguimiento.')
        }

        const [followersData, followingData, statusData] = await Promise.all([
          followersResponse.json(),
          followingResponse.json(),
          statusResponse.json()
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
      const response = await fetch(
        `http://localhost:8080/api/follows/${encodeURIComponent(username)}/${type}?page=${page}&size=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('No se pudo cargar la lista.')
      }

      const data = await response.json()

      setFollowList(data.content)
      setFollowListPage(data.number)
      setFollowListType(type)
      setShowFollowList(true)
    } catch (error) {
      setFollowError(error.message)
    }
  }

  const userPosts = posts.filter(
    (post) => post.username.replace('@', '') === username
  )

  async function handleFollow() {
    setFollowError('')

    if (!token) {
      setFollowError('Debes iniciar sesión para seguir usuarios.')
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/follows/${encodeURIComponent(username)}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo seguir al usuario.')
      }

      setFollowing(true)
      setFollowersCount((count) => count + 1)
    } catch (error) {
      setFollowError(error.message || 'No se pudo conectar con el servidor.')
    }
  }


  async function saveProfile() {
    setProfileError('')

    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${encodeURIComponent(username)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ name })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudo actualizar el nombre.'
        )
      }

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

        {userPosts.length === 0 ? (
          <p>Este usuario todavía no tiene publicaciones.</p>
        ) : (
          userPosts.map((post) => (
            <article className="post" key={post.id}>
              <h3>{post.name}</h3>
              <p>{post.username}</p>
              <p>{post.content}</p>
              <p>♥ {post.likes} Me gusta</p>
            </article>
          ))
        )}
      </section>
    </div>
  )
}

export default Profile
