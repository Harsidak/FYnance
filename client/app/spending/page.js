"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { Trash2, PlusCircle, DollarSign } from 'lucide-react';

export default function SpendingPage() {
    const [spending, setSpending] = useState([]);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        amount: '',
        category: 'Food',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchSpending = async () => {
        try {
            setError(null);
            const res = await api.get('/spending');
            setSpending(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setError("Failed to load spending data. Please try again later.");
        }
    };

    useEffect(() => {
        fetchSpending();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
                description: formData.description || "" // ensure string
            };
            await api.post('/spending', payload);
            setFormData({
                amount: '',
                category: 'Food',
                description: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchSpending();
        } catch (err) {
            console.error(err);
            setError("Failed to save expense. Please check your connection.");
        }
    };

    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <div className="max-w-5xl mx-auto p-6 pt-32 flex flex-col gap-8">
                <h1 className="text-4xl font-black text-gray-800 dark:text-white flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-[rgb(var(--color-2))] text-[rgb(var(--color-1))]"><DollarSign size={32} /></div>
                    Spending Log
                </h1>

                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        {error}
                    </div>
                )}

                {/* Add Entry */}
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Add New Expense</h2>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-5 gap-6 items-end">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-4 text-gray-500 font-bold">$</span>
                                <input
                                    type="number"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    className="glass-input pl-8 font-mono"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="glass-input cursor-pointer"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="glass-input cursor-pointer"
                            >
                                <option className="dark:bg-gray-900">Food</option>
                                <option className="dark:bg-gray-900">Transport</option>
                                <option className="dark:bg-gray-900">Entertainment</option>
                                <option className="dark:bg-gray-900">Shopping</option>
                                <option className="dark:bg-gray-900">Utilities</option>
                                <option className="dark:bg-gray-900">Health</option>
                                <option className="dark:bg-gray-900">Other</option>
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="glass-input"
                                placeholder="Details..."
                            />
                        </div>
                        <button type="submit" className="flex items-center justify-center gap-2 py-4 bg-[rgb(var(--color-1))] text-white rounded-2xl hover:bg-[rgb(var(--color-3))] font-bold shadow-lg shadow-[rgba(var(--color-1),0.3)] transition-all">
                            <PlusCircle size={20} /> Add Entry
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="glass rounded-3xl overflow-hidden shadow-lg">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-white/10 border-b border-white/10">
                            <tr>
                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest">Date</th>
                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest">Category</th>
                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest">Description</th>
                                <th className="p-6 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {spending.map((item) => (
                                <tr key={item.id} className="group hover:bg-white/5 transition-colors">
                                    <td className="p-6 font-medium text-gray-600 dark:text-gray-300">{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 text-xs rounded-full bg-[rgb(var(--color-5))]/30 text-[rgb(var(--color-1))] font-bold border border-[rgb(var(--color-5))]/50">
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="p-6 text-gray-800 dark:text-gray-200 font-medium">{item.description}</td>
                                    <td className="p-6 font-bold text-red-500 text-right">-${item.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
