"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import { Smile, Frown, Meh, Save } from 'lucide-react';

export default function MoodPage() {
    const [moods, setMoods] = useState([]);
    const [score, setScore] = useState(5);
    const [note, setNote] = useState('');

    const fetchMoods = async () => {
        try {
            const res = await api.get('/mood');
            setMoods(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchMoods();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/mood', { score, note });
            setScore(5);
            setNote('');
            fetchMoods();
        } catch (err) {
            console.error(err);
        }
    };

    const getMoodIcon = (s) => {
        if (s >= 8) return <Smile size={24} className="text-green-500" />;
        if (s >= 5) return <Meh size={24} className="text-yellow-500" />;
        return <Frown size={24} className="text-red-500" />;
    };

    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <div className="max-w-4xl mx-auto p-6 pt-32 flex flex-col gap-8">
                <h1 className="text-4xl font-black text-gray-800 dark:text-white flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-[rgb(var(--color-4))] text-white"><Smile size={32} /></div>
                    Mood Tracker
                </h1>

                {/* Log Mood */}
                <div className="glass-card relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-3 h-full bg-[rgb(var(--color-1))]"></div>
                    <h2 className="text-2xl font-bold mb-8 text-gray-800 dark:text-gray-100 pl-4">How are you feeling properly?</h2>

                    <form onSubmit={handleSubmit} className="space-y-8 pl-4">
                        <div>
                            <div className="flex justify-between mb-4 px-2">
                                <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Awful</span>
                                <span className="text-3xl font-black text-[rgb(var(--color-1))]">{score}</span>
                                <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Amazing</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={score}
                                onChange={(e) => setScore(parseInt(e.target.value))}
                                className="w-full h-4 bg-gray-200/50 rounded-full appearance-none cursor-pointer accent-[rgb(var(--color-1))] dark:bg-black/30"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-2">Note (Optional)</label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="glass-input min-h-[120px]"
                                placeholder="Why do you feel this way?"
                            ></textarea>
                        </div>

                        <button type="submit" className="flex items-center justify-center gap-2 w-full py-4 bg-[rgb(var(--color-3))] text-white rounded-2xl hover:bg-[rgb(var(--color-1))] font-bold shadow-lg shadow-[rgba(var(--color-3),0.3)] transition-all">
                            <Save size={20} /> Save Mood Log
                        </button>
                    </form>
                </div>

                {/* History */}
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Recent Logs</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {moods.map((item) => (
                            <div key={item.id} className="glass p-6 rounded-3xl flex items-start gap-4 hover:bg-white/20 transition-colors">
                                <div className="p-4 bg-white/40 dark:bg-black/40 rounded-2xl shadow-sm">
                                    {getMoodIcon(item.score)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="font-black text-gray-800 dark:text-white text-xl">{item.score}/10</span>
                                        <span className="text-xs text-gray-500 font-bold">• {new Date(item.date).toLocaleDateString()}</span>
                                    </div>
                                    {item.note && <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium">"{item.note}"</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
