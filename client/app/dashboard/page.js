"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/utils/api';
import SpendingChart from '@/components/SpendingChart';
import MoodSpendingChart from '@/components/MoodSpendingChart';
import InsightsPanel from '@/components/ai/InsightsPanel';
import SimulationGraph from '@/components/ai/SimulationGraph';
import LessonCard from '@/components/ai/LessonCard';
import Link from 'next/link';
import { Quote, AlertTriangle, TrendingUp, DollarSign, Target, Flame } from 'lucide-react';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [spendingData, setSpendingData] = useState([]);
    const [moodSpendingData, setMoodSpendingData] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roast, setRoast] = useState('');
    const [roastLoading, setRoastLoading] = useState(false);
    const [realityMode, setRealityMode] = useState(false);
    const [wageInput, setWageInput] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, spendingRes, correlationRes, goalsRes] = await Promise.all([
                    api.get('/users/me'),
                    api.get('/analytics/spending-trends'),
                    api.get('/analytics/mood-spending'),
                    api.get('/goals')
                ]);

                // Defensive checks to ensure arrays
                const spendingArr = Array.isArray(spendingRes.data) ? spendingRes.data : [];
                const moodArr = Array.isArray(correlationRes.data) ? correlationRes.data : [];
                const goalsArr = Array.isArray(goalsRes.data) ? goalsRes.data : [];

                setUser(userRes.data);
                setSpendingData(spendingArr);
                setMoodSpendingData(moodArr);
                setGoals(goalsArr);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleWageUpdate = async () => {
        try {
            await api.put('/users/me/wage', null, { params: { wage: wageInput } });
            setUser(prev => ({ ...prev, hourly_wage: parseFloat(wageInput) }));
            setRealityMode(true);
        } catch (err) { console.error(err); }
    };

    const toTime = (amount) => {
        if (!user?.hourly_wage || user.hourly_wage === 0) return `$${amount}`;
        const hours = amount / user.hourly_wage;
        return `${hours.toFixed(1)} hrs`;
    };

    const handleRoast = async () => {
        setRoastLoading(true);
        try {
            const res = await api.get('/analytics/roast');
            setRoast(res.data.roast);
        } catch (err) {
            setRoast("I'm too tired to roast you right now.");
        } finally {
            setRoastLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[rgb(var(--color-1))]"></div></div>;

    return (
        <div className="min-h-screen pb-20">
            <Navbar />
            <div className="flex flex-col p-6 pt-32 max-w-7xl mx-auto gap-8">

                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-2">Dashboard</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">Have a productive day, {user?.username}!</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* Reality Toggle */}
                        <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2">
                            <span className="text-xs font-bold uppercase text-gray-500">Reality Mode</span>
                            <button
                                onClick={() => setRealityMode(!realityMode)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${realityMode ? 'bg-[rgb(var(--color-1))]' : 'bg-gray-300'}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${realityMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3">
                            <span className="text-[rgb(var(--color-1))] font-black text-2xl">{user?.current_streak}</span>
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Day Streak</span>
                        </div>
                        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-3">
                            <span className="text-[rgb(var(--color-3))] font-black text-2xl">{user?.total_xp}</span>
                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total XP</span>
                        </div>
                    </div>
                </div>

                {/* AI Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Insights & Actions */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <InsightsPanel />
                        {/* Mock Lesson for demo - in reality passed from AI response */}
                        <LessonCard lesson="Did you know? Saving 10% of your income can lead to financial freedom in 15 years." />
                    </div>

                    {/* Simulation Graph */}
                    <div className="lg:col-span-2">
                        <SimulationGraph />
                    </div>
                </div>

                {/* Roast Widget */}
                <div className="glass p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-orange-600 flex items-center gap-2"><Flame /> Financial Roast</h2>
                        <button
                            onClick={handleRoast}
                            disabled={roastLoading}
                            className="px-4 py-2 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {roastLoading ? 'Cooking...' : 'Roast Me 🔥'}
                        </button>
                    </div>
                    {roast ? (
                        <p className="text-lg font-medium text-gray-800 dark:text-white italic">"{roast}"</p>
                    ) : (
                        <p className="text-gray-500 text-sm">Dare to press the button? Expect no mercy.</p>
                    )}
                </div>

                {/* Notifications */}
                {(() => {
                    const today = new Date().toISOString().split('T')[0];
                    const todaysSpending = spendingData.find(d => d.date === today)?.amount || 0;
                    const warnings = [];
                    if (todaysSpending > 100) {
                        warnings.push({ type: 'red', msg: `High Spending Alert: $${todaysSpending} spent today.` });
                    }
                    if (warnings.length === 0) return null;

                    return (
                        <div className="grid gap-4">
                            {warnings.map((w, i) => (
                                <div key={i} className="glass p-4 rounded-2xl border-l-4 border-red-500 flex items-center gap-4 text-red-600 dark:text-red-400 font-bold bg-red-50/50">
                                    <AlertTriangle size={24} />
                                    <span>{w.msg}</span>
                                </div>
                            ))}
                        </div>
                    );
                })()}

                {/* Charts */}
                <div className="grid gap-8 md:grid-cols-2">

                    <div className="glass-card">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[rgb(var(--color-2))] text-[rgb(var(--color-1))]"><TrendingUp size={20} /></div>
                                Spending Activity {realityMode && <span className="text-xs ml-2 px-2 py-1 bg-red-500 text-white rounded-lg">IN HOURS</span>}
                            </h2>
                            <Link href="/spending" className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 font-bold text-sm transition-colors">Log +</Link>
                        </div>
                        {realityMode && (!user?.hourly_wage || user.hourly_wage === 0) ? (
                            <div className="text-center py-10">
                                <p className="mb-4 text-gray-600 dark:text-gray-300 font-medium">Set your hourly wage to see the real cost of your life.</p>
                                <div className="flex justify-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="$ / hr"
                                        className="glass-input w-32"
                                        value={wageInput}
                                        onChange={(e) => setWageInput(e.target.value)}
                                    />
                                    <button onClick={handleWageUpdate} className="px-4 py-2 bg-[rgb(var(--color-1))] text-white rounded-xl font-bold">Save</button>
                                </div>
                            </div>
                        ) : (
                            <SpendingChart data={spendingData.map(d => realityMode ? { ...d, amount: parseFloat((d.amount / user.hourly_wage).toFixed(2)) } : d)} />
                        )}
                    </div>

                    <div className="glass-card">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[rgb(var(--color-4))] text-white"><Quote size={20} /></div>
                                Mood Correlation
                            </h2>
                            <Link href="/mood" className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 font-bold text-sm transition-colors">Checkin +</Link>
                        </div>
                        <MoodSpendingChart data={moodSpendingData} />
                    </div>

                </div>

                {/* Goals */}
                <div className="glass-card">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-[rgb(var(--color-1))] text-white"><Target size={20} /></div>
                            Savings Goals
                        </h2>
                        <Link href="/goals" className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 font-bold text-sm transition-colors">Manage</Link>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {goals.slice(0, 3).map(goal => (
                            <div key={goal.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="flex justify-between mb-4">
                                    <span className="font-bold text-lg text-gray-800 dark:text-white">{goal.name}</span>
                                    <span className="font-mono text-[rgb(var(--color-1))]">${goal.current_amount}</span>
                                </div>
                                <div className="w-full bg-gray-200/50 rounded-full h-3 dark:bg-gray-700/50 overflow-hidden">
                                    <div className="bg-gradient-to-r from-[rgb(var(--color-1))] to-[rgb(var(--color-3))] h-full rounded-full" style={{ width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%` }}></div>
                                </div>
                                <p className="text-right text-xs mt-2 text-gray-500 font-medium">Target: ${goal.target_amount}</p>
                            </div>
                        ))}
                        {goals.length === 0 && <div className="p-8 text-center text-gray-400 bg-white/5 rounded-2xl border-dashed border-2 border-white/20">No goals yet. Start saving!</div>}
                    </div>
                </div>

            </div>
        </div>
    );
}
