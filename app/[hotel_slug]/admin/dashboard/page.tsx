"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge, RequestStatus } from "@/components/StatusBadge";
import { CheckCircle, Volume2, VolumeX, Eye, Utensils, Bell, Search, LogOut, RefreshCw, ShoppingBag, Hotel, Inbox, LayoutDashboard, ShieldAlert, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, useSupabaseRequestsState, updateSupabaseRequestStatus, HotelRequest, signOut, useAuth, useProfile, useHotelRooms, isDiningRequest, isHousekeepingRequest, isServiceRequest, requestTypeMatches, type SyncStatus } from "@/utils/store";
import { startAdminAlert, stopAdminAlert, startWaterAlert, stopWaterAlert, initAudioContext } from "@/utils/audio";
import { RequestDetailModal } from "@/components/RequestDetailModal";

function SyncHealth({ status, error, lastSyncedAt }: { status: SyncStatus; error: string | null; lastSyncedAt: number | null }) {
    const lastSeen = lastSyncedAt
        ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : "Awaiting first sync";

    if (status === "subscribed" && !error) {
        return (
            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-2 shadow-sm">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-[#3E2723]/5">
                        <CheckCircle className="w-6 h-6 text-[#F59E0B]" />
                    </div>
                    <div>
                        <h4 className="font-black text-[#3E2723] leading-none mb-1 uppercase tracking-widest text-xs">Crave Network Healthy</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Realtime pulse is active. Last check at {lastSeen}.</p>
                    </div>
                </div>
            </div>
        );
    }

    const isHardFailure = status === "error" || !!error;

    return (
        <div className={`${isHardFailure ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"} border rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 mb-2 shadow-sm`}>
            <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${isHardFailure ? "bg-red-100" : "bg-amber-100"} rounded-2xl flex items-center justify-center`}>
                    {isHardFailure ? (
                        <ShieldAlert className="w-6 h-6 text-red-600" />
                    ) : (
                        <RefreshCw className="w-6 h-6 text-amber-600 animate-spin" />
                    )}
                </div>
                <div>
                    <h4 className={`font-black leading-none mb-1 ${isHardFailure ? "text-red-900" : "text-amber-900"}`}>
                        {isHardFailure ? "LIVE SYNC NEEDS ATTENTION" : "LIVE SYNC DEGRADED"}
                    </h4>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isHardFailure ? "text-red-700/80" : "text-amber-700/80"}`}>
                        {error || "Realtime subscription is unstable. Auto refresh fallback is active, so the admin panel should still update without manual reload."}
                    </p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isHardFailure ? "text-red-500/80" : "text-amber-500/80"}`}>
                        Last sync: {lastSeen}
                    </p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <button
                    onClick={() => window.alert("Run the 'fix_supabase_schema.sql' script in Supabase SQL Editor, then reload this admin page.")}
                    className={`${isHardFailure ? "bg-red-600 shadow-red-200 hover:bg-red-700" : "bg-amber-600 shadow-amber-200 hover:bg-amber-700"} text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all active:scale-95`}
                >
                    SQL Repair
                </button>
            </div>
        </div>
    );
}

export default function AdminHub() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const {
        branding,
        loading: brandingLoading,
        syncStatus: brandingSyncStatus,
        fetchError: brandingError,
        lastSyncedAt: brandingLastSyncedAt,
    } = useHotelBranding(hotelSlug);
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: profileLoading } = useProfile(user?.id);
    const {
        requests,
        syncStatus: requestsSyncStatus,
        fetchError: requestsError,
        lastSyncedAt: requestsLastSyncedAt,
    } = useSupabaseRequestsState(branding?.id);
    const {
        rooms,
        syncStatus: roomsSyncStatus,
        fetchError: roomsError,
        lastSyncedAt: roomsLastSyncedAt,
    } = useHotelRooms(branding?.id);

    const [audioEnabled, setAudioEnabled] = useState(true);
    const [audioInitialized, setAudioInitialized] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<HotelRequest | null>(null);
    const [activeTab, setActiveTab] = useState<"queue" | "active" | "history">("queue");
    const [searchQuery, setSearchQuery] = useState("");

    const loading = brandingLoading || authLoading || profileLoading;
    const syncStates: SyncStatus[] = [brandingSyncStatus, requestsSyncStatus, roomsSyncStatus];
    const syncStatus = syncStates.includes("error")
        ? "error"
        : syncStates.includes("degraded")
            ? "degraded"
            : syncStates.includes("connecting")
                ? "connecting"
                : "subscribed";
    const syncError = requestsError || roomsError || brandingError || null;
    const syncLastSyncedAt = Math.max(brandingLastSyncedAt || 0, requestsLastSyncedAt || 0, roomsLastSyncedAt || 0) || null;

    useEffect(() => {
        if (!brandingLoading && branding) {
            console.log("--- ADMIN DIAGNOSTIC ---");
            console.log("Hotel Slug:", hotelSlug);
            console.log("Branding ID:", branding.id);
            console.log("Is Demo Mode:", branding.id?.toString().startsWith('demo-') ? "YES" : "NO (Supabase)");
            console.log("Requests Count:", requests.length);
            console.log("------------------------");
        }
    }, [branding, brandingLoading, requests.length, hotelSlug]);

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

    const sortedRequests = requests;

    const getAllowedTypesForRole = (role: string) => {
        const lowerRole = role.toLowerCase();
        if (lowerRole === 'admin' || lowerRole === 'reception') return null;
        if (lowerRole === 'kitchen') return ["Dining Order", "Restaurant Order", "Water", "Tea", "Coffee"];
        if (lowerRole === 'housekeeping') return ["Towel", "Cleaning", "Laundry", "Room Service"];
        return ["Waiter Call"];
    };

    const allowedTypes = profile?.role ? getAllowedTypesForRole(profile.role) : null;

    const roleFilteredRequests = sortedRequests.filter(r => {
        if (!allowedTypes) return true;
        if (profile?.role?.toLowerCase() === 'kitchen') {
            return isDiningRequest(r.type) || requestTypeMatches(r.type, allowedTypes);
        }
        if (profile?.role?.toLowerCase() === 'housekeeping') {
            return isHousekeepingRequest(r.type) || requestTypeMatches(r.type, allowedTypes);
        }
        if (profile?.role?.toLowerCase() === 'waiter' || profile?.role?.toLowerCase() === 'staff') {
            return isServiceRequest(r.type) || requestTypeMatches(r.type, allowedTypes);
        }
        return requestTypeMatches(r.type, allowedTypes);
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
        <div className="p-8 max-w-[1600px] mx-auto space-y-12 pb-20 bg-noise min-h-screen text-[#3E2723]">
            {/* Sync Status Banner */}
            {branding && branding.id && !branding.id.toString().startsWith('demo-') && (
                <SyncHealth status={syncStatus} error={syncError} lastSyncedAt={syncLastSyncedAt} />
            )}

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
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F59E0B] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F59E0B]"></span>
                            </span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]">Live Pulse</p>
                        </div>
                        <h1 className="text-5xl font-black text-[#3E2723] tracking-tight leading-none mb-4 uppercase">
                            Café <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3E2723] to-[#F59E0B]">Pulse</span>
                        </h1>
                        <div className="flex items-center space-x-6 text-slate-400 font-bold text-xs uppercase tracking-widest">
                            <div className="flex items-center">
                                <RefreshCw className="w-3 h-3 mr-2 animate-spin-slow" />
                                Updated Now
                            </div>
                            <div className="flex items-center">
                                <ShoppingBag className="w-3 h-3 mr-2 text-[#F59E0B]" />
                                {requests.length} Active Cravings
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => router.push(`/${hotelSlug}/admin/analytics`)}
                        className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center group mb-2"
                    >
                        <BarChart3 className="w-4 h-4 mr-2 text-indigo-500 group-hover:text-indigo-300" />
                        Business Performance
                    </button>
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
                </div>
            </header>

            {/* PRIMARY METRICS: Animated Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Pending Cravings', value: queueRequests.length, color: 'orange', icon: <Bell />, tab: 'queue' },
                    { label: 'Fulfilling', value: activeRequests.length, color: 'brown', icon: <RefreshCw />, tab: 'active' },
                    { label: 'Crave Revenue', value: `₹${totalRevenue.toFixed(0)}`, color: 'orange', icon: <ShoppingBag /> },
                    { label: 'Active Tables', value: Array.from(new Set(requests.filter(r => r.status !== 'Completed').map(r => r.room))).length, color: 'brown', icon: <Hotel /> }
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
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{req.time}</span>
                                                        {(req.total || 0) > 0 && (
                                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/50">
                                                                ₹{req.total}
                                                            </span>
                                                        )}
                                                    </div>
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

                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                         
                        <div className="grid grid-cols-4 md:grid-cols-5 gap-6 relative z-10">
                            {rooms.length > 0 ? (
                                rooms.map(room => {
                                    const activeReq = requests.filter(r => r.room === room.room_number && r.status !== 'Completed');
                                    const isActive = activeReq.length > 0;
                                    const isRevenue = activeReq.some(r => (r.total || 0) > 0);

                                    return (
                                        <motion.button 
                                            key={room.id}
                                            whileHover={{ scale: 1.05, translateY: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                if (isActive) {
                                                    setSelectedRequest(activeReq[0]);
                                                }
                                            }}
                                            className={`aspect-square rounded-[2rem] flex flex-col items-center justify-center transition-all border-2 relative group overflow-hidden shadow-sm ${isActive 
                                                ? (isRevenue ? 'bg-indigo-600 border-indigo-500 text-white shadow-indigo-200' : 'bg-slate-900 border-slate-800 text-white shadow-slate-200') 
                                                : (room.is_occupied ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-50 border-slate-100 hover:border-slate-200 border-dashed')}`}
                                        >
                                            <span className={`text-base font-black mb-1 ${!isActive && !room.is_occupied ? 'opacity-20' : 'opacity-100'}`}>{room.room_number}</span>
                                            
                                            {isActive && (
                                                <div className="flex items-center space-x-1.5">
                                                    <motion.div 
                                                        animate={{ scale: [1, 1.4, 1] }}
                                                        transition={{ duration: 1.5, repeat: Infinity }}
                                                        className={`w-2 h-2 rounded-full ${isRevenue ? 'bg-white' : 'bg-red-500'}`} 
                                                    />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">{activeReq.length} SIG</span>
                                                </div>
                                            )}

                                            {!isActive && room.is_occupied && (
                                                <div className="flex items-center space-x-1">
                                                    <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">LIVE</span>
                                                </div>
                                            )}

                                            {isActive && (
                                                <div className="absolute top-2 right-2">
                                                    <motion.div 
                                                        animate={{ opacity: [0, 1, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className={`w-1.5 h-1.5 rounded-full ${isRevenue ? 'bg-emerald-400' : 'bg-amber-400'}`} 
                                                    />
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })
                            ) : (
                                [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => (
                                    <div key={n} className="aspect-square bg-slate-50/50 rounded-[2rem] border border-slate-100 border-dashed animate-pulse" />
                                ))
                            )}
                        </div>
                        
                        <div className="mt-12 pt-8 border-t border-slate-50 space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                <span>Signal Matrix Legend</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-[#3E2723]/5 shadow-sm">
                                    <div className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-lg shadow-[#F59E0B]/20" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">High Craving</span>
                                </div>
                                <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-[#3E2723]/5 shadow-sm">
                                    <div className="w-3 h-3 rounded-full bg-[#3E2723] shadow-lg shadow-[#3E2723]/10" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Impulse Alert</span>
                                </div>
                                <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-[#3E2723]/5 shadow-sm">
                                    <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-200" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seated</span>
                                </div>
                                <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-[#3E2723]/5 shadow-sm">
                                    <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200 border-dashed" />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available</span>
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
