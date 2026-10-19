
import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'
import { useAuth } from './AuthContext'

const FollowContext = createContext()

function getSavedFollows() {
  try {
    const savedFollows = localStorage.getItem('x-clone-follows')
    return savedFollows ? JSON.parse(savedFollows) : []
  } catch {
    return []
  }
}

export function FollowProvider({ children }) {
  const [follows, setFollows] = useState(getSavedFollows)
  const { currentUser } = useAuth()

  useEffect(() => {
    localStorage.setItem('x-clone-follows', JSON.stringify(follows))
  }, [follows])

  function followUser(username) {
    if (!currentUser || !username) {
      return false
    }

    const followerUsername = currentUser.username
    const followedUsername = username.replace(/^@/, '')

    if (followerUsername === followedUsername) {
      return false
    }

    const alreadyFollowing = follows.some(
      (follow) =>
        follow.followerUsername === followerUsername &&
        follow.followedUsername === followedUsername
    )

    if (alreadyFollowing) {
      return false
    }

    setFollows((currentFollows) => [
      ...currentFollows,
      {
        followerUsername,
        followedUsername,
        createdAt: new Date().toISOString()
      }
    ])

    return true
  }

  function isFollowing(username) {
    if (!currentUser || !username) {
      return false
    }

    const targetUsername = username.replace(/^@/, '')

    return follows.some(
      (follow) =>
        follow.followerUsername === currentUser.username &&
        follow.followedUsername === targetUsername
    )
  }

  function getFollowersCount(username) {
    const targetUsername = username.replace(/^@/, '')

    return follows.filter(
      (follow) => follow.followedUsername === targetUsername
    ).length
  }

  function getFollowingCount(username) {
    const targetUsername = username.replace(/^@/, '')

    return follows.filter(
      (follow) => follow.followerUsername === targetUsername
    ).length
  }

  return (
    <FollowContext.Provider
      value={{
        follows,
        followUser,
        isFollowing,
        getFollowersCount,
        getFollowingCount
      }}
    >
      {children}
    </FollowContext.Provider>
  )
}

export function useFollows() {
  return useContext(FollowContext)
}
