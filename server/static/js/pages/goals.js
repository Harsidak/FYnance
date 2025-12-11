
import { api } from '../app.js';

export async function renderGoals(container) {
    container.innerHTML = `
        <div>
            <h1 class="page-title">Savings Goals</h1>
            
            <!-- Create Goal Form -->
            <div class="glass-card" style="margin-bottom: 3rem; background: linear-gradient(135deg, rgba(var(--color-1), 0.1), rgba(var(--color-3), 0.1));">
                <h2 style="margin-bottom: 1.5rem;">Create New Goal</h2>
                <form id="goal-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; align-items: end;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Goal Name</label>
                        <input type="text" name="name" class="glass-input" placeholder="e.g. New Laptop" required>
                    </div>
                    <div>
                         <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Target Amount ($)</label>
                        <input type="number" step="0.01" name="target_amount" class="glass-input" required>
                    </div>
                    <div>
                         <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Deadline (Optional)</label>
                        <input type="date" name="deadline" class="glass-input">
                    </div>
                    <button type="submit" class="btn-primary" style="margin-top: 0;">Create Goal</button>
                </form>
            </div>

            <!-- Goals Grid -->
            <div id="goals-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <div class="loading">Loading goals...</div>
            </div>
        </div>
    `;

    const form = document.getElementById('goal-form');
    const listContainer = document.getElementById('goals-list');

    const loadGoals = async () => {
        try {
            const goals = await api('/goals');
            renderList(goals);
        } catch (err) {
            listContainer.innerHTML = `<div class="error">Failed to load goals: ${err.message}</div>`;
        }
    };

    const renderList = (goals) => {
        if (!goals.length) {
            listContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; opacity: 0.6;">No savings goals yet. Start small!</p>';
            return;
        }

        listContainer.innerHTML = goals.map(goal => {
            const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
            const isCompleted = progress >= 100;

            return `
                <div class="glass-card" style="position: relative; overflow: hidden;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <h3 style="font-size: 1.5rem; font-weight: bold;">${goal.name}</h3>
                            <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 0.2rem;">
                                ${goal.deadline ? `Due: ${new Date(goal.deadline).toLocaleDateString()}` : 'No deadline'}
                            </p>
                        </div>
                        ${isCompleted ? '<span style="color: rgb(var(--color-1)); font-weight: bold; font-size: 1.5rem;">✓</span>' : ''}
                    </div>

                    <div style="margin-bottom: 0.5rem; display: flex; align-items: baseline; gap: 0.5rem;">
                        <span style="font-size: 2rem; font-weight: 900; color: rgb(var(--color-1));">$${goal.current_amount.toFixed(0)}</span>
                        <span style="opacity: 0.6;"> / $${goal.target_amount.toFixed(0)}</span>
                    </div>

                    <!-- Progress Bar -->
                    <div style="background: rgba(255,255,255,0.1); border-radius: 99px; height: 10px; margin-bottom: 1.5rem; overflow: hidden;">
                        <div style="width: ${Math.min(progress, 100)}%; background: linear-gradient(to right, rgb(var(--color-1)), rgb(var(--color-2))); height: 100%; transition: width 0.5s;"></div>
                    </div>

                    <button class="nav-btn w-full add-funds-btn" data-id="${goal.id}" style="width: 100%; text-align: center;">+ Add Funds</button>
                </div>
            `;
        }).join('');

        // Attach Listeners
        document.querySelectorAll('.add-funds-btn').forEach(btn => {
            btn.onclick = async () => {
                const amount = prompt("How much would you like to add?");
                if (!amount) return;

                try {
                    await api(`/goals/${btn.dataset.id}?amount_added=${parseFloat(amount)}`, 'PUT');
                    loadGoals();
                } catch (err) {
                    alert("Failed to update: " + err.message);
                }
            };
        });
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = {
            name: formData.get('name'),
            target_amount: parseFloat(formData.get('target_amount')),
            deadline: formData.get('deadline') || null
        };

        try {
            await api('/goals', 'POST', payload);
            form.reset();
            loadGoals();
        } catch (err) {
            alert("Error creating goal: " + err.message);
        }
    };

    loadGoals();
}
