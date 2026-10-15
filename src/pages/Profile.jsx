
import { useParams } from 'react-router-dom'
import { usePosts } from '../PostContext'
import { useState, useEffect } from 'react'

const defaultProfile = {
  name: 'Santiago',
  handle: 'santi',
  bio: 'Este es mi perfil en X Clone.'
}

function getSavedProfile(username) {
  try {
    const savedProfile = localStorage.getItem(
      `x-clone-profile-${username}`
    )

    return savedProfile
      ? JSON.parse(savedProfile)
      : {
        ...defaultProfile,
        name: username === 'santi' ? 'Santiago' : username
      }
  } catch {
    return {
      ...defaultProfile,
      name: username === 'santi' ? 'Santiago' : username
    }
  }
}

function Profile() {
  const { username } = useParams()
  const { posts } = usePosts()

  const userPosts = posts.filter(
    (post) => post.username.replace('@', '') === username
  )

  const [name, setName] = useState(
    () => getSavedProfile(username).name
  )

  const [bio, setBio] = useState(
    () => getSavedProfile(username).bio
  )

  const [handle, setHandle] = useState(
    () => getSavedProfile(username).handle || username
  )

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    localStorage.setItem(
      `x-clone-profile-${username}`,
      JSON.stringify({ name, handle, bio })
    )
  }, [username, name, handle, bio])

  return (
    <div className="profile-page">
      <header>
        <h1>Perfil</h1>
      </header>


      <section className="profile-info">
        <div className="profile-avatar">
          {name.charAt(0).toUpperCase()}
        </div>

        <h2>{name}</h2>
        <p>@{handle}</p>
        <p>{bio}</p>

        {isEditing && (
          <div className="edit-profile-form">
            <label htmlFor="profile-name">Nombre</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <label htmlFor="profile-handle">Nombre de usuario</label>
            <input
              id="profile-handle"
              type="text"
              value={handle}
              onChange={(event) =>
                setHandle(event.target.value.replace('@', '').trim())
              }
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

        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Terminar edición' : 'Editar perfil'}
        </button>
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
