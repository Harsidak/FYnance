
import { api } from '../app.js';

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

            <!-- List -->
            <h3 class="ios-card-header" style="margin-left: 1rem; margin-bottom: 0.5rem;">History</h3>
            <div id="spending-list" class="ios-list">
                <div class="loading">Loading entries...</div>
            </div>
        </div>
    `;

    const form = document.getElementById('spending-form');
    const listContainer = document.getElementById('spending-list');

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

        listContainer.innerHTML = data.map(item => `
            <div class="ios-list-item">
                <div>
                    <div class="text-bold">${item.category}</div>
                    <div class="text-caption">${item.description || '-'}</div>
                </div>
                <div style="text-align: right;">
                    <div class="text-bold text-primary">-$${item.amount.toFixed(2)}</div>
                    <div class="text-caption">${new Date(item.date).toLocaleDateString()}</div>
                </div>
            </div>
        `).join('');
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
