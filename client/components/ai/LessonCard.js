"use client";
import React from 'react';
import { Lightbulb } from 'lucide-react';

const LessonCard = ({ lesson }) => {
    if (!lesson) return null;

    return (
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 mt-4">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
                    <Lightbulb className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-white text-sm">Micro-Lesson</h4>
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">Gemini AI</span>
                    </div>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                        {lesson}
                    </p>
                    <button className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                        Read full article →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LessonCard;
