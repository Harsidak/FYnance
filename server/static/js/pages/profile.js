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
                        
                        <!-- Savings Strategy Section -->
                        <div class="ios-input-group" style="margin-top: 1rem;">
                            <label class="ios-label" style="display: flex; justify-content: space-between; align-items: center;">
                                <span>Savings Strategy</span>
                                <span id="calculated-savings-display" style="color: var(--c-green-neon); font-size: 0.9rem;">$${state.user?.savings_balance || 0}</span>
                            </label>
                            
                            <!-- Hidden input for form submission -->
                            <input type="hidden" id="profile-savings" value="${state.user?.savings_balance || 0}">

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <button class="strategy-btn nav-btn" data-rate="0.1" style="font-size: 0.8rem; justify-content: center; border-radius: 12px;">
                                    Stealth (10%)
                                </button>
                                <button class="strategy-btn nav-btn" data-rate="0.3" style="font-size: 0.8rem; justify-content: center; border-radius: 12px;">
                                    Progressive (30%)
                                </button>
                                <button class="strategy-btn nav-btn" data-rate="0.5" style="font-size: 0.8rem; justify-content: center; border-radius: 12px;">
                                    Aggressive (50%)
                                </button>
                                <button class="strategy-btn nav-btn" data-rate="custom" style="font-size: 0.8rem; justify-content: center; border-radius: 12px;">
                                    Custom
                                </button>
                            </div>

                            <input type="number" id="custom-savings-input" placeholder="Enter % (e.g. 20)" class="ios-input hidden" style="margin-top: 0.5rem;" max="100" min="0">
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

    // --- Strategy Logic ---
    const incomeInput = document.getElementById('profile-income');
    const savingsInput = document.getElementById('profile-savings');
    const displaySpan = document.getElementById('calculated-savings-display');
    const customInput = document.getElementById('custom-savings-input');
    const strategyBtns = document.querySelectorAll('.strategy-btn');

    let currentRate = null;

    const updateCalculation = () => {
        const income = parseFloat(incomeInput.value) || 0;
        let savings = 0;

        if (currentRate === 'custom') {
            const pct = parseFloat(customInput.value) || 0;
            savings = income * (pct / 100);
        } else if (currentRate) {
            savings = income * currentRate;
        } else {
            // Default or Initial State - keep existing savings or calculate reverse rate?
            // For now, respect the value already in hidden input if we haven't touched buttons
            savings = parseFloat(savingsInput.value) || 0;
        }

        savingsInput.value = savings.toFixed(2);
        displaySpan.textContent = `$${savings.toFixed(2)}`;
    };

    strategyBtns.forEach(btn => {
        btn.onclick = (e) => {
            // Visual Selection
            strategyBtns.forEach(b => {
                b.style.background = 'var(--surface-2)';
                b.style.borderColor = 'rgba(255,255,255,0.1)';
            });
            btn.style.background = 'rgba(var(--p-green-mint), 0.2)';
            btn.style.borderColor = 'rgb(var(--p-green-mint))';

            // Logic
            currentRate = btn.dataset.rate === 'custom' ? 'custom' : parseFloat(btn.dataset.rate);

            if (currentRate === 'custom') {
                customInput.classList.remove('hidden');
                customInput.focus();
            } else {
                customInput.classList.add('hidden');
                updateCalculation();
            }
        };
    });

    customInput.oninput = updateCalculation;
    incomeInput.oninput = updateCalculation;

    // --- Save & Logout Handlers --
    document.getElementById('save-profile').addEventListener('click', async () => {
        const wage = parseFloat(document.getElementById('profile-wage').value) || 0;
        const income = parseFloat(document.getElementById('profile-income').value) || 0;
        const savings = parseFloat(document.getElementById('profile-savings').value) || 0;

        try {
            const updatedUser = await api('/users/me/profile', 'PUT', {
                hourly_wage: wage,
                monthly_income: income,
                savings_balance: savings,
                financial_context: state.user?.financial_context || ''
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
