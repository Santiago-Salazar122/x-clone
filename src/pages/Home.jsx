import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePosts } from '../PostContext'
import { useAuth } from '../AuthContext'

function Home() {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const { posts, setPosts } = usePosts()
  const { currentUser, logout } = useAuth()

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

  return (
    <div className="home-page">

      <header>
        <h1>Inicio</h1>

        <p>
          Sesión iniciada: {profileName} (@{profileHandle})
        </p>

        <a href={`/users/${profileHandle}`}>
          Ver mi perfil
        </a>

        <br />

        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Cerrar sesión
        </button>
      </header>


      <section className="post-box">
        <h2>¿Qué está pasando?</h2>

        <textarea
          placeholder="¿Qué está pasando?"
          rows="3"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />

        <button type="button" onClick={publishPost}>
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