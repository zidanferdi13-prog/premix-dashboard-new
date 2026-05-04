import { API_BASE_URL } from '../constants'

const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`)
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
    return res.json()
  },

  post: async (endpoint, body) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
    return res.json()
  },

  put: async (endpoint, body) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
    return res.json()
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
    return res.json()
  },
}

export default api
