
import { api } from '../api.js';
import { state } from '../state.js';

export async function renderAI(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h1 class="page-title">AI Financial Insights</h1>
            
            <div style="display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                
                <!-- Behavior Prediction Card -->
                <div class="glass-card" style="position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
                    <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; background: radial-gradient(circle, rgba(var(--p-violet-neon), 0.2) 0%, transparent 70%); filter: blur(20px);"></div>
                    
                    <h2 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 10px;">
                        <i data-lucide="scan-eye" style="color: var(--c-violet-neon);"></i>
                        Behavior Diagnostics
                    </h2>
                    <p style="opacity: 0.7; margin-bottom: 2rem; font-size: 0.9rem; line-height: 1.6;">
                        Neural analysis of your spending triggers and emotional spending patterns.
                    </p>
                    
                    <div id="analysis-placeholder" style="text-align: center; padding: 2rem 0;">
                        <div style="width: 80px; height: 80px; margin: 0 auto 1.5rem auto; border-radius: 50%; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; border: 1px dashed rgba(255,255,255,0.2);">
                            <i data-lucide="activity" style="width: 32px; height: 32px; opacity: 0.5;"></i>
                        </div>
                        <button id="predict-btn" class="btn-primary" style="width: 100%; justify-content: center;">
                            <i data-lucide="zap" style="width: 16px; margin-right: 8px;"></i> Run Diagnostics
                        </button>
                    </div>
                    
                    <div id="prediction-result" class="hidden" style="margin-top: 0;">
                        <!-- Risk Meter -->
                        <div style="margin-bottom: 1.5rem;">
                             <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: bold;">
                                <span>Risk Assessment</span>
                                <span id="risk-label">--</span>
                            </div>
                            <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
                                <div id="risk-bar" style="width: 0%; height: 100%; background: var(--c-green-neon); transition: width 1s ease, background 0.3s;"></div>
                            </div>
                        </div>

                        <!-- Main Score -->
                        <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="font-size: 0.8rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem;">Impulse Probability</div>
                            <div id="risk-score" style="font-size: 3rem; font-weight: 800; line-height: 1;">--%</div>
                        </div>

                        <!-- Evaluation -->
                        <div style="font-size: 0.95rem; line-height: 1.6; padding-bottom: 1rem; border-bottom: 1px dashed rgba(255,255,255,0.1); margin-bottom: 1rem;">
                            <span style="opacity: 0.6;">Analysis:</span> <span id="risk-reason" style="color: rgba(255,255,255,0.9);"></span>
                        </div>
                        
                        <!-- Intervention -->
                        <div style="display: flex; gap: 1rem; align-items: flex-start; background: rgba(var(--p-blue-neon), 0.1); padding: 1rem; border-radius: 8px; border-left: 3px solid var(--c-blue-neon);">
                            <i data-lucide="lightbulb" style="color: var(--c-blue-neon); flex-shrink: 0; margin-top: 2px;"></i>
                            <div>
                                <div style="font-size: 0.8rem; font-weight: bold; color: var(--c-blue-neon); margin-bottom: 0.2rem;">RECOMMENDATION</div>
                                <div id="risk-intervention" style="font-size: 0.9rem;"></div>
                                <div id="risk-action" style="margin-top: 0.5rem; font-weight: 800; font-size: 0.85rem; padding: 4px 8px; background: rgba(0,0,0,0.3); border-radius: 4px; display: inline-block;"></div>
                            </div>
                        </div>

                         <button id="reset-btn" style="width: 100%; margin-top: 1.5rem; background: transparent; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); padding: 0.8rem; border-radius: 8px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s;">
                            Reset Analysis
                        </button>
                    </div>
                </div>

                <!-- Simulation Promo Card -->
                <div class="glass-card" style="background: linear-gradient(160deg, rgba(0, 195, 154, 0.05), transparent); border: 1px solid rgba(0, 195, 154, 0.2); display: flex; flex-direction: column; justify-content: space-between;">
                    <div>
                        <div class="ios-card-header" style="color: var(--c-green-neon);">
                            <i data-lucide="trending-up"></i>
                            Future Simulator V2
                        </div>
                        <h3 style="font-size: 1.8rem; font-weight: 700; margin: 1rem 0 0.5rem 0; background: linear-gradient(to right, #fff, rgba(255,255,255,0.5)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                            See the Future.
                        </h3>
                        <p style="opacity: 0.7; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem;">
                            Project your finances 30 days ahead with our new deterministic engine. Defense-first modeling for survival probabilities.
                        </p>
                    </div>
                    
                    <button id="go-to-sim" class="btn-primary" style="background: var(--c-green-neon); color: black; font-weight: 700; justify-content: center;">
                        Enter Simulation
                        <i data-lucide="arrow-right" style="width: 16px; margin-left: 8px;"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    // 1. Behavior Prediction Logic
    const predictBtn = document.getElementById('predict-btn');
    const resetBtn = document.getElementById('reset-btn');
    const predResult = document.getElementById('prediction-result');
    const placeholder = document.getElementById('analysis-placeholder');

    // Reset handler
    if (resetBtn) {
        resetBtn.onclick = () => {
            predResult.classList.add('hidden');
            placeholder.classList.remove('hidden');
        }
    }

    predictBtn.onclick = async () => {
        predictBtn.innerHTML = `<i data-lucide="loader-2" class="spin" style="width: 16px; margin-right: 8px;"></i> Processing...`;
        predictBtn.disabled = true;

        if (window.lucide) window.lucide.createIcons();

        try {
            // First fetch data to send to AI
            const [user, spending, mood, goals, subs] = await Promise.all([
                api('/auth/me'),
                api('/spending?limit=50'),
                api('/mood?limit=10'),
                api('/goals').catch(() => []),
                api('/subscriptions').catch(() => [])
            ]);

            // Calculate Monthly Fixed Costs (Same logic as Dashboard)
            const monthlySubs = subs.reduce((acc, sub) => {
                return acc + (sub.billing_cycle === 'Yearly' ? sub.cost / 12 : sub.cost);
            }, 0);

            const monthlyGoals = goals.reduce((acc, goal) => {
                if (goal.current_amount >= goal.target_amount) return acc;
                const remaining = goal.target_amount - goal.current_amount;
                let months = 12;
                if (goal.deadline) {
                    const days = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                    months = Math.max(days / 30, 1);
                }
                return acc + (remaining / months);
            }, 0);

            const fixedCosts = monthlySubs + monthlyGoals;

            const payload = {
                user_id: state.user?.id || user.id,
                transactions: spending.map(s => ({ amount: s.amount, category: s.category, timestamp: s.date })),
                mood_logs: mood.map(m => `Score: ${m.score}, Note: ${m.note}`),
                user_profile: {
                    monthly_income: user.monthly_income || 0,
                    savings_balance: user.savings_balance || 0,
                    income_stability: user.income_stability || 'fixed'
                },
                financial_context: {
                    fixed_costs: fixedCosts,
                    currency: state.currency
                }
            };

            const res = await api('/ai/predict', 'POST', payload);

            // Double Check: Did the user leave the page?
            if (!document.getElementById('risk-score')) {
                console.warn("View unmounted during AI analysis.");
                return;
            }

            // Render Result
            placeholder.classList.add('hidden');
            predResult.classList.remove('hidden');
            predResult.classList.add('fade-in');

            const score = res.risk_score; // 0.0 to 1.0
            const percentage = (score * 100).toFixed(0);

            // Elements
            const riskScoreEl = document.getElementById('risk-score');
            const riskBar = document.getElementById('risk-bar');
            const riskLabel = document.getElementById('risk-label');
            const riskReason = document.getElementById('risk-reason');
            const riskIntervention = document.getElementById('risk-intervention');
            const riskAction = document.getElementById('risk-action'); // New ID

            // Values
            if (riskScoreEl) riskScoreEl.textContent = `${percentage}%`;
            if (riskReason) riskReason.textContent = res.trigger_reason || "No significant patterns detected.";
            if (riskIntervention) riskIntervention.textContent = res.recommended_intervention || "Maintain current spending velocity.";
            if (riskAction && res.action) riskAction.textContent = res.action;

            // Dynamic Styling
            let color = 'var(--c-green-neon)';
            let labelText = 'Low Risk';

            if (score > 0.7) {
                color = '#ff4444';
                labelText = 'CRITICAL RISK';
            } else if (score > 0.4) {
                color = '#ffb700'; // Amber
                labelText = 'Moderate Risk';
            }

            if (riskScoreEl) riskScoreEl.style.color = color;
            if (riskBar) {
                riskBar.style.background = color;
                // Animate Bar
                setTimeout(() => {
                    riskBar.style.width = `${percentage}%`;
                }, 100);
            }
            if (riskLabel) {
                riskLabel.style.color = color;
                riskLabel.textContent = labelText;
            }

        } catch (err) {
            console.error("AI Display Error", err);
            alert("Analysis Failed: " + err.message);
            placeholder.classList.remove('hidden');
            predResult.classList.add('hidden');
            predictBtn.innerHTML = `<i data-lucide="zap" style="width: 16px; margin-right: 8px;"></i> Retry`;
        } finally {
            if (predictBtn) predictBtn.disabled = false;
        }
    };

    // 2. Simulation Redirect
    document.getElementById('go-to-sim').onclick = () => {
        window.location.hash = '#simulation';
    };

    if (window.lucide) window.lucide.createIcons();
}
