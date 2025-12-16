import { api } from '../api.js';
import { state } from '../state.js';

export async function renderDashboard(container) {
    container.innerHTML = '<div class="loading">Initializing Control Center...</div>';

    try {
        // Fetch All Required Data for "Safe to Spend" Calc
        const [user, spending, trends, socialPulse, subs, goals] = await Promise.all([
            api('/auth/me'),
            api('/spending?limit=100'), // Need more history for StdDev
            api('/analytics/spending-trends'),
            api('/social/pulse').catch(() => null),
            api('/subscriptions').catch(() => []),
            api('/goals').catch(() => [])
        ]);

        state.user = user;

        // --- 1. Calculate Volatility (StdDev of Daily Spending) ---
        // Group spending by date
        const dailySpending = {};
        spending.forEach(t => {
            const date = t.date.split('T')[0]; // YYYY-MM-DD
            dailySpending[date] = (dailySpending[date] || 0) + t.amount;
        });

        const dailyValues = Object.values(dailySpending);
        let stdDevDaily = 0;

        if (dailyValues.length > 1) {
            const mean = dailyValues.reduce((a, b) => a + b, 0) / dailyValues.length;
            const variance = dailyValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dailyValues.length;
            stdDevDaily = Math.sqrt(variance); // Daily Volatility
        }

        // --- 2. Calculate Monthly Deductibles ---

        // A. Subscriptions (Fixed Bills)
        const monthlySubs = subs.reduce((acc, sub) => {
            if (sub.billing_cycle === 'Yearly') return acc + (sub.cost / 12);
            return acc + sub.cost;
        }, 0);

        // B. Savings Goals (Monthly Requirements)
        const monthlySavingsDemand = goals.reduce((acc, goal) => {
            if (goal.current_amount >= goal.target_amount) return acc;

            const remaining = goal.target_amount - goal.current_amount;
            let monthsToDeadline = 12; // Default if no deadline

            if (goal.deadline) {
                const today = new Date();
                const due = new Date(goal.deadline);
                const diffTime = Math.abs(due - today);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                monthsToDeadline = Math.max(diffDays / 30, 1); // Avoid div by zero
            }

            return acc + (remaining / monthsToDeadline);
        }, 0);

        // C. Volatility Buffer (Risk) - User requested "standard deviation ... added" to fixed bills
        const volatilityBuffer = stdDevDaily * 30;

        // --- 3. Final Safe-to-Spend Calculation (Time-Dynamic) ---
        const monthlyIncome = user.monthly_income || 0;
        const totalMonthlyFixedCosts = monthlySubs + monthlySavingsDemand + volatilityBuffer;

        // A. Calculate Spent So Far This Month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const spentThisMonth = spending.reduce((acc, t) => {
            const tDate = new Date(t.date);
            if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
                return acc + t.amount;
            }
            return acc;
        }, 0);

        // B. Calculate Days Remaining
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysRemaining = Math.max(daysInMonth - now.getDate() + 1, 1); // Include today

        // C. True Daily Allowance
        // (Income - Fixed Costs - What You Already Spent) / Days Left
        const totalDisposableForMonth = monthlyIncome - totalMonthlyFixedCosts;
        const remainingDisposable = totalDisposableForMonth - spentThisMonth;

        let dailySafeSpend = remainingDisposable / daysRemaining;

        // Handle Negative Scenarios (Over Budget)
        if (dailySafeSpend < 0) dailySafeSpend = 0;


        // Fetch AI Prediction (Keep existing logic)
        const aiData = await api('/ai/predict', 'POST', {
            user_id: user.id,
            transactions: spending.slice(0, 5).map(t => ({ // Only send recent 5 to AI to save tokens
                amount: t.amount,
                category: t.category,
                timestamp: new Date(t.date).toISOString()
            })),
            mood_logs: []
        }).catch(err => {
            console.warn("AI Offline:", err);
            return null;
        });

        // Determine System Status
        const totalSpentRecent = spending.slice(0, 30).reduce((acc, curr) => acc + curr.amount, 0); // Last ~30 txns
        const userSavings = state.user?.savings_balance || 0;

        let systemStatus = 'STABLE';
        let statusColor = 'var(--c-green-neon)';

        if (dailySafeSpend < 10) { // Less than $10/day is tight
            systemStatus = 'CRITICAL';
            statusColor = '#ff4444';
        } else if (monthlyDisposable > 1000 && userSavings > 2000) {
            systemStatus = 'FORTIFIED';
            statusColor = '#00f7ff'; // Cyan
        }

        // Create Aggregated Goals Logic (Total Goals Progress)
        let goalContent = '';
        if (goals.length > 0) {
            const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
            const totalCurrent = goals.reduce((sum, g) => sum + g.current_amount, 0);
            const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

            // Calculate total monthly need across all active deadlines
            let totalMonthlyNeed = 0;
            goals.forEach(g => {
                if (g.deadline && g.current_amount < g.target_amount) {
                    const daysToGoal = Math.ceil((new Date(g.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                    if (daysToGoal > 0) {
                        const monthsToGoal = daysToGoal / 30;
                        totalMonthlyNeed += (g.target_amount - g.current_amount) / monthsToGoal;
                    }
                }
            });

            goalContent = `
                <div class="ios-card-header" style="justify-content: space-between; display: flex;">
                    <span><i data-lucide="crosshair" style="width: 16px; margin-right: 8px;"></i> Total Goal Targets</span>
                    <span style="opacity: 0.7;">${goals.length} Active</span>
                </div>
                <div style="margin-top: 10px; display: flex; align-items: baseline; justify-content: space-between;">
                    <div class="stat-value" style="font-size: 2rem;">${overallProgress.toFixed(0)}%</div>
                    <div style="font-size: 0.8rem; opacity: 0.6;">$${totalCurrent.toFixed(0)} / $${totalTarget.toFixed(0)}</div>
                </div>
                <div style="background: rgba(255,255,255,0.1); height: 6px; border-radius: 10px; margin: 10px 0; overflow: hidden;">
                    <div style="width: ${Math.min(overallProgress, 100)}%; background: var(--c-violet-neon); height: 100%; box-shadow: 0 0 10px var(--c-violet-neon);"></div>
                </div>

            `;
        } else {
            goalContent = `
                 <div class="ios-card-header">
                    <i data-lucide="crosshair" style="width: 16px; margin-right: 8px;"></i> Target Lock
                </div>
                <div style="text-align: center; padding: 1.5rem 0; opacity: 0.6;">
                    No active targets.<br>
                    <a href="#goals" style="color: var(--c-violet-neon); text-decoration: none; font-weight: bold;">Set a Goal</a>
                </div>
            `;
        }


        container.innerHTML = `
            <div class="control-center fade-in">
                <!-- 1. HUD Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <div class="text-caption" style="letter-spacing: 2px;">WEALTH HEALTH</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: ${statusColor}; text-shadow: 0 0 20px ${statusColor};">
                            ${systemStatus}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="text-caption">${state.t('system_status')}</div>
                        <div style="font-family: monospace; color: var(--ios-text-secondary);">${state.t('online')} // V2.2</div>
                    </div>
                </div>

                <!-- 2. Pulse Grid (Vital Stats) -->
                <div class="bento-grid" style="margin-bottom: 1.5rem;">
                    
                    <!-- Safety Budget -->
                    <div class="glass-card-3d">
                        <div class="ios-card-header">
                            <i data-lucide="shield" style="width: 16px; margin-right: 8px;"></i> ${state.t('safe_to_spend')}
                        </div>
                        <div class="stat-value text-green">${state.formatCurrency(dailySafeSpend)}</div>
                        <div class="text-caption">${state.t('daily_allowance')}</div>
                        <div style="font-size: 0.7rem; opacity: 0.5; margin-top: 5px;">
                            (Rem. Budget - Spent) / ${daysRemaining} Days
                        </div>
                    </div>

                    <!-- Target Lock (Active Goal) -->
                    <div class="glass-card-3d">
                        ${goalContent}
                    </div>
                </div>

                <!-- 3. AI Insight Panel (Future Self) -->
                <div class="glass-card-3d" style="margin-bottom: 2rem; border-left: 3px solid var(--c-violet-neon);">
                    <div class="ios-card-header" style="color: var(--c-violet-neon); display: flex; justify-content: space-between;">
                        <span><i data-lucide="brain-circuit" style="width: 18px; margin-right: 8px;"></i> ${state.t('fin_analysis')}</span>
                        <span>${aiData && aiData.future_self_status === 'happy' ? '🤩' : (aiData && aiData.future_self_status === 'stressed' ? '😫' : '😐')}</span>
                    </div>
                    <div style="font-size: 1.1rem; line-height: 1.5; margin-top: 0.5rem;">
                        ${aiData ? (aiData.risk_assessment || aiData.recommended_intervention || aiData.trigger_reason || "Systems initializing... Gather more data for precise prediction.") : "Systems initializing... Gather more data for precise prediction."}
                    </div>
                    ${(aiData && (aiData.risk_score > 0.5 || aiData.predicted_risk_score > 50)) ?
                `<div style="margin-top: 0.5rem; color: #ff4444; font-size: 0.9rem;">⚠️ High spending velocity detected.</div>` :
                `<div style="margin-top: 0.5rem; color: var(--ios-text-secondary); font-size: 0.9rem;">Trajectory stable. Keep it up.</div>`
            }
                </div>

                <!-- 4. Quick Actions -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem;">
                    <button class="vision-btn-secondary" onclick="window.location.hash='#spending'" style="flex-direction: column; height: 80px; justify-content: center; gap: 5px;">
                        <i data-lucide="plus-circle"></i>
                        <span style="font-size: 0.8rem;">${state.t('log_expense')}</span>
                    </button>
                    <button class="vision-btn-secondary" onclick="window.location.hash='#fin'" style="flex-direction: column; height: 80px; justify-content: center; gap: 5px;">
                        <i data-lucide="message-circle"></i>
                        <span style="font-size: 0.8rem;">${state.t('ask_fin')}</span>
                    </button>
                    <button class="vision-btn-secondary" onclick="window.location.hash='#simulation'" style="flex-direction: column; height: 80px; justify-content: center; gap: 5px;">
                         <i data-lucide="play"></i>
                        <span style="font-size: 0.8rem;">${state.t('simulate')}</span>
                    </button>
                    <button class="vision-btn-secondary" onclick="window.location.hash='#goals'" style="flex-direction: column; height: 80px; justify-content: center; gap: 5px;">
                        <i data-lucide="target"></i>
                        <span style="font-size: 0.8rem;">${state.t('set_goal')}</span>
                    </button>
                     <button class="vision-btn-secondary" onclick="window.location.hash='#mood'" style="flex-direction: column; height: 80px; justify-content: center; gap: 5px;">
                        <i data-lucide="smile"></i>
                        <span style="font-size: 0.8rem;">${state.t('mood_log')}</span>
                    </button>
                </div>

                <!-- 5. Recent Activity Feed -->
                <h3 class="ios-card-header" style="margin-left: 0.5rem; margin-bottom: 1rem;">${state.t('recent_activity')}</h3>
                <div class="ios-list">
                    ${spending.length === 0 ? `<div style="padding: 1.5rem; text-align: center; color: var(--ios-text-secondary);">${state.t('no_data')}</div>` : `
                        ${spending.slice(0, 5).map(item => `
                            <div class="ios-list-item" style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                                <div style="display: flex; align-items: center; gap: 1rem;">
                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--c-violet-neon); box-shadow: 0 0 10px var(--c-violet-neon);"></div>
                                    <div>
                                        <div class="text-bold">${item.category}</div>
                                        <div class="text-caption">${item.description || 'Unknown'}</div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div class="text-bold" style="color: var(--c-white);">${state.formatCurrency(item.amount * -1)}</div>
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
