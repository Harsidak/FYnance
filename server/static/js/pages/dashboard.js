
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
                    Good Evening, ${user.username}
                </h1>

                <!-- Stats Grid (Bento) -->
                <div class="bento-grid">
                    
                    <!-- Spending Card -->
                    <div class="stat-card">
                        <div class="ios-card-header">Recent Spending</div>
                        <div class="stat-value text-primary">
                            $${spending.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                        </div>
                        <div class="text-caption">Last 5 transactions</div>
                    </div>

                    <!-- Wage Card -->
                    <div class="stat-card">
                        <div class="ios-card-header">Time Value</div>
                        <div class="stat-value text-green">
                            $${user.hourly_wage?.toFixed(2) || '0.00'}
                        </div>
                        <div class="text-caption">Hourly Reality</div>
                    </div>

                </div>

                <!-- Recent Activity -->
                <h3 class="ios-card-header" style="margin-left: 1rem; margin-bottom: 0.5rem;">Recent Activity</h3>
                <div class="ios-list">
                    ${spending.length === 0 ? '<div style="padding: 1.5rem; text-align: center; color: var(--ios-text-secondary);">No activity yet.</div>' : `
                        ${spending.map(item => `
                            <div class="ios-list-item">
                                <div>
                                    <div class="text-bold">${item.category}</div>
                                    <div class="text-caption">${item.description || 'No details'}</div>
                                </div>
                                <div style="text-align: right;">
                                    <div class="text-bold text-primary">-$${item.amount.toFixed(2)}</div>
                                    <div class="text-caption">${new Date(item.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="error">Failed to load dashboard: ${err.message}</div>`;
    }
}
