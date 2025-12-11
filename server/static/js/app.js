
import { renderAuth } from './pages/auth.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderSpending } from './pages/spending.js';
import { renderGoals } from './pages/goals.js';
import { renderMood } from './pages/mood.js';
import { renderSubscriptions } from './pages/subscriptions.js';
import { renderAI } from './pages/ai.js';

const routes = {
    'auth': renderAuth,
    'dashboard': renderDashboard,
    'spending': renderSpending,
    'goals': renderGoals,
    'mood': renderMood,
    'subscriptions': renderSubscriptions,
    'ai': renderAI
};

// Global State
export const state = {
    user: null,
    token: localStorage.getItem('token')
};

// API Wrapper
export async function api(endpoint, method = 'GET', body = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

    try {
        const res = await fetch(`http://localhost:8000${endpoint}`, {
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
            throw new Error(err.detail || 'API Error');
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

async function router() {
    let hash = window.location.hash.slice(1) || 'dashboard';

    // Auth Guard
    if (!state.token && hash !== 'auth') {
        window.location.hash = '#auth';
        return;
    }

    if (state.token && hash === 'auth') {
        window.location.hash = '#dashboard';
        return;
    }

    // Update Navbar
    const nav = document.getElementById('navbar');
    if (hash === 'auth') {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-link[data-page="${hash}"]`);
        if (activeLink) activeLink.classList.add('active');
    }

    // Render Page
    const app = document.getElementById('main-content');
    app.innerHTML = '<div class="loading">Loading...</div>';

    if (routes[hash]) {
        try {
            // Trigger Enter Animation
            app.classList.remove('page-enter');
            void app.offsetWidth; // Force reflow
            app.classList.add('page-enter');

            await routes[hash](app);
        } catch (e) {
            app.innerHTML = `<div class="error">Error loading page: ${e.message}</div>`;
        }
    } else {
        app.innerHTML = '<h1>404 - Page Not Found</h1>';
    }

    // Re-initialize icons
    if (window.lucide) window.lucide.createIcons();
}

window.addEventListener('hashchange', router);
window.addEventListener('load', () => {
    document.getElementById('logout-btn').addEventListener('click', logout);
    router();
});
