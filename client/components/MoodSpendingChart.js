"use client";
import React from 'react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function MoodSpendingChart({ data }) {
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    // data: [{ "date": ..., "spending": 50, "mood": 7 }]

    if (!isMounted) return null;

    if (!Array.isArray(data) || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg">No data available</div>;
    }

    return (
        <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        stroke="#9CA3AF"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis yAxisId="left" stroke="#10B981" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 10]} stroke="#8B5CF6" fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="spending" fill="#10B981" stroke="#10B981" fillOpacity={0.2} name="Spending ($)" />
                    <Line yAxisId="right" type="monotone" dataKey="mood" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} name="Mood (1-10)" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
