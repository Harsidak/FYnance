import { renderAuth } from './pages/auth.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderSpending } from './pages/spending.js';
import { renderGoals } from './pages/goals.js';
import { renderMood } from './pages/mood.js';
import { renderSubscriptions } from './pages/subscriptions.js';
import { renderAI } from './pages/ai.js';
import { renderSimulation } from './pages/simulation.js';
import { renderProfile } from './pages/profile.js';
import { renderFinChat } from './pages/fin.js';
import { state } from './state.js';

// --- Localization Helper ---
const updateNavTranslations = () => {
    document.querySelectorAll('.nav-item').forEach(el => {
        const key = el.dataset.page;
        const span = el.querySelector('span');
        if (key && span) {
            // Special cases mapping if needed, otherwise direct key
            let tKey = key;
            if (key === 'ai') tKey = 'ai'; // Matches
            if (key === 'fin') tKey = 'fin_nav'; // Mapped in translations.js
            if (key === 'subscriptions') tKey = 'subs'; // Mapped
            span.textContent = state.t(tKey);
        }
    });
};
import ColorBends from './components/color-bends.js';

import { api, logout } from './api.js';

// Init Background
// Init Background (Moved to load event)

// Global State Extension
state.realityMode = false;
// Global State Extension
state.realityMode = false;

// 🔥 RESTORE TOKEN ON PAGE LOAD (SAFARI FIX)
const savedToken = localStorage.getItem('token');
if (savedToken) {
    state.token = savedToken;
}

const routes = {
    'auth': renderAuth,
    'dashboard': renderDashboard,
    'spending': renderSpending,
    'goals': renderGoals,
    'mood': renderMood,
    'ai': renderAI,
    'simulation': renderSimulation,
    'subscriptions': renderSubscriptions,
    'profile': renderProfile,
    'fin': renderFinChat
};

// API Wrapper and Logout moved to api.js

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
        document.querySelectorAll('.nav-item').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-item[data-page="${hash}"]`);
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
    const hamburger = document.getElementById('hamburger');
    const navbar = document.querySelector(".nav-items");

    // Hamburger menu (mobile / iPad)
    if (hamburger && navbar) {
        hamburger.addEventListener('click', () => {
            navbar.classList.toggle('open');
        });
    }

    // Init Background
    const bgContainer = document.getElementById('color-bends-canvas');
    if (bgContainer && window.ColorBends) {
        new ColorBends(bgContainer, {
            colors: ["#ff5c7a", "#8a5cff", "#00ffd1"],
            rotation: 0,
            speed: 0.2,
            scale: 1,
            frequency: 1,
            warpStrength: 1,
            mouseInfluence: 1,
            parallax: 0.5,
            noise: 0.1,
            transparent: true
        });
    }

    // Update navbar language
    if (typeof updateNavTranslations === "function") {
        updateNavTranslations();
    }

    // Start app
    router();
});           
