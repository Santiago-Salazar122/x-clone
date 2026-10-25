
import { useParams, Link } from 'react-router-dom'
import { usePosts } from '../PostContext'
import { useState, useEffect } from 'react'
import { useAuth } from '../AuthContext'
import { useFollows } from '../FollowContext'

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

  const {
    followUser,
    isFollowing,
    getFollowersCount,
    getFollowingCount
  } = useFollows()

  const isOwnProfile = currentUser?.username === username
  const following = isFollowing(username)

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

  const userPosts = posts.filter(
    (post) => post.username.replace('@', '') === username
  )

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
          <p>
            <strong>{getFollowingCount(username)}</strong> Seguidos
          </p>

          <p>
            <strong>{getFollowersCount(username)}</strong> Seguidores
          </p>
        </div>

        {!isOwnProfile && (
          <button
            type="button"
            onClick={() => followUser(username)}
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
