"use client";
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, BrainCircuit } from 'lucide-react';
import api from '@/utils/api';

const InsightsPanel = () => {
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // ...
        // Mock fetch or real fetch to /ai/predict
        // For demo purposes, we might just show a static or mocked state 
        // if no transactions exist yet.
        const fetchInsight = async () => {
            try {
                // In a real app, pass actual user data or have backend fetch it
                // In a real app, pass actual user data or have backend fetch it
                const res = await api.post('/ai/predict', {
                    user_id: 1,
                    transactions: [], // Backend would typically fetch this itself if not passed
                    mood_logs: []
                });
                setInsight(res.data);
            } catch (error) {
                console.error("AI Insight Error", error);
                // Fallback mock
                setInsight({
                    risk_score: 0.2,
                    trigger_reason: "Stable spending patterns detected",
                    recommended_intervention: "Keep maintaining your budget!"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, []);

    if (!isMounted) return null;

    if (loading) return <div className="text-white/50 animate-pulse">Analyzing financial behaviour...</div>;

    const getRiskColor = (score) => {
        if (score > 0.7) return "text-red-400 border-red-500/30 bg-red-500/10";
        if (score > 0.4) return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
        return "text-green-400 border-green-500/30 bg-green-500/10";
    };

    return (
        <div className={`p-4 rounded-xl border backdrop-blur-md ${getRiskColor(insight?.risk_score)} transition-all duration-500`}>
            <div className="flex items-center gap-3 mb-2">
                <BrainCircuit className="w-5 h-5" />
                <h3 className="font-semibold text-lg">AI Financial Analysis</h3>
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm opacity-80">Risk Score</span>
                    <span className="font-bold">{(insight?.risk_score * 100).toFixed(0)}%</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-current transition-all duration-1000 ease-out"
                        style={{ width: `${insight?.risk_score * 100}%` }}
                    />
                </div>

                <h4 className="mt-2 text-sm font-bold text-white/90">{insight?.trigger_reason}</h4>
                <p className="text-sm font-medium text-white/70">{insight?.recommended_intervention}</p>

                {insight?.action && (
                    <button className="mt-2 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10 font-bold">
                        👉 {insight.action}
                    </button>
                )}
            </div>
        </div>
    );
};

export default InsightsPanel;
