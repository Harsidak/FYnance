"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, DollarSign, Smile, Target, BarChart2, Lock, CreditCard } from 'lucide-react';

export default function Navbar() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        setIsLoggedIn(!!token);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/signin');
        setIsLoggedIn(false);
    };

    const NavLink = ({ href, icon: Icon, children }) => (
        <Link
            href={href}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/20 transition-all text-sm font-medium text-gray-800 dark:text-gray-200"
        >
            <Icon size={18} className="text-[rgb(var(--color-1))]" /> {children}
        </Link>
    );

    return (
        <nav className="fixed top-4 left-0 right-0 z-50 px-4">
            <div className="max-w-6xl mx-auto glass rounded-full px-6 py-3 flex items-center justify-between">

                <Link href="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[rgb(var(--color-1))] to-[rgb(var(--color-3))] px-2">
                    FYNANCE
                </Link>

                <div className="hidden md:flex items-center gap-2">
                    {isLoggedIn ? (
                        <>
                            <NavLink href="/dashboard" icon={BarChart2}>Dashboard</NavLink>
                            <NavLink href="/spending" icon={DollarSign}>Spending</NavLink>
                            <NavLink href="/mood" icon={Smile}>Mood</NavLink>
                            <NavLink href="/goals" icon={Target}>Goals</NavLink>
                            <NavLink href="/subscriptions" icon={CreditCard}>Subs</NavLink>
                            <button
                                onClick={handleLogout}
                                className="ml-2 px-5 py-2 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 font-bold text-xs uppercase tracking-wide transition-all"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/signin" className="px-5 py-2 rounded-full hover:bg-white/20 transition-all text-sm font-bold text-gray-700 dark:text-gray-300">
                                Sign In
                            </Link>
                            <Link href="/signup" className="px-6 py-2 rounded-full bg-[rgb(var(--color-1))] text-white hover:opacity-90 transition-all text-sm font-bold shadow-lg shadow-[rgba(var(--color-1),0.3)]">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                <button className="md:hidden p-2 text-gray-800 dark:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="mt-2 max-w-6xl mx-auto glass rounded-3xl overflow-hidden p-4 md:hidden flex flex-col gap-2">
                    {isLoggedIn ? (
                        <>
                            <NavLink href="/dashboard" icon={BarChart2}>Dashboard</NavLink>
                            <NavLink href="/spending" icon={DollarSign}>Spending</NavLink>
                            <NavLink href="/mood" icon={Smile}>Mood</NavLink>
                            <NavLink href="/goals" icon={Target}>Goals</NavLink>
                            <NavLink href="/subscriptions" icon={CreditCard}>Subs</NavLink>
                            <button onClick={handleLogout} className="text-left text-red-500 font-bold px-4 py-2">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/signin" className="px-4 py-3 rounded-xl hover:bg-white/10">Sign In</Link>
                            <Link href="/signup" className="px-4 py-3 rounded-xl bg-[rgb(var(--color-1))] text-white font-bold">Sign Up</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
