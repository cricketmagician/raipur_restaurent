"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge, RequestStatus } from "@/components/StatusBadge";
import { CheckCircle, Volume2, VolumeX, Eye, Utensils, Bell, Search, LogOut, RefreshCw, ShoppingBag, Hotel, Inbox, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, useSupabaseRequests, updateSupabaseRequestStatus, HotelRequest, signOut, useAuth, useProfile, useHotelRooms } from "@/utils/store";
import { startAdminAlert, stopAdminAlert, startWaterAlert, stopWaterAlert, initAudioContext } from "@/utils/audio";
import { RequestDetailModal } from "@/components/RequestDetailModal";

export default function AdminHub() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const hotelId = params.hotel_id as string;

    const { branding, loading: brandingLoading } = useHotelBranding(hotelSlug);
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: profileLoading } = useProfile(user?.id);
    const requests = useSupabaseRequests(hotelId);
    const { rooms, loading: roomsLoading } = useHotelRooms(branding?.id);

    const [audioEnabled, setAudioEnabled] = useState(true);
    const [audioInitialized, setAudioInitialized] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<HotelRequest | null>(null);
    const [activeTab, setActiveTab] = useState<"queue" | "active" | "history">("queue");
    const [searchQuery, setSearchQuery] = useState("");

    const loading = brandingLoading || authLoading || profileLoading;

    // Load initial preference from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('admin_audio_enabled');
            if (saved !== null) {
                setAudioEnabled(saved === 'true');
            }

            const handleGlobalClick = () => {
                if (!audioInitialized) {
                    initAudioContext();
                    setAudioInitialized(true);
                }
            };
            window.addEventListener('mousedown', handleGlobalClick);
            window.addEventListener('touchstart', handleGlobalClick);
            return () => {
                window.removeEventListener('mousedown', handleGlobalClick);
                window.removeEventListener('touchstart', handleGlobalClick);
            }
        }
    }, [audioInitialized]);

    useEffect(() => {
        if (!audioEnabled || !requests.length) {
            stopAdminAlert();
            stopWaterAlert();
            return;
        }
        const hasWater = requests.some(r => (r.type === "Water" || r.type === "Mineral Water") && r.status === "Pending");
        const hasWaiterCall = requests.some(r => r.type === "Waiter Call" && r.status === "Pending");
        const hasPending = requests.some(r => r.status === "Pending");

        if (hasWater) {
            stopAdminAlert();
            startWaterAlert();
        } else if (hasWaiterCall || hasPending) {
            stopWaterAlert();
            startAdminAlert();
        } else {
            stopAdminAlert();
            stopWaterAlert();
        }
    }, [requests, audioEnabled]);

    const updateStatus = async (id: string, newStatus: RequestStatus) => {
        await updateSupabaseRequestStatus(id, newStatus);
    };

    const toggleAudio = () => {
        if (!audioEnabled) {
            initAudioContext();
            setAudioEnabled(true);
            setAudioInitialized(true);
            localStorage.setItem('admin_audio_enabled', 'true');
        } else {
            const confirmed = window.confirm("WARNING: Muting alarms may lead to missed guest requests. Are you sure you want to silence the alerts?");
            if (confirmed) {
                setAudioEnabled(false);
                localStorage.setItem('admin_audio_enabled', 'false');
            }
        }
    };

    const sortedRequests = [...requests].sort((a, b) => b.timestamp - a.timestamp);

    const getAllowedTypesForRole = (role: string) => {
        const lowerRole = role.toLowerCase();
        if (lowerRole === 'admin' || lowerRole === 'reception') return null;
        if (lowerRole === 'kitchen') return ["Dining Order", "Restaurant Order", "Mineral Water", "Water", "Waiter Call", "Tea", "Coffee"];
        if (lowerRole === 'housekeeping') return ["Towel", "Cleaning", "Laundry", "Room Service"];
        return ["Waiter Call"];
    };

    const allowedTypes = profile?.role ? getAllowedTypesForRole(profile.role) : null;

    const roleFilteredRequests = sortedRequests.filter(r => {
        if (!allowedTypes) return true;
        return allowedTypes.some(type => r.type.toLowerCase().includes(type.toLowerCase()));
    });

    const filteredBySearch = roleFilteredRequests.filter(r =>
        r.room.includes(searchQuery) ||
        r.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const queueRequests = filteredBySearch.filter(r => r.status === "Pending");
    const activeRequests = filteredBySearch.filter(r => r.status === "Assigned" || r.status === "In Progress");
    const historyRequests = filteredBySearch.filter(r => r.status === "Completed");

    const billedRequests = requests.filter(r => (r.price || 0) > 0);
    const totalRevenue = billedRequests.reduce((sum, r) => sum + (r.total || 0), 0);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"
            />
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-12 pb-20">
            {/* Audio Awareness Banner */}
            <AnimatePresence>
                {!audioEnabled && (
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4"
                    >
                        <button
                            onClick={toggleAudio}
                            className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-[2rem] shadow-2xl flex items-center justify-between group overflow-hidden relative"
                        >
                            <div className="flex items-center relative z-10">
                                <div className="bg-red-500/10 p-2.5 rounded-full mr-4">
                                    <VolumeX className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-xs uppercase tracking-widest text-red-400">Audio Muted</p>
                                    <p className="text-[10px] font-bold text-slate-400">New requests will be silent</p>
                                </div>
                            </div>
                            <div className="bg-white text-slate-900 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest relative z-10 group-hover:scale-105 transition-transform">
                                Unmute
                            </div>
                            <motion.div 
                                animate={{ x: ['100%', '-100%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent opacity-30"
                            />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* THE PULSE: Hero Section */}
            <header className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
                <div className="lg:col-span-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div>
                        <div className="flex items-center space-x-2 mb-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Live Pulse</p>
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                            Operational <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Overview</span>
                        </h1>
                        <div className="flex items-center space-x-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                            <div className="flex items-center">
                                <RefreshCw className="w-3 h-3 mr-2 animate-spin-slow" />
                                Updated Now
                            </div>
                            <div className="flex items-center">
                                <Search className="w-3 h-3 mr-2" />
                                {requests.length} Active Signals
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 flex items-center justify-end space-x-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Find room..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-200/60 rounded-full py-3 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none w-64 shadow-sm group-hover:shadow-md"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-4.5 top-1/2 -translate-y-1/2" />
                    </div>
                    <button
                        onClick={async () => {
                            if (window.confirm("Confirm System Access Termination?")) {
                                await signOut();
                                router.push(`/${hotelSlug}/admin/login`);
                            }
                        }}
                        className="bg-white border border-red-100 text-red-500 p-3.5 rounded-full hover:bg-red-50 transition-all shadow-sm group active:scale-95"
                    >
                        <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </header>

            {/* PRIMARY METRICS: Animated Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Incoming', value: queueRequests.length, color: 'emerald', icon: <Bell />, tab: 'queue' },
                    { label: 'In Progress', value: activeRequests.length, color: 'indigo', icon: <RefreshCw />, tab: 'active' },
                    { label: 'Daily Revenue', value: `₹${totalRevenue.toFixed(0)}`, color: 'blue', icon: <ShoppingBag /> },
                    { label: 'Occupied Tables', value: Array.from(new Set(requests.filter(r => r.status !== 'Completed').map(r => r.room))).length, color: 'slate', icon: <Hotel /> }
                ].map((stat, i) => (
                    <motion.button
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => stat.tab && setActiveTab(stat.tab as any)}
                        className={`p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 text-left transition-all group hover:border-${stat.color}-200/50 hover:shadow-2xl hover:shadow-${stat.color}-100/40 relative overflow-hidden active:scale-[0.98] ${activeTab === stat.tab ? `ring-2 ring-${stat.color}-500 bg-${stat.color}-50/30` : ''}`}
                    >
                        <div className={`p-4 bg-${stat.color}-50 rounded-2xl w-fit mb-6 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                            {React.cloneElement(stat.icon as React.ReactElement<any>, { className: "w-6 h-6 stroke-[2.5px]" })}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                        
                        <div className={`absolute bottom-0 right-0 w-24 h-24 bg-${stat.color}-50 rounded-tl-[4rem] group-hover:scale-110 transition-transform -z-0 opacity-50`} />
                    </motion.button>
                ))}
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* LIVE FEED: Animated Center */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            {['queue', 'active', 'history'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`text-xs font-black uppercase tracking-widest transition-all relative py-2 ${activeTab === tab ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    {tab === 'queue' ? 'Queue' : (tab === 'active' ? 'Active' : 'History')}
                                    {activeTab === tab && (
                                        <motion.div 
                                            layoutId="tabLine"
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" 
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative min-h-[400px]">
                        <AnimatePresence mode="popLayout">
                            {(activeTab === 'queue' ? queueRequests : (activeTab === 'active' ? activeRequests : historyRequests)).length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-2 flex flex-col items-center justify-center p-20 text-slate-300 italic font-bold"
                                >
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <CheckCircle className="w-8 h-8 opacity-20" />
                                    </div>
                                    No {activeTab} activity at the moment
                                </motion.div>
                            ) : (
                                (activeTab === 'queue' ? queueRequests : (activeTab === 'active' ? activeRequests : historyRequests)).map((req) => (
                                    <motion.div
                                        key={req.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                        className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-lg shadow-slate-100/50 hover:shadow-2xl hover:shadow-slate-200/40 transition-all border-l-4 border-l-indigo-600 relative group overflow-hidden"
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex items-center">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mr-4 shadow-xl ${req.room.toLowerCase() === 'takeaway' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-white'}`}>
                                                    {req.room.toLowerCase() === 'takeaway' ? <ShoppingBag className="w-6 h-6"/> : req.room}
                                                </div>
                                                <div>
                                                    <span className="font-black text-slate-900 block text-lg leading-tight">
                                                        {req.room.toLowerCase() === 'takeaway' ? 'Takeaway' : `Table ${req.room}`}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.time}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setSelectedRequest(req)}
                                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Eye className="w-4 h-4 text-slate-400" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center p-3 bg-slate-50 rounded-xl">
                                                <Utensils className="w-4 h-4 mr-3 text-indigo-600" />
                                                <span className="font-bold text-slate-900 text-sm">{req.type}</span>
                                            </div>
                                            {req.notes && (
                                                <div className="text-xs text-slate-500 font-medium italic border-l-2 border-slate-200 pl-3 py-1">
                                                    "{req.notes}"
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 flex space-x-2">
                                            {req.status === "Pending" && (
                                                <button onClick={() => updateStatus(req.id, "Assigned")} className="flex-1 bg-slate-900 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95">
                                                    Accept Access
                                                </button>
                                            )}
                                            {req.status === "Assigned" && (
                                                <button onClick={() => updateStatus(req.id, "In Progress")} className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-700 transition-all active:scale-95">
                                                    Initialize Process
                                                </button>
                                            )}
                                            {req.status === "In Progress" && (
                                                <button onClick={() => updateStatus(req.id, "Completed")} className="flex-1 bg-emerald-600 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Complete Cycle
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* TABLE STATUS MAP: Floor Overview */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Environment View</h2>
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50">Real-time Map</span>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/20">
                        <div className="grid grid-cols-4 gap-4">
                            {rooms.length > 0 ? (
                                rooms.map(room => {
                                    const isActive = requests.some(r => r.room === room.room_number && r.status !== 'Completed');
                                    return (
                                        <div 
                                            key={room.id}
                                            className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all border-2 relative group overflow-hidden ${isActive 
                                                ? 'bg-indigo-50 border-indigo-200' 
                                                : (room.is_occupied ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:border-slate-200')}`}
                                        >
                                            <span className={`text-sm font-black mb-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{room.room_number}</span>
                                            <div className="flex space-x-1">
                                                <div className={`w-1 h-1 rounded-full ${room.is_occupied ? 'bg-indigo-400' : 'bg-slate-200'}`} />
                                                {isActive && (
                                                    <motion.div 
                                                        animate={{ scale: [1, 1.5, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                        className="w-1 h-1 rounded-full bg-red-400" 
                                                    />
                                                )}
                                            </div>
                                            {isActive && (
                                                <div className="absolute top-1 right-1">
                                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                [1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                                    <div key={n} className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 border-dashed" />
                                ))
                            )}
                        </div>
                        
                        <div className="mt-8 space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>Legend</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded bg-indigo-50 border border-indigo-200" />
                                    <span className="text-[10px] font-bold text-slate-500">Active Request</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
                                    <span className="text-[10px] font-bold text-slate-500">Occupied</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Trend Mini View */}
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Estimated Performance</p>
                            <h3 className="text-3xl font-black tracking-tight mb-6">Excellent</h3>
                            <div className="flex items-end space-x-1 h-12">
                                {[3,5,4,7,6,8,10,9,12].map((v, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${v * 8}%` }}
                                        transition={{ delay: 1 + (i * 0.05) }}
                                        className="flex-1 bg-white/20 rounded-t-sm"
                                    />
                                ))}
                            </div>
                        </div>
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" 
                        />
                    </div>
                </div>
            </div>

            <RequestDetailModal
                request={selectedRequest}
                hotelId={branding?.id || ""}
                onClose={() => setSelectedRequest(null)}
            />
        </div>
    );
}
