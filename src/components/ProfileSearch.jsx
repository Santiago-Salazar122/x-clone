
import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { apiRequest } from '../services/api'

function ProfileSearch() {
    const [searchUsername, setSearchUsername] = useState('')
    const [searchError, setSearchError] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const { token } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const query = searchUsername.trim().replace(/^@/, '')

        if (query.length < 2 || !token) {
            setSuggestions([])
            setShowSuggestions(false)
            return
        }

        const timeoutId = setTimeout(async () => {
            try {
                const users = await apiRequest(
                    `/api/users/search?query=${encodeURIComponent(query)}`
                )

                setSuggestions(users)
                setShowSuggestions(true)
            } catch (error) {
                console.error('Error loading user suggestions:', error)
                setSuggestions([])
                setShowSuggestions(false)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchUsername, token])

    async function openProfile() {
        const username = searchUsername.trim().replace(/^@/, '')

        if (!username) {
            setSearchError('Escribe un nombre de usuario.')
            return
        }

        try {
            await apiRequest(
                `/api/users/${encodeURIComponent(username)}`
            )

            setSearchError('')
            navigate(`/users/${encodeURIComponent(username)}`)
        } catch (error) {
            console.error('Error searching profile:', error)

            if (error.status === 404) {
                setSearchError('No se encontró ese usuario.')
                return
            }

            setSearchError('No se pudo conectar con el servidor.')
        }
    }

    return (
        <section className="profile-search">


            <form
                onSubmit={(event) => {
                    event.preventDefault()
                    openProfile()
                }}
            >
                <div className="profile-search-input">
                    <Search size={20} />


                    <input
                        type="text"
                        placeholder="Buscar"
                        value={searchUsername}
                        onChange={(event) => {
                            setSearchUsername(event.target.value)
                            setSearchError('')
                        }}
                    />

                </div>

            </form>

            {showSuggestions && suggestions.length > 0 && (
                <div className="profile-search-results">
                    {suggestions.map((user) => (
                        <button
                            key={user.id}
                            type="button"
                            className="profile-search-suggestion"
                            onClick={() => {
                                setSearchUsername(user.username)
                                setSearchError('')
                                setSuggestions([])
                                setShowSuggestions(false)
                                navigate(`/users/${encodeURIComponent(user.username)}`)
                            }}
                        >
                            <div>
                                <strong>{user.name}</strong>
                                <span>@{user.username}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {searchError && <p>{searchError}</p>}
        </section>
    )
}

export default ProfileSearch
