
import { api, state } from '../app.js';

export async function renderAI(container) {
    container.innerHTML = `
        <div>
            <h1 class="page-title">AI Financial Insights</h1>
            
            <div style="display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                
                <!-- Behavior Prediction -->
                <div class="glass-card">
                    <h2 style="margin-bottom: 1rem;">Behavior Analysis</h2>
                    <p style="opacity: 0.7; margin-bottom: 1.5rem;">Analyze your recent spending and mood patterns to predict impulsive behavior risk.</p>
                    
                    <button id="predict-btn" class="btn-primary">Analyze My Risk</button>
                    
                    <div id="prediction-result" class="hidden" style="margin-top: 1.5rem; padding: 1.5rem; background: rgba(0,0,0,0.3); border-radius: 1rem;">
                        <div style="font-size: 0.9rem; margin-bottom: 0.5rem; opacity: 0.7;">Risk Level</div>
                        <div id="risk-score" style="font-size: 2rem; font-weight: 900; margin-bottom: 1rem;">--</div>
                        <div id="risk-reason" style="font-size: 0.9rem; line-height: 1.6;"></div>
                        <div id="risk-intervention" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); color: rgb(var(--color-2)); font-weight: bold;"></div>
                    </div>
                </div>

                <!-- Future Simulation -->
                <div class="glass-card">
                    <h2 style="margin-bottom: 1rem;">Future Simulator</h2>
                    <p style="opacity: 0.7; margin-bottom: 1.5rem;">Project your finances 6 months into the future.</p>
                    
                    <form id="sim-form" style="display: grid; gap: 1rem;">
                        <div>
                            <label style="font-weight: bold; font-size: 0.8rem;">Current Balance</label>
                            <input type="number" name="current_balance" class="glass-input" value="1000">
                        </div>
                        <div>
                            <label style="font-weight: bold; font-size: 0.8rem;">Avg Monthly Spend</label>
                            <input type="number" name="avg_daily_spending" class="glass-input" value="30"> <!-- Backend name is confusing, using day/month logic here? API expects daily avg -->
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                             <div>
                                <label style="font-weight: bold; font-size: 0.8rem;">Income</label>
                                <input type="number" name="income_amount" class="glass-input" value="3000">
                             </div>
                             <div>
                                <label style="font-weight: bold; font-size: 0.8rem;">Freq (Days)</label>
                                <input type="number" name="income_frequency_days" class="glass-input" value="30">
                             </div>
                        </div>
                        <button type="submit" class="btn-primary" style="background: linear-gradient(135deg, rgb(var(--color-3)), rgb(var(--color-1)));">Run Simulation</button>
                    </form>
                </div>
            </div>

            <!-- Simulation Result -->
            <div id="sim-result" class="glass-card hidden" style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem;">Projected Balance (6 Months)</h3>
                <div style="display: flex; overflow-x: auto; gap: 1px; height: 200px; align-items: end; padding-bottom: 1rem;">
                    <!-- Bars injected here -->
                </div>
            </div>
        </div>
            
            <!-- AI Chatbot Buddy -->
            <div style="margin-top: 3rem;">
                <h2 style="margin-bottom: 1.5rem; text-align: center;">Ask 'Fin' - Your Buddy</h2>
                <div class="glass-card" id="chat-container" style="height: 500px; display: flex; flex-direction: column; padding: 0; overflow: hidden;">
                    
                    <!-- Header -->
                    <div style="padding: 1rem 1.5rem; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; gap: 0.8rem;">
                        <div style="width: 10px; height: 10px; background: rgb(var(--p-green-neon)); border-radius: 50%; box-shadow: 0 0 10px rgb(var(--p-green-neon));"></div>
                        <div style="font-weight: bold; letter-spacing: 1px;">FIN</div>
                    </div>

                    <!-- Messages -->
                    <div id="chat-messages" style="flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
                        <div style="align-self: flex-start; background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 1rem; border-bottom-left-radius: 4px; max-width: 80%;">
                            Yo! I'm Fin. 💸 What's on your mind? We saving or spending today?
                        </div>
                    </div>

                    <!-- Input -->
                    <div style="padding: 1rem; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.05); display: flex; gap: 0.5rem;">
                        <input type="text" id="chat-input" class="glass-input" placeholder="Ask about crypto, budget, or life..." style="border-radius: 99px; padding-left: 1.5rem;">
                        <button id="chat-send-btn" style="background: rgb(var(--p-violet-neon)); border: none; width: 45px; height: 45px; border-radius: 50%; color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                            <i data-lucide="send" style="width: 18px; height: 18px;"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 1. Behavior Prediction
    const predictBtn = document.getElementById('predict-btn');
    const predResult = document.getElementById('prediction-result');

    predictBtn.onclick = async () => {
        predictBtn.textContent = "Analyzing...";
        predictBtn.disabled = true;

        try {
            // First fetch data to send to AI
            const [spending, mood] = await Promise.all([
                api('/spending?limit=50'),
                api('/mood?limit=10')
            ]);

            const payload = {
                user_id: state.user.id || 1,
                transactions: spending.map(s => ({ amount: s.amount, category: s.category, timestamp: s.date })),
                mood_logs: mood.map(m => `Score: ${m.score}, Note: ${m.note}`)
            };

            const res = await api('/ai/predict', 'POST', payload);

            // Render Result
            predResult.classList.remove('hidden');
            const score = res.risk_score;
            const riskEl = document.getElementById('risk-score');

            riskEl.textContent = `${(score * 100).toFixed(0)}%`;
            riskEl.style.color = score > 0.7 ? 'rgb(239, 68, 68)' : (score > 0.3 ? 'rgb(234, 179, 8)' : 'rgb(var(--color-1))');

            document.getElementById('risk-reason').textContent = res.trigger_reason;
            document.getElementById('risk-intervention').textContent = `💡 ${res.recommended_intervention}`;

        } catch (err) {
            alert("AI Analysis Failed: " + err.message);
        } finally {
            predictBtn.textContent = "Analyze My Risk";
            predictBtn.disabled = false;
        }
    };

    // 2. Simulation
    const simForm = document.getElementById('sim-form');
    const simResult = document.getElementById('sim-result');

    simForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(simForm);
        const payload = {
            current_balance: parseFloat(formData.get('current_balance')),
            avg_daily_spending: parseFloat(formData.get('avg_daily_spending')), // This input was labeled Monthly on UI but ID suggests daily? Let's assume user inputs simpler number
            income_frequency_days: parseInt(formData.get('income_frequency_days')),
            income_amount: parseFloat(formData.get('income_amount')),
            savings_goal: 0 // Optional
        };

        try {
            const res = await api('/ai/simulate', 'POST', payload);

            simResult.classList.remove('hidden');
            const container = simResult.querySelector('div');
            // Backend returns 30-day forecast, accessing current path
            const balances = res.thirty_day_forecast.current;
            const max = Math.max(...balances);

            container.innerHTML = balances.map((b, i) => `
                <div style="flex: 1; min-width: 10px; background: rgba(var(--color-2), 0.5); height: ${(b / max) * 100}%; position: relative; border-top-left-radius: 4px; border-top-right-radius: 4px;" title="Day ${i + 1}: $${b.toFixed(0)}">
                </div>
            `).join('');

        } catch (err) {
            alert("Simulation Failed: " + err.message);
        }
    };

    // 3. AI Chatbot
    const chatContainer = document.getElementById('chat-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const messagesDiv = document.getElementById('chat-messages');

    let chatHistory = [];

    const appendMessage = (role, text) => {
        const div = document.createElement('div');
        div.style.cssText = `
            margin-bottom: 1rem;
            padding: 1rem;
            border-radius: 1rem;
            max-width: 80%;
            font-size: 0.95rem;
            line-height: 1.5;
            animation: fadeIn 0.3s ease;
        `;

        if (role === 'user') {
            div.style.alignSelf = 'flex-end';
            div.style.background = 'linear-gradient(135deg, rgb(var(--p-purple-deep)), rgb(var(--p-violet-neon)))';
            div.style.color = 'white';
            div.style.borderBottomRightRadius = '4px';
        } else {
            div.style.alignSelf = 'flex-start';
            div.style.background = 'rgba(255, 255, 255, 0.1)';
            div.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            div.style.color = 'white';
            div.style.borderBottomLeftRadius = '4px';
        }

        div.textContent = text;
        messagesDiv.appendChild(div);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    };

    const sendMessage = async () => {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        chatInput.value = '';
        chatInput.disabled = true;

        // Add loading bubble/indicator could be nice here

        try {
            const res = await api('/ai/chat', 'POST', {
                message: text,
                history: chatHistory
            });

            const reply = res.response;
            appendMessage('model', reply);

            chatHistory.push({ role: 'user', content: text });
            chatHistory.push({ role: 'model', content: reply });

        } catch (err) {
            appendMessage('model', "⚠️ Connection Error: " + err.message);
        } finally {
            chatInput.disabled = false;
            chatInput.focus();
        }
    };

    sendBtn.onclick = sendMessage;
    chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
    };
}
