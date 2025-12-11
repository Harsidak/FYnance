"use client";
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import api from '@/utils/api';

const SimulationGraph = () => {
    const [data, setData] = useState([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const fetchSimulation = async () => {
            try {
                const res = await api.post('/ai/simulate', {
                    current_balance: 5000,
                    avg_daily_spending: 150,
                    income_frequency_days: 30,
                    income_amount: 4000,
                    savings_goal: 10000
                });

                // transform structure for Recharts
                const current = res.data?.thirty_day_forecast?.current || [];
                const improved = res.data?.thirty_day_forecast?.improved || [];

                if (!Array.isArray(current) || !Array.isArray(improved)) {
                    console.error("Invalid forecast data format:", res.data);
                    return;
                }

                const chartData = current.map((val, idx) => ({
                    day: `Day ${idx + 1}`,
                    current: val,
                    improved: improved[idx] !== undefined ? improved[idx] : val
                }));

                console.log("Simulation Data Ready:", chartData);
                setData(chartData);
            } catch (error) {
                console.error("Simulation Error", error);
                // Set fallback data to prevent crash
                setData([]);
            }
        };
        fetchSimulation();
    }, []);

    if (!isMounted) return null;

    if (!Array.isArray(data) || data.length === 0) return null; // Don't render empty chart

    return (
        <div className="w-full bg-zinc-900/50 border border-white/5 rounded-xl p-4 mt-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <h3 className="font-semibold">Financial Twin Simulation (30 Days)</h3>
                </div>
                <div className="flex gap-4 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400/50"></div>
                        <span className="text-zinc-400">Current Path</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span className="text-zinc-400">AI Improved</span>
                    </div>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="simColorCurrent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="simColorImproved" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="#ffffff30"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                            stroke="#ffffff30"
                            tick={{ fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        <Area type="monotone" dataKey="current" stroke="#f87171" fillOpacity={1} fill="url(#simColorCurrent)" strokeWidth={2} />
                        <Area type="monotone" dataKey="improved" stroke="#34d399" fillOpacity={1} fill="url(#simColorImproved)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default SimulationGraph;
