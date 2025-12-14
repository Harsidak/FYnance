
import { api, state } from '../app.js';

export async function renderSpending(container) {
    container.innerHTML = `
        <div>
            <h1 class="page-title">Spending Log</h1>
            
            <!-- Add Entry Form (Inset Grouped) -->
            <div class="ios-card">
                <div class="ios-card-header">New Expense</div>
                <form id="spending-form" class="ios-form">
                    <div class="ios-input-group">
                        <label class="ios-label">Amount</label>
                        <input type="number" step="0.01" name="amount" class="ios-input" placeholder="$0.00" required>
                    </div>
                    
                    <div class="ios-input-group">
                        <label class="ios-label">Category</label>
                        <select name="category" class="ios-input" required style="background: transparent; color: var(--ios-text);">
                            <option value="Food" style="color: black;">Food</option>
                            <option value="Transport" style="color: black;">Transport</option>
                            <option value="Entertainment" style="color: black;">Entertainment</option>
                            <option value="Shopping" style="color: black;">Shopping</option>
                            <option value="Utilities" style="color: black;">Utilities</option>
                            <option value="Other" style="color: black;">Other</option>
                        </select>
                    </div>

                    <div class="ios-input-group">
                        <label class="ios-label">Description</label>
                        <input type="text" name="description" class="ios-input" placeholder="e.g. Lunch at Joe's">
                    </div>

                    <div class="ios-input-group" style="border-bottom: none;">
                        <label class="ios-label">Date</label>
                        <input type="date" name="date" class="ios-input" required value="${new Date().toISOString().split('T')[0]}">
                    </div>

                    <button type="submit" class="ios-btn">Add Expense</button>
                </form>
            </div>

    <!-- List Header & Toggle -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-left: 1rem; margin-right: 1rem; margin-bottom: 0.5rem;">
                <h3 class="ios-card-header" style="margin: 0;">History</h3>
                <button id="toggle-reality" class="text-caption" style="background: none; border: 1px solid var(--ios-text-secondary); padding: 2px 8px; result: 4px; color: var(--ios-text-secondary);">
                    ${state.realityMode ? '⏳ Time Cost' : '💲 Cash'}
                </button>
            </div>
            <div id="spending-list" class="ios-list">
                <div class="loading">Loading entries...</div>
            </div>
        </div>
    `;

    const form = document.getElementById('spending-form');
    const listContainer = document.getElementById('spending-list');

    // Toggle Reality Mode
    document.getElementById('toggle-reality').onclick = (e) => {
        state.realityMode = !state.realityMode;
        e.target.innerText = state.realityMode ? '⏳ Time Cost' : '💲 Cash';
        // Reload list to apply new mode
        loadSpending();
    };

    // Load Data
    const loadSpending = async () => {
        try {
            const data = await api('/spending');
            renderList(data);
        } catch (err) {
            listContainer.innerHTML = `<div style="padding: 2rem; color: coral;">Error: ${err.message}</div>`;
        }
    };

    const renderList = (data) => {
        if (!data.length) {
            listContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--ios-text-secondary);">No expenses found.</div>';
            return;
        }

        const hourlyWage = state.user?.hourly_wage || 15; // Default fallback

        listContainer.innerHTML = data.map(item => {
            let displayAmount;
            let displayColor = 'text-primary';

            if (state.realityMode) {
                const hours = item.amount / hourlyWage;
                displayAmount = `${hours.toFixed(1)} hrs`;
                displayColor = 'var(--c-violet-neon)';
            } else {
                displayAmount = `-$${item.amount.toFixed(2)}`;
            }

            return `
            <div class="ios-list-item">
                <div>
                    <div class="text-bold">${item.category}</div>
                    <div class="text-caption">${item.description || '-'}</div>
                </div>
                <div style="text-align: right;">
                    <div class="text-bold" style="color: ${displayColor};">${displayAmount}</div>
                    <div class="text-caption">${new Date(item.date).toLocaleDateString()}</div>
                </div>
            </div>
        `}).join('');
    };

    // Handle Submit
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const payload = {
            amount: parseFloat(formData.get('amount')),
            category: formData.get('category'),
            description: formData.get('description') || "",
            date: formData.get('date')
        };

        try {
            await api('/spending', 'POST', payload);
            form.reset();
            // Reset date to today
            form.querySelector('[name="date"]').value = new Date().toISOString().split('T')[0];
            loadSpending();
        } catch (err) {
            alert("Failed to add expense: " + err.message);
        }
    };

    loadSpending();
}
