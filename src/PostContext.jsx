
import { createContext, useContext, useEffect, useState } from 'react'

const PostContext = createContext()

const initialPosts = [
  {
    id: 1,
    name: 'Santiago',
    username: '@santi',
    content: '¡Bienvenidos a mi clon de X! Estoy creando mi propia red social.',
    likes: 0,
    liked: false
  },
  {
    id: 2,
    name: 'Comunidad X',
    username: '@comunidad',
    content: 'Este es un espacio para compartir ideas, noticias y opiniones.',
    likes: 0,
    liked: false
  }
]

function getSavedPosts() {
  try {
    const savedPosts = localStorage.getItem('x-clone-posts')

    return savedPosts ? JSON.parse(savedPosts) : initialPosts
  } catch {
    return initialPosts
  }
}

export function PostProvider({ children }) {
  const [posts, setPosts] = useState(getSavedPosts)

  useEffect(() => {
    localStorage.setItem('x-clone-posts', JSON.stringify(posts))
  }, [posts])

  return (
    <PostContext.Provider value={{ posts, setPosts }}>
      {children}
    </PostContext.Provider>
  )
}

export function usePosts() {
  return useContext(PostContext)
}
