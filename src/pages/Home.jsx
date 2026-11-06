import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { apiRequest } from '../services/api'

function Home() {
  const [text, setText] = useState('')
  const [posts, setPosts] = useState([])
  const { currentUser, token } = useAuth()

  const profileName = currentUser?.name
  const profileHandle = currentUser?.username

  useEffect(() => {
    if (!token) {
      return
    }

    async function loadPosts() {
      try {
        const data = await apiRequest('/api/posts')

        const formattedPosts = data.map((post) => ({
          id: post.id,
          name: post.user.name,
          username: `@${post.user.username}`,
          content: post.content
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
      const data = await apiRequest('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content })
      })

      const newPost = {
        id: data.id,
        name: data.user.name,
        username: `@${data.user.username}`,
        content: data.content,

      }

      setPosts((currentPosts) => [newPost, ...currentPosts])
      setText('')
    } catch (error) {
      console.error('Error publishing post:', error)
      alert(error.message || 'No se pudo conectar con el servidor')
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
          </article>
        ))}
      </section>
    </div>
  )
}

export default Home
