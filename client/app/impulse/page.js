"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { Lock, Unlock, ShoppingBag, Trash2, Clock } from 'lucide-react';

export default function ImpulsePage() {
    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({ name: '', cost: '' });
    const [xpMessage, setXpMessage] = useState('');

    const fetchItems = async () => {
        try {
            const res = await api.get('/impulse');
            setItems(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/impulse', formData);
            setFormData({ name: '', cost: '' });
            fetchItems();
        } catch (err) {
            console.error(err);
        }
    };

    const handleBuy = async (id) => {
        try {
            await api.post(`/impulse/${id}/buy`);
            fetchItems();
        } catch (err) { alert(err.response?.data?.detail || "Error"); }
    };

    const handleResist = async (id) => {
        try {
            const res = await api.post(`/impulse/${id}/resist`);
            setXpMessage(res.data.message);
            setTimeout(() => setXpMessage(''), 3000);
            fetchItems();
        } catch (err) { alert(err.response?.data?.detail || "Error"); }
    };

    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <div className="max-w-5xl mx-auto p-6 pt-32 flex flex-col gap-10">

                <div className="flex justify-between items-end">
                    <h1 className="text-4xl font-black text-gray-800 dark:text-white flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-[rgb(var(--color-3))] text-white"><Lock size={32} /></div>
                        Impulse Jail
                    </h1>
                    {xpMessage && <div className="animate-bounce bg-green-500 text-white px-6 py-2 rounded-full font-bold shadow-lg">{xpMessage}</div>}
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Want something? Put it in jail for 24 hours. If you still want it later, buy it. If not, resist and earn <span className="text-[rgb(var(--color-1))] font-black">50 XP</span>!
                </p>

                {/* Add Item */}
                <div className="glass-card">
                    <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">Lock Up an Item</h2>
                    <form onSubmit={handleSubmit} className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Item Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="glass-input"
                                placeholder="e.g. Designer Shoes"
                                required
                            />
                        </div>
                        <div className="w-40">
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
                        <button type="submit" className="h-[52px] px-8 bg-[rgb(var(--color-1))] text-white rounded-2xl font-bold hover:bg-[rgb(var(--color-3))] transition-all shadow-lg">
                            Lock It 🔒
                        </button>
                    </form>
                </div>

                {/* The Jail (Locked Items) */}
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Lock className="text-red-500" /> Cell Block (Locked)
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {items.filter(i => i.status === 'LOCKED').map(item => (
                            <div key={item.id} className="relative p-6 rounded-3xl bg-red-500/10 border-2 border-red-500/20 flex flex-col items-center text-center overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10"><Lock size={100} /></div>
                                <h4 className="text-xl font-bold text-gray-800 dark:text-white z-10">{item.name}</h4>
                                <p className="text-red-500 font-mono font-bold text-lg mb-4 z-10">${item.cost}</p>
                                <div className="px-4 py-2 rounded-full bg-red-500 text-white text-sm font-bold flex items-center gap-2 z-10">
                                    <Clock size={16} /> Unlocks: {new Date(item.unlock_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        ))}
                        {items.filter(i => i.status === 'LOCKED').length === 0 && <p className="text-gray-500 italic">No inmates currently.</p>}
                    </div>
                </div>

                {/* The Yard (Unlocked) */}
                <div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Unlock className="text-green-500" /> The Yard (Ready to Decide)
                    </h3>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {items.filter(i => i.status === 'UNLOCKED').map(item => (
                            <div key={item.id} className="glass-card flex flex-col justify-between h-full">
                                <div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">{item.name}</h4>
                                    <p className="text-[rgb(var(--color-1))] font-mono font-bold text-lg mb-6">${item.cost}</p>
                                </div>
                                <div className="flex gap-4">
                                    <button onClick={() => handleBuy(item.id)} className="flex-1 py-3 bg-[rgb(var(--color-2))] text-[rgb(var(--color-1))] rounded-xl font-bold hover:opacity-80 transition-all flex justify-center items-center gap-2">
                                        <ShoppingBag size={18} /> Buy
                                    </button>
                                    <button onClick={() => handleResist(item.id)} className="flex-1 py-3 bg-[rgb(var(--color-1))] text-white rounded-xl font-bold hover:opacity-80 transition-all flex justify-center items-center gap-2">
                                        <Trash2 size={18} /> Resist
                                    </button>
                                </div>
                            </div>
                        ))}
                        {items.filter(i => i.status === 'UNLOCKED').length === 0 && <p className="text-gray-500 italic">Nothing ready to decide on yet.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
}
