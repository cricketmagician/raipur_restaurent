"use client";

import Link from "next/link";
import { LayoutDashboard, Inbox, Hotel, Utensils, Settings, Users, BarChart3, Receipt, Shirt, ConciergeBell, ShieldAlert, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useAuth, getUserProfile, UserProfile, isDemoMode } from "@/utils/store";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const hotelSlug = (params?.hotel_slug as string) || '';
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Check if we are on the login page
    const isLoginPage = pathname?.endsWith('/login') || pathname?.includes('/auth/');

    useEffect(() => {
        if (authLoading) return;

        if (!user && !isLoginPage) {
            // In demo mode we might allow it, but generally redirect to login
            if (!isDemoMode()) {
                router.push(`/${hotelSlug}/admin/login`);
            }
            setProfileLoading(false);
            return;
        }

        if (user) {
            const fetchProfile = async () => {
                const { data } = await getUserProfile(user.id);
                setProfile(data);
                setProfileLoading(false);
            };
            fetchProfile();
        } else {
            setProfileLoading(false);
        }
    }, [user, authLoading, hotelSlug, isLoginPage, router]);

    const navItems = [
        { id: 'dashboard', name: "Dashboard", href: `/${hotelSlug}/admin/dashboard`, icon: <Inbox className="w-5 h-5" />, roles: ['admin', 'reception', 'kitchen', 'housekeeping', 'waiter'] },
        { id: 'analytics', name: "Analytics", href: `/${hotelSlug}/admin/analytics`, icon: <BarChart3 className="w-5 h-5" />, roles: ['admin'] },
        { id: 'rooms', name: "Tables & QR", href: `/${hotelSlug}/admin/rooms`, icon: <Hotel className="w-5 h-5" />, roles: ['admin', 'reception'] },
        { id: 'menu', name: "Menu Management", href: `/${hotelSlug}/admin/menu`, icon: <Utensils className="w-5 h-5" />, roles: ['admin', 'kitchen'] },
        { id: 'staff', name: "Staff Management", href: `/${hotelSlug}/admin/staff`, icon: <Users className="w-5 h-5" />, roles: ['admin'] },
        { id: 'branding', name: "Hotel Settings", href: `/${hotelSlug}/admin/branding`, icon: <Settings className="w-5 h-5" />, roles: ['admin'] },
    ];

    // Filtered nav items based on role
    const userRole = profile?.role || (isDemoMode() ? 'admin' : 'staff');
    const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

    // Check if current path is allowed
    const isPathAllowed = () => {
        if (userRole === 'admin') return true;
        const currentItem = navItems.find(item => pathname === item.href);
        if (!currentItem) return true; // Internal or unknown routes
        return currentItem.roles.includes(userRole);
    };

    if (isLoginPage) {
        return <main className="min-h-screen bg-slate-50">{children}</main>;
    }

    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!isPathAllowed()) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-red-50 text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h1>
                    <p className="text-slate-500 font-medium mb-8">You do not have permission to access this department. Please return to your assigned dashboard.</p>
                    <button
                        onClick={() => router.back()}
                        className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold transition-transform active:scale-95"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Minimalist Sidebar */}
            <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 hidden md:flex flex-col h-screen sticky top-0 z-40 transition-all duration-500 ease-in-out">
                <div className="p-7 mb-2">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 transform transition-transform hover:scale-105 duration-300">
                            <Hotel className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">
                                Dine<span className="text-indigo-600 italic">Flow</span>
                            </h1>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">OS v2.0</p>
                        </div>
                    </div>
                    
                    <div className="inline-flex items-center px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100/50">
                        <motion.div 
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                        />
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600">{userRole} Online</span>
                    </div>
                </div>

                <nav className="px-4 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                    <p className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 mt-2">Navigation</p>
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 group ${isActive
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className={`mr-3.5 transition-all duration-300 ${isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-slate-900'}`}>
                                    {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-5 h-5 stroke-[2.5px]" })}
                                </div>
                                <span className="tracking-tight">{item.name}</span>
                                {isActive && (
                                    <motion.div 
                                        layoutId="activeNav"
                                        className="ml-auto w-1 h-4 bg-indigo-400 rounded-full" 
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                <Users className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-black text-slate-900 truncate">{profile?.full_name || 'Staff Member'}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase truncate">Verified Account</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push(`/${hotelSlug}/guest/dashboard`)}
                            className="w-full flex items-center justify-center py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm active:scale-95 group"
                        >
                            <LayoutDashboard className="w-3 h-3 mr-2 opacity-60 group-hover:opacity-100" />
                            Guest View
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen overflow-x-hidden relative">
                {/* Modern subtle background patterns */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />
                
                <div className="relative z-10 h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
