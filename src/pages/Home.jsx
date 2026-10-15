
import { useState } from 'react'
import { usePosts } from '../PostContext'

function Home() {
  const [text, setText] = useState('')
  const { posts, setPosts } = usePosts()

  function publishPost() {
    if (text.trim() === '') {
      return
    }

    const newPost = {
      id: Date.now(),
      name: 'Santiago',
      username: '@santi',
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
