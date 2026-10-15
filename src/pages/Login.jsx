
function Login() {
  return (
    <div>
      <h1>Iniciar sesión</h1>
      <form>
        <input
          type="text"
          placeholder="Usuario o correo electrónico"
        />

        <input
          type="password"
          placeholder="Contraseña"
        />

        <button type="submit">
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}

export default Login;
