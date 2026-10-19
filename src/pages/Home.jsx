
import { useState } from 'react'
import { usePosts } from '../PostContext'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'
import { useFollows } from '../FollowContext'

function Home() {
  const [text, setText] = useState('')
  const { posts, setPosts } = usePosts()
  const { currentUser } = useAuth()
  const { followUser, isFollowing } = useFollows()
  const [searchUsername, setSearchUsername] = useState('')
  const [searchError, setSearchError] = useState('')
  const [followUsername, setFollowUsername] = useState('')
  const [followMessage, setFollowMessage] = useState('')
  const navigate = useNavigate()

  const profileName = currentUser?.name || 'Santiago'
  const profileHandle = currentUser?.username || 'santi'

  function publishPost() {
    if (text.trim() === '') {
      return
    }

    const newPost = {
      id: Date.now(),
      name: profileName,
      username: `@${profileHandle}`,
      content: text,
      likes: 0,
      liked: false
    }

    setPosts([newPost, ...posts])
    setText('')
  }

  function toggleLike(postId) {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
            liked: !post.liked
          }
        }

        return post
      })
    )
  }

  function openProfile() {
    const username = searchUsername.trim().replace(/^@/, '')

    if (!username) {
      setSearchError('Escribe un nombre de usuario.')
      return
    }

    const savedUsers = localStorage.getItem('x-clone-users')
    const users = savedUsers ? JSON.parse(savedUsers) : []

    const userExists = users.some(
      (user) => user.username === username
    )

    if (!userExists) {
      setSearchError('No se encontró ese usuario.')
      return
    }

    setSearchError('')
    navigate(`/users/${username}`)
  }


  function followByUsername() {
    const username = followUsername
      .trim()
      .replace(/^@/, '')
      .toLowerCase()

    if (!username) {
      setFollowMessage('Escribe un nombre de usuario.')
      return
    }

    const savedUsers = localStorage.getItem('x-clone-users')
    const users = savedUsers ? JSON.parse(savedUsers) : []

    const userExists = users.some(
      (user) => user.username === username
    )

    if (!userExists) {
      setFollowMessage('No se encontró ese usuario.')
      return
    }

    if (username === currentUser?.username) {
      setFollowMessage('No puedes seguirte a ti mismo.')
      return
    }

    if (isFollowing(username)) {
      setFollowMessage(`Ya sigues a @${username}.`)
      return
    }

    const followed = followUser(username)

    if (followed) {
      setFollowMessage(`Ahora sigues a @${username}.`)
      setFollowUsername('')
    } else {
      setFollowMessage('No se pudo seguir a este usuario.')
    }
  }


  return (
    <div className="home-page">
      <header>
        <h1>Inicio</h1>
        <p>
          Sesión iniciada: {profileName} (@{profileHandle})
        </p>
      </header>


      <section className="profile-search">
        <h2>Buscar perfil</h2>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            openProfile()
          }}
        >
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={searchUsername}
            onChange={(event) => setSearchUsername(event.target.value)}
          />

          <button type="submit">
            Buscar perfil
          </button>
        </form>

        {searchError && <p>{searchError}</p>}
      </section>


      <section className="follow-user">
        <h2>Seguir usuarios</h2>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            followByUsername()
          }}
        >
          <input
            type="text"
            placeholder="Escribe el nombre de usuario"
            value={followUsername}
            onChange={(event) => setFollowUsername(event.target.value)}
          />

          <button type="submit">
            Seguir
          </button>
        </form>

        {followMessage && <p>{followMessage}</p>}
      </section>



      <section className="post-box">
        <h2>¿Qué está pasando?</h2>

        <textarea
          placeholder="¿Qué está pasando?"
          rows="3"
          value={text}
          maxLength={280}
          onChange={(event) => setText(event.target.value)}
        />

        <p>
          {text.length} escritos · {280 - text.length} caracteres restantes
        </p>

        <button
          type="button"
          onClick={publishPost}
          disabled={text.trim() === ''}
        >
          Publicar
        </button>
      </section>

      <section className="feed">
        {posts.map((post) => (
          <article className="post" key={post.id}>
            <h3>{post.name}</h3>
            <p>{post.username}</p>
            <p>{post.content}</p>

            <button
              type="button"
              onClick={() => toggleLike(post.id)}
            >
              {post.liked ? '♥' : '♡'} {post.likes} Me gusta
            </button>
          </article>
        ))}
      </section>
    </div>
  )
}

export default Home
