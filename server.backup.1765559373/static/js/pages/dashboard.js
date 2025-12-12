
import { api, state } from '../app.js';

export async function renderDashboard(container) {
    container.innerHTML = '<div class="loading">Initializing Control Center...</div>';

    try {
        // Fetch Data Parallel: User, Spending, Trends, AI Prediction
        const [user, spending, analytics, aiData] = await Promise.all([
            api('/auth/me'),
            api('/spending?limit=5'),
            api('/analytics/spending-trends'),
            api('/ai/predict', 'POST', { // Fetch AI Prediction
                spending_history: [], // Backend handles empty history or fetches from DB
                income: 4000
            }).catch(() => null) // Fail gracefully if AI is offline
        ]);

        state.user = user;

        // Calculate Status
        const totalSpent = spending.reduce((acc, curr) => acc + curr.amount, 0);
        const systemStatus = totalSpent > 2000 ? 'ATTENTION' : 'OPTIMIZED';
        const statusColor = systemStatus === 'OPTIMIZED' ? 'var(--c-green-neon)' : '#ff4444';

        container.innerHTML = `
            <div class="control-center fade-in">
                <!-- 1. HUD Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <div class="text-caption" style="letter-spacing: 2px;">SYSTEM STATUS</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: ${statusColor}; text-shadow: 0 0 20px ${statusColor};">
                            ${systemStatus}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="text-caption">NET LINK</div>
                        <div style="font-family: monospace; color: var(--ios-text-secondary);">ONLINE // V2.0</div>
                    </div>
                </div>

                <!-- 2. Pulse Grid (Vital Stats) -->
                <div class="bento-grid" style="margin-bottom: 1.5rem;">
                    
                    <!-- Safety Budget -->
                    <div class="glass-card-3d" style="background: linear-gradient(135deg, rgba(0, 195, 154, 0.1), transparent);">
                        <div class="ios-card-header">
                            <i data-lucide="shield" style="width: 16px; margin-right: 8px;"></i> Safe-to-Spend
                        </div>
                        <div class="stat-value text-green">$42.50</div>
                        <div class="text-caption">Daily Allowance</div>
                    </div>

                    <!-- Reality Check -->
                    <div class="glass-card-3d">
                        <div class="ios-card-header">
                            <i data-lucide="clock" style="width: 16px; margin-right: 8px;"></i> Time Cost
                        </div>
                        <div class="stat-value text-primary">${user.hourly_wage ? '$' + user.hourly_wage : 'N/A'}</div>
                        <div class="text-caption">Hourly Value</div>
                    </div>
                </div>

                <!-- 3. AI Insight Panel -->
                <div class="glass-card-3d" style="margin-bottom: 2rem; border-left: 3px solid var(--c-violet-neon);">
                    <div class="ios-card-header" style="color: var(--c-violet-neon);">
                        <i data-lucide="brain-circuit" style="width: 18px; margin-right: 8px;"></i>
                        Fin.AI Analysis
                    </div>
                    <div style="font-size: 1.1rem; line-height: 1.5; margin-top: 0.5rem;">
                        ${aiData ? aiData.risk_assessment : "Systems initializing... Gather more data for precise prediction."}
                    </div>
                    ${aiData && aiData.predicted_risk_score > 50 ?
                `<div style="margin-top: 0.5rem; color: #ff4444; font-size: 0.9rem;">⚠️ High spending velocity detected.</div>` :
                `<div style="margin-top: 0.5rem; color: var(--ios-text-secondary); font-size: 0.9rem;">Trajectory stable. Keep it up.</div>`
            }
                </div>

                <!-- 4. Quick Actions -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <button class="vision-btn-secondary" onclick="window.location.hash='#spending'" style="flex-direction: column; height: 80px; justify-content: center; gap: 5px;">
                        <i data-lucide="plus-circle"></i>
                        <span style="font-size: 0.8rem;">Log</span>
                    </button>
                    <button class="vision-btn-secondary" onclick="window.location.hash='#ai'" style="flex-direction: column; height: 80px; justify-content: center; gap: 5px;">
                        <i data-lucide="message-circle"></i>
                        <span style="font-size: 0.8rem;">Ask Fin</span>
                    </button>
                    <button class="vision-btn-secondary" onclick="window.location.hash='#goals'" style="flex-direction: column; height: 80px; justify-content: center; gap: 5px;">
                        <i data-lucide="target"></i>
                        <span style="font-size: 0.8rem;">Goal</span>
                    </button>
                     <button class="vision-btn-secondary" onclick="window.location.hash='#mood'" style="flex-direction: column; height: 80px; justify-content: center; gap: 5px;">
                        <i data-lucide="smile"></i>
                        <span style="font-size: 0.8rem;">Mood</span>
                    </button>
                </div>

                <!-- 5. Recent Activity Feed -->
                <h3 class="ios-card-header" style="margin-left: 0.5rem; margin-bottom: 1rem;">Live Feed</h3>
                <div class="ios-list">
                    ${spending.length === 0 ? '<div style="padding: 1.5rem; text-align: center; color: var(--ios-text-secondary);">No data stream.</div>' : `
                        ${spending.map(item => `
                            <div class="ios-list-item" style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--c-violet-neon); box-shadow: 0 0 10px var(--c-violet-neon);"></div>
                                    <div>
                                        <div class="text-bold">${item.category}</div>
                                        <div class="text-caption">${item.description || 'Unknown'}</div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div class="text-bold" style="color: var(--c-white);">-$${item.amount.toFixed(0)}</div>
                                    <div class="text-caption">${new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                </div>
                            </div>
                        `).join('')}
                    `}
                </div>
            </div>
        `;

        // Re-init icons for the new content
        if (window.lucide) window.lucide.createIcons();

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="error">System Failure: ${err.message}</div>`;
    }
}
