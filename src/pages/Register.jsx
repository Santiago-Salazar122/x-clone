
function Register() {
  return (
    <div>
      <h1>Crear cuenta</h1>

      <form>
        <input
          type="text"
          placeholder="Nombre completo"
        />

        <input
          type="email"
          placeholder="Correo electrónico"
        />

        <input
          type="password"
          placeholder="Crear contraseña"
        />

        <button type="submit">
          Registrarse
        </button>
      </form>
    </div>
  );
}

export default Register;
