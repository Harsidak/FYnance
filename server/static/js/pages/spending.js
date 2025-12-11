
import { api } from '../app.js';

export async function renderSpending(container) {
    container.innerHTML = `
        <div>
            <h1 class="page-title">Spending Log</h1>
            
            <!-- Add Entry Form -->
            <div class="glass-card" style="margin-bottom: 3rem;">
                <h2 style="margin-bottom: 1.5rem;">Add New Expense</h2>
                <form id="spending-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; align-items: end;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Amount ($)</label>
                        <input type="number" step="0.01" name="amount" class="glass-input" required>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Category</label>
                        <select name="category" class="glass-input" required>
                            <option value="Food" style="color: black;">Food</option>
                            <option value="Transport" style="color: black;">Transport</option>
                            <option value="Entertainment" style="color: black;">Entertainment</option>
                            <option value="Shopping" style="color: black;">Shopping</option>
                            <option value="Utilities" style="color: black;">Utilities</option>
                            <option value="Other" style="color: black;">Other</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Description</label>
                        <input type="text" name="description" class="glass-input">
                    </div>
                    <div>
                         <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Date</label>
                        <input type="date" name="date" class="glass-input" required value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <button type="submit" class="btn-primary" style="margin-top: 0;">+ Add</button>
                </form>
            </div>

            <!-- List -->
            <div id="spending-list" class="glass" style="border-radius: 1.5rem; overflow: hidden;">
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
            listContainer.innerHTML = '<p style="padding: 2rem; text-align: center; opacity: 0.6;">No expenses found.</p>';
            return;
        }

        listContainer.innerHTML = `
             <div style="display: grid; gap: 1px; background: rgba(255,255,255,0.05);">
                ${data.map(item => `
                    <div style="display: flex; justify-content: space-between; padding: 1.5rem; background: rgba(15, 23, 42, 0.6);">
                        <div>
                            <div style="font-weight: bold; color: rgb(var(--color-2));">${item.category}</div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">${item.description || '-'}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-weight: bold; font-size: 1.1rem;">-$${item.amount.toFixed(2)}</div>
                            <div style="font-size: 0.8rem; opacity: 0.6;">${new Date(item.date).toLocaleDateString()}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
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
