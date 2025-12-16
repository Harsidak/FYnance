import { state } from './state.js';

export async function api(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

    try {
        // Use relative path for deployment flexibility
        const res = await fetch(endpoint, {
            method,
            headers,
            body: body ? JSON.stringify(body) : null
        });

        if (res.status === 401) {
            logout();
            return null;
        }

        if (!res.ok) {
            const err = await res.json();
            const msg = typeof err.detail === 'object' ? JSON.stringify(err.detail) : (err.detail || 'API Error');
            throw new Error(msg);
        }

        return await res.json();
    } catch (e) {
        console.error("API Call Failed:", e);
        throw e;
    }
}

export function logout() {
    localStorage.removeItem('token');
    state.token = null;
    state.user = null;
    window.location.hash = '#auth';
}
