// API helper for communicating with local Express backend.
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export async function apiPost(path: string, body: any, token?: string){
	const res = await fetch(`${API_BASE}${path}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {})
		},
		body: JSON.stringify(body)
	})
	return res.json()
}

export default { apiPost }
