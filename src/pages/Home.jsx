import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext'
import { apiRequest } from '../services/api'

function Home() {
  const [text, setText] = useState('')
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { currentUser, token } = useAuth()

  const profileName = currentUser?.name
  const profileHandle = currentUser?.username

  useEffect(() => {
    if (!token) {
      return
    }

    async function loadPosts() {
      setLoading(true)
      setError('')

      try {
        const data = await apiRequest(`/api/posts?page=${page}&size=10`)

        const formattedPosts = data.content.map(post => ({
          id: post.id,
          name: post.user.name,
          username: `@${post.user.username}`,
          content: post.content
        }))

        setPosts(formattedPosts)
        setTotalPages(data.totalPages)

      } catch (error) {
        console.error('Error loading posts:', error)
        setError('No se pudieron cargar las publicaciones.')

      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [token, page])


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
        {loading && <p>Cargando publicaciones...</p>}

        {error && <p>{error}</p>}
        {!loading && !error && posts.length === 0 && (
          <p>No hay publicaciones para mostrar.</p>
        )}

        {posts.map((post) => (
          <article className="post" key={post.id}>
            <h3>{post.name}</h3>
            <p>{post.username}</p>
            <p>{post.content}</p>
          </article>
        ))}

        {totalPages > 1 && (
          <div className="follow-pagination">
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page === 0 || loading}
            >
              Anterior
            </button>

            <span>
              Página {page + 1} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page + 1 >= totalPages || loading}
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export default Home
