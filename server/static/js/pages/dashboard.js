
import { api, state } from '../app.js';

export async function renderDashboard(container) {
    container.innerHTML = '<div class="loading">Loading Dashboard...</div>';

    try {
        const [user, spending, analytics] = await Promise.all([
            api('/auth/me'),
            api('/spending?limit=5'),
            api('/analytics/spending-trends')
        ]);

        state.user = user;

        container.innerHTML = `
            <div style="padding-bottom: 2rem;">
                <h1 class="page-title">
                    <span>👋 Welcome, ${user.username}</span>
                    <span style="font-size: 1rem; opacity: 0.7; margin-left: auto;">XP: ${user.total_xp}</span>
                </h1>

                <!-- Stats Grid -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
                    
                    <!-- Spending Card -->
                    <div class="glass-card">
                        <h3 style="margin-bottom: 0.5rem; opacity: 0.8;">Recent Spending</h3>
                        <div style="font-size: 2.5rem; font-weight: 900; color: rgb(var(--color-3));">
                            $${spending.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                        </div>
                        <p style="opacity: 0.6; font-size: 0.9rem;">Last 5 transactions</p>
                    </div>

                    <!-- Wage Card -->
                    <div class="glass-card">
                        <h3 style="margin-bottom: 0.5rem; opacity: 0.8;">Hourly Reality</h3>
                        <div style="font-size: 2.5rem; font-weight: 900; color: rgb(var(--color-1));">
                            $${user.hourly_wage?.toFixed(2) || '0.00'}/hr
                        </div>
                        <p style="opacity: 0.6; font-size: 0.9rem;">Your time value</p>
                    </div>

                </div>

                <!-- Recent Activity -->
                <h2 style="margin-bottom: 1.5rem;">Recent Activity</h2>
                <div class="glass" style="border-radius: 1.5rem; overflow: hidden;">
                    ${spending.length === 0 ? '<p style="padding: 2rem; text-align: center; opacity: 0.6;">No activity yet.</p>' : `
                        <div style="display: grid; gap: 1px; background: rgba(255,255,255,0.05);">
                            ${spending.map(item => `
                                <div style="display: flex; justify-content: space-between; padding: 1.5rem; background: rgba(15, 23, 42, 0.6);">
                                    <div>
                                        <div style="font-weight: bold;">${item.category}</div>
                                        <div style="font-size: 0.85rem; opacity: 0.6;">${item.description || 'No details'}</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-weight: bold; color: rgb(248, 113, 113);">-$${item.amount.toFixed(2)}</div>
                                        <div style="font-size: 0.8rem; opacity: 0.6;">${new Date(item.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="error">Failed to load dashboard: ${err.message}</div>`;
    }
}
