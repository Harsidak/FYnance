"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { CreditCard, Trash2, Calendar, AlertTriangle } from 'lucide-react';

export default function SubscriptionsPage() {
    const [subs, setSubs] = useState([]);
    const [formData, setFormData] = useState({ name: '', cost: '', billing_cycle: 'Monthly' });
    const [loading, setLoading] = useState(true);

    const fetchSubs = async () => {
        try {
            const res = await api.get('/subscriptions');
            setSubs(res.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchSubs(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/subscriptions', formData);
            setFormData({ name: '', cost: '', billing_cycle: 'Monthly' });
            fetchSubs();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Stop tracking this leech?")) return;
        try {
            await api.delete(`/subscriptions/${id}`);
            fetchSubs();
        } catch (err) { console.error(err); }
    };

    const calculateBleed = () => {
        let annual = 0;
        let monthly = 0;
        subs.forEach(s => {
            if (s.billing_cycle === 'Monthly') {
                annual += s.cost * 12;
                monthly += s.cost;
            } else {
                annual += s.cost;
                monthly += s.cost / 12;
            }
        });
        return { annual, monthly };
    };

    const { annual, monthly } = calculateBleed();

    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <div className="max-w-5xl mx-auto p-6 pt-32 flex flex-col gap-10">

                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 dark:text-white flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-red-500 text-white"><AlertTriangle size={32} /></div>
                            Leech Tracker
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 font-medium">Manage your recurring subscriptions. They bleed you dry.</p>
                    </div>
                    <div className="glass px-6 py-4 rounded-3xl flex items-center gap-6 border-l-4 border-red-500">
                        <div>
                            <div className="text-xs text-red-500 uppercase font-bold tracking-wider">Annual Bleed</div>
                            <div className="text-3xl font-black text-gray-800 dark:text-white">${annual.toFixed(0)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Monthly Burn</div>
                            <div className="text-xl font-bold text-gray-800 dark:text-white">${monthly.toFixed(0)}</div>
                        </div>
                    </div>
                </div>

                {/* Add Sub */}
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Add New Leech</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Service Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="glass-input"
                                placeholder="e.g. Netflix"
                                required
                            />
                        </div>
                        <div className="md:w-32">
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Cost ($)</label>
                            <input
                                type="number"
                                value={formData.cost}
                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                className="glass-input"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="md:w-40">
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Cycle</label>
                            <select
                                value={formData.billing_cycle}
                                onChange={(e) => setFormData({ ...formData, billing_cycle: e.target.value })}
                                className="glass-input cursor-pointer"
                            >
                                <option className="dark:bg-gray-900">Monthly</option>
                                <option className="dark:bg-gray-900">Yearly</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full md:w-auto h-[52px] px-8 bg-gray-800 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg">
                            Track It
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="grid gap-4 md:grid-cols-2">
                    {subs.map(sub => (
                        <div key={sub.id} className="glass p-6 rounded-3xl flex justify-between items-center group hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800 dark:text-white">{sub.name}</h4>
                                    <p className="text-sm text-gray-500 font-bold">{sub.billing_cycle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-xl font-mono font-black text-red-500">-${sub.cost}</div>
                                </div>
                                <button onClick={() => handleDelete(sub.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {subs.length === 0 && <p className="text-gray-500 italic col-span-2 text-center py-10">No subscriptions tracked. Are you really free, or just forgetting?</p>}
                </div>

            </div>
        </div>
    );
}
