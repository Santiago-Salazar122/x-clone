import { Link } from 'react-router-dom'

function UserCard({ user }) {
  return (
    <div className="follow-user">
      <Link to={`/users/${user.username}`}>
        <strong>{user.name}</strong>
        <span>@{user.username}</span>
      </Link>
    </div>
  )
}

export default UserCard