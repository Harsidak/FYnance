"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { Target, Plus, CheckCircle, Wallet } from 'lucide-react';

export default function GoalsPage() {
    const [goals, setGoals] = useState([]);
    const [formData, setFormData] = useState({ name: '', target_amount: '', deadline: '' });

    const fetchGoals = async () => {
        try {
            const res = await api.get('/goals');
            setGoals(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/goals', formData);
            setFormData({ name: '', target_amount: '', deadline: '' });
            fetchGoals();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddFunds = async (goalId) => {
        const amount = prompt("Amount to add:");
        if (!amount) return;
        try {
            await api.put(`/goals/${goalId}?amount_added=${amount}`);
            fetchGoals();
        } catch (err) {
            alert("Failed to update");
        }
    };

    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <div className="max-w-6xl mx-auto p-6 pt-32 flex flex-col gap-10">
                <h1 className="text-4xl font-black text-gray-800 dark:text-white flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-[rgb(var(--color-1))] text-white"><Target size={32} /></div>
                    Savings Goals
                </h1>

                {/* Create Goal */}
                <div className="relative rounded-3xl p-8 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--color-1))] to-[rgb(var(--color-3))] opacity-90 backdrop-blur-xl"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-8 text-white flex items-center gap-2"><Wallet /> Create a New Goal</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-end">
                            <div className="flex-[2] w-full">
                                <label className="block text-sm font-bold text-white mb-2 opacity-90">Goal Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-4 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 font-medium backdrop-blur-md"
                                    placeholder="e.g. Dream Vacation"
                                    required
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-bold text-white mb-2 opacity-90">Target ($)</label>
                                <input
                                    type="number"
                                    value={formData.target_amount}
                                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                                    className="w-full p-4 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 font-medium backdrop-blur-md"
                                    required
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-bold text-white mb-2 opacity-90">Deadline</label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full p-4 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60 font-medium backdrop-blur-md"
                                />
                            </div>
                            <button type="submit" className="w-full md:w-auto p-4 bg-white text-[rgb(var(--color-1))] rounded-2xl hover:bg-[rgb(var(--color-2))] font-bold transition-colors flex items-center justify-center gap-2 shadow-lg">
                                <Plus size={24} /> Create
                            </button>
                        </form>
                    </div>
                </div>

                {/* Goals List */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {goals.map((goal) => {
                        const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                        return (
                            <div key={goal.id} className="glass-card group relative overflow-hidden">
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">{goal.name}</h3>
                                        {goal.deadline && <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">Due: {new Date(goal.deadline).toLocaleDateString()}</p>}
                                    </div>
                                    {progress >= 100 && <CheckCircle className="text-green-500" size={28} />}
                                </div>

                                <div className="flex items-end gap-2 mb-3 relative z-10">
                                    <span className="text-4xl font-black text-[rgb(var(--color-1))]">${goal.current_amount}</span>
                                    <span className="text-sm font-bold text-gray-400 mb-2">/ ${goal.target_amount}</span>
                                </div>

                                <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-4 mb-8 relative z-10 overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-[rgb(var(--color-2))] to-[rgb(var(--color-3))]`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                </div>

                                <button
                                    onClick={() => handleAddFunds(goal.id)}
                                    className="w-full py-3 rounded-xl bg-white/50 dark:bg-black/20 hover:bg-[rgb(var(--color-1))] hover:text-white text-gray-600 dark:text-gray-300 font-bold transition-all border border-white/20"
                                >
                                    + Add Funds
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
