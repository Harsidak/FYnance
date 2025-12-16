
import { api } from '../api.js';
import { state } from '../state.js';

export async function renderSimulation(container) {
    container.innerHTML = `
        <div class="fade-in premium-simulation-layout">
            
            <!-- Header Section -->
            <div style="margin-bottom: 2rem; display: flex; align-items: flex-end; justify-content: space-between;">
                <div>
                    <h1 class="page-title" style="font-size: 2.5rem; font-weight: 800; background: linear-gradient(to right, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px; margin-bottom: 0.5rem;">
                        Future Simulator
                    </h1>
                    <div class="text-caption" style="font-size: 1rem; opacity: 0.8;">
                        AI-Driven Financial Projection Engine // V2.5
                    </div>
                </div>
                <div class="badge-pill" style="border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); padding: 5px 12px; border-radius: 20px; font-size: 0.8rem;">
                    GEMINI 2.5 FLASH ACTIVE
                </div>
            </div>

            <!-- Context & Controls (Glass Glass Cockpit) -->
            <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 2rem; position: relative; overflow: hidden;">
                <!-- Subtle internal glow -->
                <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%); pointer-events: none;"></div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; align-items: center; position: relative; z-index: 1;">
                    <div>
                        <div class="label-heading">CURRENT BALANCE</div>
                        <div class="metric-xl">$${(state.user?.balance || 0).toLocaleString()}</div>
                    </div>
                    <div>
                        <div class="label-heading">SPEND VELOCITY</div>
                        <div class="metric-xl">$${(state.user?.avg_spend || 45).toFixed(0)}<span style="font-size: 1rem; opacity: 0.5;">/day</span></div>
                    </div>
                     <div>
                        <div class="label-heading">TARGET GOAL</div>
                        <div class="metric-xl">$3,000</div>
                    </div>
                </div>

                <button id="run-sim-btn" class="cta-button-premium">
                    <span class="btn-content">
                        <i data-lucide="zap" style="width: 20px; margin-right: 10px;"></i> 
                        INITIALIZE 30-DAY SIMULATION
                    </span>
                    <div class="btn-glow"></div>
                </button>
            </div>

            <!-- SIMULATION RESULTS -->
            <div id="sim-results" style="display: none;">
                
                <!-- 1. Narrative & Vital Stats -->
                <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                    <div class="glass-panel" style="background: rgba(20, 20, 25, 0.6); padding: 1.5rem;">
                         <div class="label-heading" style="color: var(--c-violet-neon); margin-bottom: 0.5rem;">AI NARRATIVE</div>
                         <div id="sim-narrative" style="font-size: 1.2rem; font-weight: 400; line-height: 1.5; color: rgba(255,255,255,0.9); font-style: italic;"></div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="glass-panel text-center" style="padding: 1rem; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                            <div class="label-heading">LIQUIDITY SHIELD</div>
                            <div id="sim-liquidity" class="metric-lg text-green"></div>
                            <div class="text-caption" style="margin-top: 5px;">Days of Survival</div>
                        </div>
                         <div class="glass-panel text-center" style="padding: 1rem; flex: 1; display: flex; flex-direction: column; justify-content: center;">
                            <div class="label-heading">STRESS TEST</div>
                            <div id="sim-shock" class="text-bold" style="font-size: 1.1rem;"></div>
                        </div>
                    </div>
                </div>

                <!-- 2. Timeline Viz -->
                <div class="glass-panel" style="padding: 2rem; margin-bottom: 2rem; min-height: 350px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                         <div class="label-heading">30-DAY TRAJECTORY PROJECTION</div>
                         <div style="display: flex; gap: 1rem; font-size: 0.8rem;">
                            <div style="display: flex; align-items: center; gap: 5px;"><span style="width: 10px; height: 10px; background: #ff4444; border-radius: 2px;"></span> Current Path</div>
                            <div style="display: flex; align-items: center; gap: 5px;"><span style="width: 10px; height: 10px; background: var(--c-green-neon); border-radius: 2px; box-shadow: 0 0 5px var(--c-green-neon);"></span> Optimized Path</div>
                         </div>
                    </div>
                    
                    <div id="sim-chart-container" style="height: 250px; display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1px;">
                        <!-- Bars injected here -->
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 10px; opacity: 0.5; font-size: 0.8rem; font-family: monospace;">
                        <span>DAY 1</span>
                        <span>DAY 15</span>
                        <span>DAY 30</span>
                    </div>
                </div>

                <!-- 3. Architect's Report -->
                <div class="glass-panel" style="padding: 2rem; margin-bottom: 2rem; background: linear-gradient(180deg, rgba(80, 50, 200, 0.05) 0%, rgba(0,0,0,0) 100%); border: 1px solid rgba(138, 92, 255, 0.2);">
                     <div class="label-heading" style="color: var(--c-violet-neon); margin-bottom: 1rem; letter-spacing: 2px;">WEALTH ARCHITECT'S BLUEPRINT</div>
                     <div id="sim-report" class="markdown-content"></div>
                     <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05);">
                        <div class="label-heading" style="margin-bottom: 0.5rem;">STRESS TEST SCENARIO</div>
                        <div id="sim-stress-narrative" style="color: #ff4444; font-family: monospace;"></div>
                     </div>
                </div>

                <!-- 4. Action Plan -->
                <h3 class="label-heading" style="margin-bottom: 1rem; font-size: 1rem;">SYSTEMIC INTERVENTIONS</h3>
                <div id="sim-actions" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;"></div>
            </div>

            <div id="sim-loading" style="display: none; height: 60vh; width: 100%; display: flex; justify-content: center; align-items: center; flex-direction: column;">
                 <div class="spinner-premium"></div>
                 <div class="text-caption" style="margin-top: 2rem; font-size: 1.2rem; letter-spacing: 3px;">PROCESSING FINANCIAL MODELS...</div>
            </div>
        </div>
        
        <style>
            .premium-simulation-layout {
                padding: 2rem;
                max-width: 1200px;
                margin: 0 auto;
            }
            .glass-panel {
                background: rgba(18, 18, 20, 0.35); /* More transparent */
                backdrop-filter: blur(15px); /* Slightly less blur for clarity */
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 24px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            }
            .label-heading {
                font-family: 'Outfit', sans-serif;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                font-size: 0.75rem;
                color: rgba(255,255,255,0.4);
                font-weight: 600;
            }
            .metric-xl { font-size: 3rem; font-weight: 700; color: #fff; letter-spacing: -1px; }
            .metric-lg { font-size: 2.2rem; font-weight: 700; letter-spacing: -0.5px; }
            
            .text-green { color: var(--c-green-neon); text-shadow: 0 0 20px rgba(0, 255, 157, 0.3); }
            .text-red { color: #ff4444; text-shadow: 0 0 20px rgba(255, 68, 68, 0.3); }

            .cta-button-premium {
                margin-top: 1.5rem;
                width: 100%;
                background: var(--c-white);
                color: #000;
                border: none;
                padding: 1.2rem;
                border-radius: 16px;
                font-weight: 800;
                letter-spacing: 1px;
                font-size: 1rem;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                transition: transform 0.2s;
            }
            .cta-button-premium:hover { transform: scale(1.02); }
            .cta-button-premium:active { transform: scale(0.98); }
            
            .markdown-content { color: rgba(255,255,255,0.9); font-size: 1.05rem; line-height: 1.7; }
            .markdown-content p { margin-bottom: 1em; }
            
            .action-card {
                background: rgba(255,255,255,0.03);
                border: 1px solid rgba(255,255,255,0.05);
                padding: 1.5rem;
                border-radius: 16px;
                transition: all 0.2s;
            }
            .action-card:hover {
                background: rgba(255,255,255,0.08);
                border-color: rgba(255,255,255,0.2);
                transform: translateY(-2px);
            }

            .spinner-premium {
                width: 60px;
                height: 60px;
                border: 3px solid rgba(255,255,255,0.1);
                border-top: 3px solid var(--c-green-neon);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('run-sim-btn').onclick = async () => {
        const btn = document.getElementById('run-sim-btn');
        const results = document.getElementById('sim-results');
        const loading = document.getElementById('sim-loading');

        results.style.display = 'none';
        loading.style.display = 'flex'; // Flex for centering

        try {
            const data = await api('/ai/simulate', 'POST', {
                current_balance: state.user?.balance || 1200,
                avg_daily_spending: 45,
                income_frequency_days: 14,
                income_amount: 800,
                savings_goal: 3000
            });

            renderResults(data);
            loading.style.display = 'none';
            results.style.display = 'block';
            results.classList.add('fade-in');

        } catch (err) {
            loading.innerHTML = `<div style="color: #ff4444; font-size: 1.5rem;">CRITICAL ERROR: ${err.message}</div>`;
        }
    };

    function renderResults(data) {
        document.getElementById('sim-narrative').innerText = `"${data.narrative}"`;
        // document.getElementById('sim-survival').innerText = (data.survival_probability * 100).toFixed(0) + '%';

        const safeDays = data.liquidity_buffer || 0;
        const liqEl = document.getElementById('sim-liquidity');
        liqEl.textContent = safeDays < 3 ? "CRITICAL" : `${safeDays.toFixed(1)} DAYS`;
        liqEl.style.color = safeDays < 7 ? '#ff4444' : 'var(--c-green-neon)';

        const shockEl = document.getElementById('sim-shock');
        shockEl.textContent = `Resilience: ${data.shock_resilience}`;
        shockEl.style.color = data.shock_resilience === 'High' ? 'var(--c-green-neon)' : (data.shock_resilience === 'Medium' ? 'orange' : '#ff4444');

        document.getElementById('sim-stress-narrative').textContent = `> ${data.stress_test_result}`;

        // document.getElementById('sim-waste').innerText = '-$' + data.waste_audit;  // Removed Waste Audit for Zen Look
        document.getElementById('sim-report').innerHTML = marked.parse ? marked.parse(data.teacher_report || "") : data.teacher_report;

        // Render Actions Cards
        document.getElementById('sim-actions').innerHTML = data.recommended_actions.map(action => `
            <div class="action-card">
                <div style="display: flex; align-items: start; gap: 12px;">
                    <i data-lucide="check-circle-2" style="color: var(--c-green-neon); margin-top: 2px;"></i>
                    <div>
                        <div style="font-weight: 600; color: #fff; margin-bottom: 4px;">Recommended Action</div>
                        <div style="opacity: 0.8; font-size: 0.95rem;">${action}</div>
                    </div>
                </div>
            </div>
        `).join('');

        // Render Chart
        const currentPath = data.thirty_day_forecast.current;
        const optPath = data.thirty_day_forecast.improved;
        const maxVal = Math.max(...currentPath, ...optPath, 100);
        const minVal = Math.min(...currentPath, ...optPath, 0);
        const range = maxVal - minVal;

        const chartContainer = document.getElementById('sim-chart-container');
        chartContainer.innerHTML = '';

        // Render all 30 bars (or optimized subset)
        for (let i = 0; i < 30; i++) {
            // Normalized height (0 to 100%)
            // We align buckets to the bottom. Negative values might be tricky in simple CSS bar chart but we'll clamp for MVP viz.
            const cVal = Math.max(0, currentPath[i]);
            const oVal = Math.max(0, optPath[i]);

            const group = document.createElement('div');
            group.style.cssText = `display: flex; gap: 4px; align-items: flex-end; height: 100%; width: 3%; position: relative;`;

            const hC = (cVal / maxVal) * 100;
            const hO = (oVal / maxVal) * 100;

            const barC = document.createElement('div');
            barC.style.cssText = `width: 100%; background: #ff4444; height: ${hC}%; border-radius: 4px; opacity: 0.6; transition: height 1s ease;`;

            const barO = document.createElement('div');
            barO.style.cssText = `width: 100%; background: var(--c-green-neon); height: ${hO}%; border-radius: 4px; box-shadow: 0 0 10px rgba(0,255,157,0.2); transition: height 1s ease 0.2s; position: absolute; bottom: 0; left: 0; opacity: 0.9; mix-blend-mode: screen;`;

            group.appendChild(barC);
            group.appendChild(barO);
            chartContainer.appendChild(group);
        }

        if (window.lucide) window.lucide.createIcons();
    }
}
