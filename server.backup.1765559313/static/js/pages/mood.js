
import { api } from '../app.js';

export async function renderMood(container) {
    container.innerHTML = `
        <div>
            <h1 class="page-title">Mood Tracker</h1>
            
            <div style="display: grid; gap: 2rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                
                <!-- Log Today's Mood -->
                <div class="glass-card">
                    <h2 style="margin-bottom: 1.5rem;">How are you feeling?</h2>
                    <form id="mood-form">
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Mood Score (1-10)</label>
                            <div style="display: flex; justify-content: space-between; gap: 0.5rem;">
                                ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => `
                                    <label style="cursor: pointer; flex: 1;">
                                        <input type="radio" name="score" value="${s}" required class="hidden peer">
                                        <div class="score-btn" style="text-align: center; padding: 0.5rem; border-radius: 0.5rem; background: rgba(255,255,255,0.1); transition: background 0.2s;">
                                            ${s}
                                        </div>
                                    </label>
                                `).join('')}
                            </div>
                            <style>
                                input[name="score"]:checked + div {
                                    background: rgb(var(--color-3));
                                    color: white;
                                    font-weight: bold;
                                    transform: scale(1.1);
                                }
                            </style>
                        </div>

                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Note (Optional)</label>
                            <textarea name="note" class="glass-input" rows="3" placeholder="What happened today?"></textarea>
                        </div>
                         
                        <div style="margin-bottom: 1.5rem;">
                            <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Date</label>
                            <input type="date" name="date" class="glass-input" value="${new Date().toISOString().split('T')[0]}">
                        </div>

                        <button type="submit" class="btn-primary">Log Mood</button>
                    </form>
                </div>

                <!-- Mood History -->
                <div class="glass-card">
                    <h2 style="margin-bottom: 1.5rem;">Recent Logs</h2>
                    <div id="mood-list" style="display: flex; flex-direction: column; gap: 1rem;">
                        <div class="loading">Loading history...</div>
                    </div>
                </div>

            </div>
        </div>
    `;

    const form = document.getElementById('mood-form');
    const listContainer = document.getElementById('mood-list');

    const loadMoods = async () => {
        try {
            const moods = await api('/mood?limit=10');
            renderList(moods);
        } catch (err) {
            listContainer.innerHTML = `<div class="error">Error: ${err.message}</div>`;
        }
    };

    const renderList = (moods) => {
        if (!moods.length) {
            listContainer.innerHTML = '<p style="opacity: 0.6; text-align: center;">No mood logs yet.</p>';
            return;
        }

        listContainer.innerHTML = moods.map(m => {
            let color = 'rgb(239, 68, 68)'; // Bad (1-4)
            if (m.score >= 5) color = 'rgb(234, 179, 8)'; // Meh (5-7)
            if (m.score >= 8) color = 'rgb(var(--color-1))'; // Good (8-10)

            return `
                <div style="display: flex; gap: 1rem; align-items: center; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 1rem;">
                    <div style="width: 2.5rem; height: 2.5rem; border-radius: 50%; background: ${color}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${m.score}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: bold; font-size: 0.9rem;">${new Date(m.date).toLocaleDateString()}</div>
                        <div style="opacity: 0.7; font-size: 0.85rem;">${m.note || ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = {
            score: parseInt(formData.get('score')),
            note: formData.get('note'),
            date: formData.get('date')
        };

        try {
            await api('/mood', 'POST', payload);
            form.reset();
            form.querySelector('[name="date"]').value = new Date().toISOString().split('T')[0];
            loadMoods();
        } catch (err) {
            alert("Failed to log mood: " + err.message);
        }
    };

    loadMoods();
}
