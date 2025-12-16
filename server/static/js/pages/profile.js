import { state } from '../state.js';
import { api, logout } from '../api.js';

export async function renderProfile(container) {
    container.innerHTML = `
        <div class="glass-card-3d fade-in" style="max-width: 1000px; margin: 0 auto; padding: 3rem;">
            <div class="profile-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
                <h1 class="page-title" style="margin-bottom: 0;">User Profile</h1>
                <div class="user-badge" style="background: rgba(255,255,255,0.1); padding: 0.6rem 1.2rem; border-radius: var(--radius-pill); font-size: 0.85rem; border: 1px solid rgba(255,255,255,0.1);">
                    Legacy Member
                </div>
            </div>

            <div class="profile-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
                <!-- Left Column: Identity -->
                <div class="vision-card" style="border: 1px solid rgba(255,255,255,0.05);">
                    <div class="ios-card-header">Identity</div>
                    <div class="ios-form">
                        <div class="ios-input-group">
                            <label class="ios-label">Username</label>
                            <div class="static-val" style="font-size: 1.5rem; font-weight: 300; color: white;">${state.user?.username || 'Guest'}</div>
                        </div>
                        <div class="ios-input-group">
                            <label class="ios-label">Email</label>
                            <div class="static-val" style="font-family: 'Outfit', sans-serif; opacity: 0.6; font-size: 0.95rem;">${state.user?.email || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Economics -->
                <div class="vision-card" style="border: 1px solid rgba(255,255,255,0.05);">
                    <div class="ios-card-header">Economics</div>
                    <div class="ios-form">
                        <div class="ios-input-group">
                            <label class="ios-label">Hourly Wage ($)</label>
                            <input type="number" id="profile-wage" value="${state.user?.hourly_wage || 0}" step="0.1" class="ios-input">
                        </div>
                        <div class="ios-input-group">
                            <label class="ios-label">Monthly Income ($)</label>
                            <input type="number" id="profile-income" value="${state.user?.monthly_income || 0}" step="0.1" class="ios-input">
                        </div>
                        <div class="ios-input-group">
                            <label class="ios-label">Savings Balance ($)</label>
                            <input type="number" id="profile-savings" value="${state.user?.savings_balance || 0}" step="0.1" class="ios-input">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="actions" style="margin-top: 3rem; display: flex; gap: 1.5rem; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 2rem;">
                <button id="page-logout" class="vision-btn-secondary" style="padding: 0.8rem 2rem;">Logout</button>
                <button id="save-profile" class="btn-primary" style="margin-top: 0; width: auto; padding: 0.8rem 2.5rem;">Save Changes</button>
            </div>
        </div>
    `;

    document.getElementById('save-profile').addEventListener('click', async () => {
        const wage = parseFloat(document.getElementById('profile-wage').value) || 0;
        const income = parseFloat(document.getElementById('profile-income').value) || 0;
        const savings = parseFloat(document.getElementById('profile-savings').value) || 0;

        // Remove context from update as it's no longer in UI

        try {
            const updatedUser = await api('/users/me/profile', 'PUT', {
                hourly_wage: wage,
                monthly_income: income,
                savings_balance: savings,
                financial_context: state.user?.financial_context || '' // Keep existing context if any, or empty
            });

            if (updatedUser) {
                state.user = updatedUser;
                alert('Profile updated successfully!');
            }
        } catch (e) {
            alert('Failed to update profile: ' + e.message);
        }
    });

    document.getElementById('page-logout').addEventListener('click', () => {
        logout();
    });
}
