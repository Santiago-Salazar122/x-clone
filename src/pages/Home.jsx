
import { useEffect, useState } from 'react'
import { usePosts } from '../PostContext'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'
import { useFollows } from '../FollowContext'

function Home() {
  const [text, setText] = useState('')
  const { posts, setPosts } = usePosts()
  const { currentUser, token } = useAuth()
  const { followUser, isFollowing } = useFollows()
  const [searchUsername, setSearchUsername] = useState('')
  const [searchError, setSearchError] = useState('')
  const [followUsername, setFollowUsername] = useState('')
  const [followMessage, setFollowMessage] = useState('')
  const navigate = useNavigate()

  const profileName = currentUser?.name || 'Santiago'
  const profileHandle = currentUser?.username || 'santi'

  useEffect(() => {
    if (!token) {
      return
    }

    async function loadPosts() {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('No se pudieron cargar las publicaciones')
        }

        const data = await response.json()

        const formattedPosts = data.map((post) => ({
          id: post.id,
          name: post.user.name,
          username: `@${post.user.username}`,
          content: post.content,
          likes: 0,
          liked: false
        }))

        setPosts(formattedPosts)
      } catch (error) {
        console.error('Error loading posts:', error)
      }
    }

    loadPosts()
  }, [token, setPosts])


  async function publishPost() {

    const content = text.trim()

    if (!content || !token) {
      return
    }


    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/posts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ content })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || 'No se pudo publicar el mensaje'
        )
      }

      const newPost = {
        id: data.id,
        name: data.user.name,
        username: `@${data.user.username}`,
        content: data.content,
        likes: 0,
        liked: false
      }

      setPosts((currentPosts) => [newPost, ...currentPosts])
      setText('')
    } catch (error) {
      console.error('Error publishing post:', error)
      alert(error.message || 'No se pudo conectar con el servidor')
    }
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

  async function openProfile() {
    const username = searchUsername.trim().replace(/^@/, '')

    if (!username) {
      setSearchError('Escribe un nombre de usuario.')
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${encodeURIComponent(username)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (response.status === 404) {
        setSearchError('No se encontró ese usuario.')
        return
      }

      if (!response.ok) {
        throw new Error('No se pudo consultar el usuario.')
      }

      setSearchError('')
      navigate(`/users/${encodeURIComponent(username)}`)
    } catch (error) {
      console.error('Error searching profile:', error)
      setSearchError('No se pudo conectar con el servidor.')
    }
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
