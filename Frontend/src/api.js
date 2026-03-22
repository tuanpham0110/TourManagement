const BASE_URL = 'http://localhost:5000/api';

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('token');

    const response = await fetch(`${BASE_URL}${path}`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        ...options
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}