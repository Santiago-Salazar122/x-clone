
import { useState } from 'react'

function Home() {
  const [texto, setTexto] = useState('')
  const [publicaciones, setPublicaciones] = useState([
    {
      id: 1,
      nombre: 'Santiago',
      usuario: '@santi',
      contenido: '¡Bienvenidos a mi clon de X! Estoy construyendo mi propia red social.'
    },
    {
      id: 2,
      nombre: 'Comunidad X',
      usuario: '@comunidad',
      contenido: 'Este es el espacio donde compartiremos ideas, noticias y opiniones.'
    }
  ])

  function publicar() {
    if (texto.trim() === '') {
      return
    }

    const nuevaPublicacion = {
      id: Date.now(),
      nombre: 'Santiago',
      usuario: '@santi',
      contenido: texto
    }

    setPublicaciones([nuevaPublicacion, ...publicaciones])
    setTexto('')
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
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />

        <button type="button" onClick={publicar}>
          Postear
        </button>
      </section>

      <section className="feed">
        {publicaciones.map((post) => (
          <article className="post" key={post.id}>
            <h3>{post.nombre}</h3>
            <p>{post.usuario}</p>
            <p>{post.contenido}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

export default Home
