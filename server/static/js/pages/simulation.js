
import { api } from '../app.js';
import { state } from '../state.js';

export async function renderSimulation(container) {
    container.innerHTML = `
        <div class="fade-in">
            <h1 class="page-title">Future Simulator</h1>
            
            <!-- Context Card -->
            <div class="glass-card-3d" style="margin-bottom: 1.5rem;">
                <div class="ios-card-header">
                    <i data-lucide="crosshair" style="width: 16px; margin-right: 8px;"></i> Simulation Parameters
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                    <div>
                        <div class="text-caption">Current Balance</div>
                        <div class="text-bold">$${state.user?.balance || 0}</div>
                    </div>
                     <div>
                        <div class="text-caption">Avg Daily Spend</div>
                        <div class="text-bold">$${state.user?.avg_spend || 45}</div>
                    </div>
                </div>
                <button id="run-sim-btn" class="ios-btn" style="margin-top: 1rem; width: 100%;">
                    <i data-lucide="play-circle" style="width: 16px; margin-right: 8px;"></i> Run 30-Day AI Simulation
                </button>
            </div>

            <!-- Results Container -->
            <div id="sim-results" style="display: none;">
                
                <!-- Narrative -->
                <div class="ios-card" style="background: rgba(255,255,255,0.05);">
                    <div id="sim-narrative" style="font-size: 1.1rem; line-height: 1.5; color: var(--c-white);"></div>
                </div>

                <!-- Analytics Grid -->
                <div class="bento-grid" style="margin-top: 1rem;">
                    <div class="glass-card-3d">
                        <div class="text-caption">Survival Chance</div>
                        <div id="sim-survival" class="stat-value text-green"></div>
                    </div>
                    <div class="glass-card-3d">
                         <div class="text-caption">Waste Audit</div>
                        <div id="sim-waste" class="stat-value text-primary"></div>
                    </div>
                </div>
                
                 <!-- Teacher's Report (New) -->
                <div class="glass-card-3d" style="margin-top: 1.5rem; border-left: 4px solid var(--c-violet-neon);">
                    <div class="ios-card-header">
                        <i data-lucide="graduation-cap" style="width: 18px; margin-right: 8px;"></i> Teacher's Report
                    </div>
                    <div id="sim-report" style="color: var(--ios-text-secondary); line-height: 1.6; margin-top: 1rem; white-space: pre-line;"></div>
                </div>

                <!-- Chart Placeholder -->
                <h3 class="ios-card-header" style="margin-top: 2rem;">Timeline Projection</h3>
                <div class="glass-card-3d" style="margin-top: 0.5rem; padding: 1rem; height: 300px; display: flex; align-items: flex-end; justify-content: space-between; background: rgba(0,0,0,0.3);" id="sim-chart">
                    <!-- CSS Bars will be injected here -->
                </div>
                <div class="text-caption" style="text-align: center; margin-top: 0.5rem;">
                    <span style="color: #ff4444;">● Current Path</span> vs <span style="color: var(--c-green-neon);">● Optimized</span>
                </div>

                <!-- Action Plan -->
                <h3 class="ios-card-header" style="margin-top: 2rem; margin-bottom: 1rem;">AI Action Plan</h3>
                <div id="sim-actions" class="ios-list"></div>
            </div>

            <div id="sim-loading" style="display: none; padding: 2rem; text-align: center;">
                 <div class="loading">Crunching 30 days of data...</div>
                 <div class="text-caption" style="margin-top: 1rem;">Analyzing spending patterns & predicting shocks</div>
            </div>
        </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('run-sim-btn').onclick = async () => {
        const btn = document.getElementById('run-sim-btn');
        const results = document.getElementById('sim-results');
        const loading = document.getElementById('sim-loading');

        btn.disabled = true;
        results.style.display = 'none';
        loading.style.display = 'block';

        try {
            const data = await api('/ai/simulate', 'POST', {
                current_balance: state.user?.balance || 1200,
                avg_daily_spending: 45, // Mock for now if missing
                income_frequency_days: 14,
                income_amount: 800,
                savings_goal: 3000
            });

            renderResults(data);
            loading.style.display = 'none';
            results.style.display = 'block';
            results.classList.add('fade-in');

        } catch (err) {
            loading.innerHTML = `<div style="color: #ff4444;">Simulation Failed: ${err.message}</div>`;
            btn.disabled = false;
        }
    };

    function renderResults(data) {
        document.getElementById('sim-narrative').innerText = data.narrative;
        document.getElementById('sim-survival').innerText = (data.survival_probability * 100).toFixed(0) + '%';
        document.getElementById('sim-waste').innerText = '$' + data.waste_audit;

        // Render Actions
        document.getElementById('sim-actions').innerHTML = data.recommended_actions.map(action => `
            <div class="ios-list-item">
                <div style="display: flex; gap: 10px;">
                    <i data-lucide="check-circle" style="color: var(--c-green-neon); width: 16px;"></i>
                    <span>${action}</span>
                </div>
            </div>
        `).join('');

        // Render Simple CSS Chart
        const currentPath = data.thirty_day_forecast.current;
        const optPath = data.thirty_day_forecast.improved;
        const maxVal = Math.max(...currentPath, ...optPath, 100);

        // Sampling just 10 points for the CSS graph to fit
        const chartContainer = document.getElementById('sim-chart');
        chartContainer.innerHTML = '';

        for (let i = 0; i < 30; i += 3) {
            const cVal = currentPath[i];
            const oVal = optPath[i];

            const group = document.createElement('div');
            group.style.cssText = `display: flex; gap: 2px; align-items: flex-end; height: 100%; width: 8%;`;

            const barC = document.createElement('div');
            barC.style.cssText = `width: 50%; background: #ff4444; height: ${(cVal / maxVal) * 100}%; border-radius: 2px; opacity: 0.8;`;

            const barO = document.createElement('div');
            barO.style.cssText = `width: 50%; background: var(--c-green-neon); height: ${(oVal / maxVal) * 100}%; border-radius: 2px; box-shadow: 0 0 5px var(--c-green-neon);`;

            group.appendChild(barC);
            group.appendChild(barO);
            chartContainer.appendChild(group);
        }

        if (window.lucide) window.lucide.createIcons();
    }
}
