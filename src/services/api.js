const API_URL = import.meta.env.VITE_API_URL

export async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('x-clone-token')

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...(options.body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        }
    })

    const data = await response.json().catch(() => null)
    if (response.status === 401) {
        window.dispatchEvent(new Event('x-clone-unauthorized'))
    }

    if (!response.ok) {
        const error = new Error(data?.message || 'Error en la solicitud')
        error.status = response.status
        throw error
    }

    return data
}