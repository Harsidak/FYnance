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
                    <div class="ios-card-header">${state.t('identity')}</div>
                    <div class="ios-form">
                        <div class="ios-input-group">
                            <label class="ios-label">Username</label>
                            <div class="static-val" style="font-size: 1.5rem; font-weight: 300; color: white;">${state.user?.username || 'Guest'}</div>
                        </div>
                        <div class="ios-input-group">
                            <label class="ios-label">Email</label>
                            <div class="static-val" style="font-family: 'Outfit', sans-serif; opacity: 0.6; font-size: 0.95rem;">${state.user?.email || 'N/A'}</div>
                        </div>
                        
                         <!-- Language Selector -->
                        <div class="ios-input-group">
                            <label class="ios-label">${state.t('language')}</label>
                            <select id="profile-language" class="ios-input" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.1);">
                                <option value="en">English (Default)</option>
                                <option value="hi">Hindi (हिंदी)</option>
                                <option value="bn">Bengali (বাংলা)</option>
                                <option value="te">Telugu (తెలుగు)</option>
                                <option value="mr">Marathi (मराठी)</option>
                                <option value="ta">Tamil (தமிழ்)</option>
                                <option value="ur">Urdu (اردو)</option>
                                <option value="gu">Gujarati (ગુજરાતી)</option>
                                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                                <option value="ml">Malayalam (മലയാളം)</option>
                                <option value="or">Odia (ଓଡ଼ିଆ)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Right Column: Economics -->
                <div class="vision-card" style="border: 1px solid rgba(255,255,255,0.05);">
                    <div class="ios-card-header">${state.t('economics')}</div>
                    <div class="ios-form">
                        <!-- Currency Selector -->
                         <div class="ios-input-group">
                            <label class="ios-label">${state.t('currency')}</label>
                            <select id="profile-currency" class="ios-input" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.1);">
                                <option value="USD">USD ($)</option>
                                <option value="INR">INR (₹)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                                <option value="JPY">JPY (¥)</option>
                            </select>
                        </div>
                        
                        <div style="margin: 1.5rem 0 0.5rem 0; font-size: 0.8rem; font-weight: 600; color: var(--c-violet-neon); text-transform: uppercase; letter-spacing: 1px;">${state.t('income_stability')}</div>

                        <div class="ios-input-group">
                            <label class="ios-label">${state.t('primary_income')}</label>
                            <input type="number" id="profile-primary-income" value="${state.user?.primary_income || 0}" step="100" class="ios-input">
                        </div>
                        <div class="ios-input-group">
                            <label class="ios-label">${state.t('secondary_income')}</label>
                            <input type="number" id="profile-secondary-income" value="${state.user?.secondary_income || 0}" step="100" class="ios-input">
                        </div>
                        <div class="ios-input-group">
                            <label class="ios-label">${state.t('income_stability')}</label>
                            <select id="profile-stability" class="ios-input" style="background: rgba(0,0,0,0.3); color: white;">
                                <option value="fixed" ${state.user?.income_stability === 'fixed' ? 'selected' : ''}>${state.t('stability_fixed')}</option>
                                <option value="variable" ${state.user?.income_stability === 'variable' ? 'selected' : ''}>${state.t('stability_variable')}</option>
                                <option value="volatile" ${state.user?.income_stability === 'volatile' ? 'selected' : ''}>${state.t('stability_volatile')}</option>
                            </select>
                        </div>

                         <div style="margin: 1.5rem 0 0.5rem 0; font-size: 0.8rem; font-weight: 600; color: var(--c-green-neon); text-transform: uppercase; letter-spacing: 1px;">${state.t('assets_savings')}</div>

                        <div class="ios-input-group">
                            <label class="ios-label">${state.t('savings_strategy')} (${state.t('currency')})</label>
                            <!-- This was the hidden one, now we make it explicit 'Current Savings' but it maps to savings_balance -->
                            <input type="number" id="profile-savings" value="${state.user?.savings_balance || 0}" step="100" class="ios-input">
                        </div>
                         <div class="ios-input-group">
                            <label class="ios-label">${state.t('emergency_fund')}</label>
                            <input type="number" id="profile-emergency" value="${state.user?.emergency_fund || 0}" step="100" class="ios-input">
                        </div>
                         <div class="ios-input-group">
                            <label class="ios-label">${state.t('investments')}</label>
                            <input type="number" id="profile-investments" value="${state.user?.investments || 0}" step="100" class="ios-input">
                        </div>
                        
                        <!-- Savings Strategy Calculator (Visual only now, updates the savings input? No, existing logic calculated "savings target" based on income. 
                        Wait, existing logic was: Strategy Button -> Calculate % of Income -> Update Savings Input.
                        We should keep this logic but base it on (Primary + Secondary) Income. 
                        -->
                        <div class="ios-input-group" style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                            <label class="ios-label" style="display: flex; justify-content: space-between; align-items: center;">
                                <span>${state.t('savings_strategy')} (Auto-Calc)</span>
                                <span id="calculated-savings-display" style="color: var(--c-green-neon); font-size: 0.9rem;">${state.formatCurrency(state.user?.savings_balance || 0)}</span>
                            </label>

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
                <button id="page-logout" class="vision-btn-secondary" style="padding: 0.8rem 2rem;">${state.t('logout')}</button>
                <button id="save-profile" class="btn-primary" style="margin-top: 0; width: auto; padding: 0.8rem 2.5rem;">${state.t('save_changes')}</button>
            </div>
        </div>
    `;

    // --- Localization Layout Logic (same as before) ---
    const langSelect = document.getElementById('profile-language');
    const currSelect = document.getElementById('profile-currency');

    if (langSelect) {
        langSelect.value = state.language;
        langSelect.onchange = (e) => {
            state.setPreference('language', e.target.value);
            location.reload();
        };
    }

    if (currSelect) {
        currSelect.value = state.currency;
        currSelect.onchange = (e) => {
            state.setPreference('currency', e.target.value);
            location.reload();
        };
    }

    // --- Strategy Logic ---
    const primaryInput = document.getElementById('profile-primary-income');
    const secondaryInput = document.getElementById('profile-secondary-income');
    const savingsInput = document.getElementById('profile-savings');
    const displaySpan = document.getElementById('calculated-savings-display');
    const customInput = document.getElementById('custom-savings-input');
    const strategyBtns = document.querySelectorAll('.strategy-btn');

    let currentRate = null;

    const updateCalculation = () => {
        const primary = parseFloat(primaryInput.value) || 0;
        const secondary = parseFloat(secondaryInput.value) || 0;
        const totalIncome = primary + secondary;
        let savings = 0;

        if (currentRate === 'custom') {
            const pct = parseFloat(customInput.value) || 0;
            savings = totalIncome * (pct / 100);
            savingsInput.value = savings.toFixed(2); // Update input
        } else if (currentRate) {
            savings = totalIncome * currentRate;
            savingsInput.value = savings.toFixed(2); // Update input
        } else {
            // If no rate selected, just read the savings input valid
            savings = parseFloat(savingsInput.value) || 0;
        }

        displaySpan.textContent = state.formatCurrency(savings);
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
    // incomeInput.oninput = updateCalculation; // Removed
    primaryInput.oninput = updateCalculation;
    secondaryInput.oninput = updateCalculation;

    // --- Save & Logout Handlers --
    document.getElementById('save-profile').addEventListener('click', async () => {
        const primary = parseFloat(document.getElementById('profile-primary-income').value) || 0;
        const secondary = parseFloat(document.getElementById('profile-secondary-income').value) || 0;
        const savings = parseFloat(document.getElementById('profile-savings').value) || 0;
        const emergency = parseFloat(document.getElementById('profile-emergency').value) || 0;
        const investments = parseFloat(document.getElementById('profile-investments').value) || 0;
        const stability = document.getElementById('profile-stability').value;

        try {
            const updatedUser = await api('/users/me/profile', 'PUT', {
                primary_income: primary,
                secondary_income: secondary,
                savings_balance: savings,
                income_stability: stability,
                emergency_fund: emergency,
                investments: investments,
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
