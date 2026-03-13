"use client";

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge, RequestStatus } from "@/components/StatusBadge";
import { CheckCircle, Volume2, VolumeX, Eye, Utensils, Bell, Search, LogOut, RefreshCw, ShoppingBag } from "lucide-react";
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

    // Load initial preference from localStorage and setup global click listener
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
            const confirmed = window.confirm("WARNING: Muting alarms may lead to missed guest requests. Are you sure you want to silence the traffic control signals?");
            if (confirmed) {
                setAudioEnabled(false);
                localStorage.setItem('admin_audio_enabled', 'false');
            }
        }
    };

    const getRowStyle = (room: string, type: string) => {
        if (room.toLowerCase() === "takeaway") {
            return "bg-purple-50/80 hover:bg-purple-100 border-l-[8px] border-l-purple-600 shadow-[inset_4px_0_0_rgba(147,51,234,0.05)]";
        }
        const lowerType = type.toLowerCase();
        if (lowerType.includes("water")) {
            return "bg-blue-50/50 hover:bg-blue-100/50 border-l-[8px] border-l-blue-600 animate-pulse";
        }
        if (lowerType.includes("waiter") || lowerType.includes("restaurant") || lowerType.includes("room service")) {
            return "bg-amber-50/20 hover:bg-amber-50 border-l-[4px] border-l-amber-400";
        }
        return "hover:bg-gray-50/50 border-l-[4px] border-l-transparent";
    };

    const sortedRequests = [...requests].sort((a, b) => b.timestamp - a.timestamp);

    const getAllowedTypesForRole = (role: string) => {
        const lowerRole = role.toLowerCase();
        if (lowerRole === 'admin' || lowerRole === 'reception') return null; // See all
        if (lowerRole === 'kitchen') return ["Dining Order", "Restaurant Order", "Mineral Water", "Water", "Waiter Call", "Tea", "Coffee"];
        if (lowerRole === 'housekeeping') return ["Towel", "Cleaning", "Laundry", "Room Service"];
        return ["Waiter Call"]; // Default for others
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

    const currentDisplayRequests = activeTab === "queue" ? queueRequests : (activeTab === "active" ? activeRequests : historyRequests);

    const billedRequests = requests.filter(r => (r.price || 0) > 0);
    const totalRevenue = billedRequests.reduce((sum, r) => sum + (r.total || 0), 0);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Audio Signal Awareness Banner */}
            <AnimatePresence>
                {!audioEnabled && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
                    >
                        <button
                            onClick={toggleAudio}
                            className="w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between group hover:bg-slate-800 transition-all border-b-4 border-slate-700 active:border-b-0 active:translate-y-1"
                        >
                            <div className="flex items-center">
                                <div className="bg-red-500/20 p-2 rounded-xl mr-4 animate-pulse">
                                    <VolumeX className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-sm uppercase tracking-wider">Signals Are Muted</p>
                                    <p className="text-[10px] font-bold text-slate-400 opacity-80">You will not hear new guest alerts. Click to activate.</p>
                                </div>
                            </div>
                            <div className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:scale-105 transition-transform">
                                Turn On
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Live Requests</h1>
                    <p className="text-slate-500 font-medium">Monitoring {requests.length} active signals</p>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search Room / Type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/10 transition-all outline-none"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <button
                        onClick={toggleAudio}
                        className={`flex items-center px-5 py-2.5 rounded-2xl font-bold transition-all shadow-sm active:scale-95 ${audioEnabled ? 'bg-red-600 text-white shadow-red-100' : 'bg-white text-slate-600 border border-slate-200'}`}
                    >
                        {audioEnabled ? <Volume2 className="w-5 h-5 mr-2" /> : <VolumeX className="w-5 h-5 mr-2" />}
                        {audioEnabled ? "Alarms On" : "Alarms Off"}
                    </button>

                    <button
                        onClick={async () => {
                            if (window.confirm("Are you sure you want to log out?")) {
                                await signOut();
                                router.push(`/${hotelSlug}/admin/login`);
                            }
                        }}
                        className="flex items-center px-5 py-2.5 rounded-2xl font-bold bg-white text-red-600 border border-red-100 hover:bg-red-50 transition-all shadow-sm active:scale-95"
                    >
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <button onClick={() => setActiveTab("queue")} className={`p-6 rounded-3xl border transition-all text-left ${activeTab === 'queue' ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500/20' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'queue' ? 'text-amber-600' : 'text-slate-400'}`}>Queue</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{queueRequests.length}</p>
                </button>
                <button onClick={() => setActiveTab("active")} className={`p-6 rounded-3xl border transition-all text-left ${activeTab === 'active' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>Active</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{activeRequests.length}</p>
                </button>
                <div className="bg-white p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Revenue</p>
                    <p className="text-3xl font-black text-blue-600 mt-1">₹{totalRevenue.toFixed(0)}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col justify-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Tables</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{Array.from(new Set(requests.filter(r => r.status !== 'Completed').map(r => r.room))).length}</p>
                </div>
            </div>

            {/* Tab Header */}
            <div className="bg-white rounded-t-[2.5rem] border-x border-t border-slate-100 p-6 flex items-center justify-between shadow-sm">
                <h2 className="text-xl font-black text-slate-900 capitalize">
                    {activeTab === 'queue' ? '🔥 New Orders' : (activeTab === 'active' ? '⚡ Processing' : '📁 History')}
                </h2>
                <div className="flex space-x-1">
                    {["queue", "active", "history"].map(t => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t as any)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Traffic Table */}
            <div className="bg-white rounded-b-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-12">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Guest</th>
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Request</th>
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Time</th>
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {currentDisplayRequests.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-slate-300 font-bold tracking-tight italic">
                                    No {activeTab} signals at this time...
                                </td>
                            </tr>
                        ) : (
                            currentDisplayRequests.map((req) => (
                                <tr key={req.id} className={`transition-all duration-300 group ${getRowStyle(req.room, req.type)}`}>
                                    <td className="p-5">
                                        <div className="flex items-center">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black mr-4 shadow-xl text-white ${req.room.toLowerCase() === 'takeaway' ? 'bg-purple-600 shadow-purple-200' : 'bg-slate-900 shadow-slate-200'}`}>
                                                {req.room.toLowerCase() === 'takeaway' ? <ShoppingBag className="w-5 h-5"/> : req.room}
                                            </div>
                                            <div>
                                                <span className={`font-black block ${req.room.toLowerCase() === 'takeaway' ? 'text-purple-700' : 'text-slate-900'}`}>
                                                    {req.room.toLowerCase() === 'takeaway' ? 'Takeaway' : `Room ${req.room}`}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center mb-1">
                                            {(req.type.toLowerCase().includes("restaurant") || req.type.toLowerCase().includes("room service")) ?
                                                <Utensils className="w-4 h-4 mr-2 text-amber-600" /> :
                                                <Bell className="w-4 h-4 mr-2 text-blue-600" />
                                            }
                                            <span className="font-black text-slate-900">{req.type}</span>
                                        </div>
                                        {req.notes && (
                                            <div className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors line-clamp-1 italic font-medium">"{req.notes}"</div>
                                        )}
                                    </td>
                                    <td className="p-5 text-center">
                                        <span className="text-xs font-black text-slate-900">{req.time}</span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end space-x-3">
                                            <button
                                                onClick={() => setSelectedRequest(req)}
                                                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-200 group-hover:shadow-sm"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>

                                            {req.status === "Pending" && (
                                                <button onClick={() => updateStatus(req.id, "Assigned")} className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
                                                    Accept
                                                </button>
                                            )}
                                            {req.status === "Assigned" && (
                                                <button onClick={() => updateStatus(req.id, "In Progress")} className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95">
                                                    Start
                                                </button>
                                            )}
                                            {req.status === "In Progress" && (
                                                <button onClick={() => updateStatus(req.id, "Completed")} className="bg-green-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs hover:bg-green-700 transition-all shadow-xl shadow-green-100 active:scale-95 flex items-center">
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Finish
                                                </button>
                                            )}
                                            {req.status === "Completed" && (
                                                <div className="flex items-center text-green-600 font-black text-[10px] uppercase tracking-widest italic pr-4">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Archived
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <RequestDetailModal
                request={selectedRequest}
                hotelId={branding?.id || ""}
                onClose={() => setSelectedRequest(null)}
            />
        </div>
    );
}
