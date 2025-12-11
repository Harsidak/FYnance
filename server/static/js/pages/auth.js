
import { api, state } from '../app.js';

export async function renderAuth(container) {
    container.innerHTML = `
        <div class="glass-card" style="max-width: 400px; margin: 4rem auto; text-align: center;">
            <h1 class="logo" style="font-size: 3rem; margin-bottom: 2rem;">FYNANCE</h1>
            
            <div id="auth-forms">
                <!-- Login Form -->
                <form id="login-form">
                    <h2 style="margin-bottom: 1.5rem;">Welcome Back</h2>
                    <input type="text" id="login-username" class="glass-input" placeholder="Username" required style="margin-bottom: 1rem;">
                    <input type="password" id="login-password" class="glass-input" placeholder="Password" required style="margin-bottom: 1rem;">
                    <button type="submit" class="btn-primary">Log In</button>
                    <p style="margin-top: 1rem; font-size: 0.9rem; color: #94a3b8;">
                        New here? <a href="#" id="show-register" style="color: rgb(var(--color-2));">Create Account</a>
                    </p>
                </form>

                <!-- Register Form (Hidden) -->
                <form id="register-form" class="hidden">
                    <h2 style="margin-bottom: 1.5rem;">Create Account</h2>
                    <input type="text" id="reg-username" class="glass-input" placeholder="Username" required style="margin-bottom: 1rem;">
                    <input type="email" id="reg-email" class="glass-input" placeholder="Email" required style="margin-bottom: 1rem;">
                    <input type="password" id="reg-password" class="glass-input" placeholder="Password" required style="margin-bottom: 1rem;">
                    <button type="submit" class="btn-primary">Sign Up</button>
                    <p style="margin-top: 1rem; font-size: 0.9rem; color: #94a3b8;">
                        Have an account? <a href="#" id="show-login" style="color: rgb(var(--color-2));">Log In</a>
                    </p>
                </form>
                <div id="auth-error" style="color: #ef4444; margin-top: 1rem; font-weight: bold;"></div>
            </div>
        </div>
    `;

    // Event Listeners
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const errorMsg = document.getElementById('auth-error');

    showRegister.onclick = (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        errorMsg.textContent = '';
    };

    showLogin.onclick = (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        errorMsg.textContent = '';
    };

    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const res = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Invalid credentials');
            const data = await res.json();

            localStorage.setItem('token', data.access_token);
            state.token = data.access_token;
            window.location.hash = '#dashboard';
        } catch (err) {
            errorMsg.textContent = err.message;
        }
    };

    registerForm.onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const res = await api('/auth/register', 'POST', { username, email, password });
            if (res) {
                // Auto login after register
                const formData = new FormData();
                formData.append('username', username);
                formData.append('password', password);

                const loginRes = await fetch('http://localhost:8000/auth/login', { method: 'POST', body: formData });
                const data = await loginRes.json();

                localStorage.setItem('token', data.access_token);
                state.token = data.access_token;
                window.location.hash = '#dashboard';
            }
        } catch (err) {
            errorMsg.textContent = "Registration failed. Username taken?";
        }
    };
}
