
import { api } from '../api.js';
import { state } from '../state.js';

export async function renderGoals(container) {
    let editingGoalId = null; // State to track if we are editing a goal

    // Render the container structure first
    container.innerHTML = `
        <div class="fade-in">
            <h1 class="page-title">${state.t('savings_goals')}</h1>
            
            <!-- Create/Edit Goal Form -->
            <div class="glass-card" style="margin-bottom: 3rem; background: linear-gradient(135deg, rgba(var(--color-1), 0.1), rgba(var(--color-3), 0.1));">
                <h2 id="form-title" style="margin-bottom: 1.5rem;">${state.t('create_new_goal')}</h2>
                <form id="goal-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; align-items: end;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">${state.t('goal_name')}</label>
                        <input type="text" id="goal-name" name="name" class="glass-input" placeholder="${state.t('goal_placeholder')}" required>
                    </div>
                    <div>
                         <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">${state.t('target_amount')} (${state.currencySymbols[state.currency]})</label>
                        <input type="number" id="goal-target" step="0.01" name="target_amount" class="glass-input" required>
                    </div>
                    <div>
                         <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">${state.t('deadline')} (${state.t('optional')})</label>
                        <input type="date" id="goal-deadline" name="deadline" class="glass-input">
                    </div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" id="submit-btn" class="btn-primary" style="margin-top: 0; flex: 1;">${state.t('create_goal')}</button>
                         <button type="button" id="cancel-edit-btn" class="nav-btn" style="display: none; flex: 1; text-align: center;">${state.t('cancel')}</button>
                    </div>
                </form>
            </div>

            <!-- Goals Grid -->
            <div id="goals-list" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <div class="loading">Loading goals...</div>
            </div>
        </div>
    `;

    const form = document.getElementById('goal-form');
    const formTitle = document.getElementById('form-title');
    const submitBtn = document.getElementById('submit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const listContainer = document.getElementById('goals-list');

    // Inputs
    const nameInput = document.getElementById('goal-name');
    const targetInput = document.getElementById('goal-target');
    const deadlineInput = document.getElementById('goal-deadline');

    const resetFormState = () => {
        editingGoalId = null;
        form.reset();
        formTitle.textContent = state.t('create_new_goal');
        submitBtn.textContent = state.t('create_goal');
        cancelEditBtn.style.display = 'none';
    };

    if (cancelEditBtn) cancelEditBtn.onclick = resetFormState;

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
                <div class="glass-card" style="position: relative; overflow: hidden; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <h3 style="font-size: 1.5rem; font-weight: bold;">${goal.name}</h3>
                            <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 0.2rem;">
                                ${goal.deadline ? `Due: ${new Date(goal.deadline).toLocaleDateString(state.language)}` : 'No deadline'}
                            </p>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                             ${isCompleted ? '<span style="color: rgb(var(--color-1)); font-weight: bold; font-size: 1.5rem; margin-right: 0.5rem;">✓</span>' : ''}
                             

                             <!-- Edit/Delete Actions -->

                             <!-- Edit/Delete Actions -->
                             <button class="nav-btn edit-goal-btn" data-id="${goal.id}" title="Edit Goal" style="padding: 0.5rem; display: flex; align-items: center; justify-content: center; margin-right: 0.5rem; background: rgba(255, 255, 255, 0.1);">
                                <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
                             </button>
                             <button class="nav-btn delete-goal-btn" data-id="${goal.id}" title="Delete Goal" style="padding: 0.5rem; display: flex; align-items: center; justify-content: center; background: rgba(255, 100, 100, 0.2); border-color: rgba(255, 100, 100, 0.3);">
                                <i data-lucide="trash-2" style="width: 16px; height: 16px; color: #ff6b6b;"></i>
                             </button>
                        </div>
                    </div>

                    <div style="margin-bottom: 0.5rem; display: flex; align-items: baseline; gap: 0.5rem;">
                        <span style="font-size: 2rem; font-weight: 900; color: rgb(var(--color-1));">${state.formatCurrency(goal.current_amount)}</span>
                        <span style="opacity: 0.6;"> / ${state.formatCurrency(goal.target_amount)}</span>
                    </div>

                    <!-- Progress Bar -->
                    <div style="background: rgba(255,255,255,0.1); border-radius: 99px; height: 10px; margin-bottom: 1.5rem; overflow: hidden;">
                        <div style="width: ${Math.min(progress, 100)}%; background: linear-gradient(to right, rgb(var(--color-1)), rgb(var(--color-2))); height: 100%; transition: width 0.5s;"></div>
                    </div>

                    <div style="margin-top: auto;">
                         <button class="nav-btn w-full add-funds-btn" data-id="${goal.id}" style="width: 100%; text-align: center;">+ ${state.t('add_funds')}</button>
                    </div>
                </div>
            `;
        }).join('');



        if (window.lucide) window.lucide.createIcons();

        // Attach Listeners

        // Add Funds
        document.querySelectorAll('.add-funds-btn').forEach(btn => {
            btn.onclick = async () => {
                const amount = prompt("How much would you like to add?");
                if (!amount) return;
                try {
                    await api(`/goals/${btn.dataset.id}?amount_added=${state.convertToUSD(parseFloat(amount))}`, 'PUT');
                    loadGoals();
                } catch (err) {
                    alert("Failed to update: " + err.message);
                }
            };
        });

        // Delete Goal
        document.querySelectorAll('.delete-goal-btn').forEach(btn => {
            btn.onclick = async () => {
                if (!confirm("Are you sure you want to delete this goal? This action cannot be undone.")) return;

                try {
                    await api(`/goals/${btn.dataset.id}`, 'DELETE');
                    // If we deleted the goal being edited, reset the form
                    if (editingGoalId == btn.dataset.id) {
                        resetFormState();
                    }
                    loadGoals();
                } catch (err) {
                    alert("Failed to delete goal: " + err.message);
                }
            };
        });

        // Edit Goal
        document.querySelectorAll('.edit-goal-btn').forEach(btn => {
            btn.onclick = () => {
                const goalId = parseInt(btn.dataset.id);
                const goal = goals.find(g => g.id === goalId);
                if (!goal) return;

                editingGoalId = goalId;
                formTitle.textContent = state.t('edit');
                submitBtn.textContent = state.t('update');
                cancelEditBtn.style.display = 'block';

                nameInput.value = goal.name;
                targetInput.value = state.convertFromUSD(goal.target_amount).toFixed(2);
                deadlineInput.value = goal.deadline || '';

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
        });
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        // Basic payload
        const payload = {
            name: formData.get('name'),
            target_amount: state.convertToUSD(parseFloat(formData.get('target_amount'))),
            deadline: formData.get('deadline') || null
        };

        try {
            if (editingGoalId) {
                // Update Mode
                await api(`/goals/${editingGoalId}`, 'PATCH', payload);
                resetFormState();
            } else {
                // Create Mode
                await api('/goals', 'POST', payload);
                form.reset();
            }
            loadGoals();
        } catch (err) {
            alert(`Error ${editingGoalId ? 'updating' : 'creating'} goal: ` + err.message);
        }
    };

    loadGoals();
}
