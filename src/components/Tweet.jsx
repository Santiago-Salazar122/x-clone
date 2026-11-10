
function Tweet({ post }) {
  return (
    <article className="post">
      <h3>{post.user.name}</h3>
      <p>@{post.user.username}</p>
      <p>{post.content}</p>
      <p>
        {new Date(post.createdAt).toLocaleString()}
      </p>
    </article>
  )
}

export default Tweet
