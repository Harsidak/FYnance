"use client";
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex flex-col items-center justify-center pt-40 px-6 text-center max-w-5xl mx-auto">

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 backdrop-blur-md border border-white/40 text-[rgb(var(--color-1))] font-bold text-sm mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[rgb(var(--color-2))] animate-pulse"></span>
          The Future of Student Finance
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-tight">
          Financial <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[rgb(var(--color-1))] via-[rgb(var(--color-3))] to-[rgb(var(--color-4))]">
            Wellness
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mb-12 font-medium">
          FYNANCE isn't just a tracker. It's a glass-clear window into your spending habits and emotional health.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
          <Link href="/signup" className="group relative px-8 py-4 bg-[rgb(var(--color-1))] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[rgba(var(--color-1),0.4)] hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">Get Started Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </Link>
          <Link href="/signin" className="px-8 py-4 bg-white/40 dark:bg-black/40 backdrop-blur-lg border border-white/30 rounded-2xl font-bold text-lg text-gray-900 dark:text-white hover:bg-white/50 transition-all">
            Login to Account
          </Link>
        </div>

        {/* Floating Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 w-full">
          {[
            { title: "Smart Tracking", icon: "💎", desc: "Crystal clear insights into your daily spending." },
            { title: "Mood Analysis", icon: "🧬", desc: "Understand the link between your emotions and wallet." },
            { title: "Gamified Goals", icon: "🔮", desc: "Level up your financial life with XP and streaks." }
          ].map((card, i) => (
            <div key={i} className="glass-card text-left group">
              <div className="text-4xl mb-4 p-4 rounded-2xl bg-white/20 w-fit backdrop-blur-sm group-hover:scale-110 transition-transform">{card.icon}</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">{card.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">{card.desc}</p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
