import { api } from '../api.js';
import { state } from '../state.js';

export async function renderSubscriptions(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h1 class="page-title">${state.t('subs') || 'Subscriptions'}</h1>
            
            <div style="display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                
                <!-- Add Subscription -->
                <div class="glass-card">
                    <h2 style="margin-bottom: 1.5rem;">${state.t('add_sub')}</h2>
                    <form id="sub-form" style="display: grid; gap: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">${state.t('sub_name')}</label>
                            <input type="text" name="name" class="glass-input" placeholder="${state.t('sub_name_placeholder')}" required>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">${state.t('amount')} (${state.currencySymbols[state.currency]})</label>
                            <input type="number" step="0.01" name="amount" class="glass-input" required>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">${state.t('billing_cycle')}</label>
                            <select name="billing_cycle" class="glass-input">
                                <option value="Monthly" style="color: black;">${state.t('cycle_monthly')}</option>
                                <option value="Yearly" style="color: black;">${state.t('cycle_yearly')}</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">${state.t('next_due')} (${state.t('optional')})</label>
                            <input type="date" name="next_due" class="glass-input" required>
                        </div>

                        <button type="submit" class="btn-primary">${state.t('add_sub')}</button>
                    </form>
                </div>

                <!-- List -->
                <div class="glass-card">
                    <h2 style="margin-bottom: 1.5rem;">${state.t('active_suffix') ? 'Active ' + state.t('subs') : 'Active Subscriptions'}</h2>
                    <div id="sub-list" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="loading">Loading...</div>
                    </div>
                </div>

            </div>
        </div>
    `;

    const form = document.getElementById('sub-form');
    const listContainer = document.getElementById('sub-list');

    const loadSubs = async () => {
        try {
            const subs = await api('/subscriptions');
            renderList(subs);
        } catch (err) {
            listContainer.innerHTML = `<div class="error">Error: ${err.message}</div>`;
        }
    };

    const renderList = (subs) => {
        if (!subs.length) {
            listContainer.innerHTML = `<p style="opacity: 0.6; text-align: center;">${state.t('no_data')}</p>`;
            return;
        }

        const totalMonthly = subs.reduce((acc, curr) => {
            return acc + (curr.billing_cycle === 'Monthly' ? curr.cost : curr.cost / 12);
        }, 0);

        listContainer.innerHTML = `
            <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(var(--color-2), 0.2); border-radius: 1rem; text-align: center;">
                <div style="font-size: 0.9rem; opacity: 0.8;">${state.t('total_monthly_cost')}</div>
                <div style="font-size: 1.5rem; font-weight: bold;">${state.formatCurrency(totalMonthly)}</div>
            </div>
            ${subs.map(s => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 1rem;">
                    <div>
                        <div style="font-weight: bold;">${s.name}</div>
                        <div style="font-size: 0.8rem; opacity: 0.6;">${state.t('next_due')}: ${s.next_due_date ? new Date(s.next_due_date).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: bold;">${state.formatCurrency(s.cost)}</div>
                        <div style="font-size: 0.8rem; opacity: 0.6;">${s.billing_cycle}</div>
                    </div>
                </div>
            `).join('')}
        `;
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = {
            name: formData.get('name'),
            cost: state.convertToUSD(parseFloat(formData.get('amount'))),
            billing_cycle: formData.get('billing_cycle'),
            next_due_date: formData.get('next_due')
        };

        try {
            await api('/subscriptions', 'POST', payload);
            form.reset();
            loadSubs();
        } catch (err) {
            alert("Failed to add subscription: " + err.message);
        }
    };

    loadSubs();
}
