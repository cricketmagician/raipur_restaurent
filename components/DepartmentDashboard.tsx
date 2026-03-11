"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge, RequestStatus } from "@/components/StatusBadge";
import { CheckCircle, Volume2, VolumeX, Eye, Utensils, Bell, Search, Shirt, ConciergeBell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, useSupabaseRequests, updateSupabaseRequestStatus, HotelRequest } from "@/utils/store";
import { startAdminAlert, stopAdminAlert, startWaterAlert, stopWaterAlert, initAudioContext } from "@/utils/audio";
import { RequestDetailModal } from "@/components/RequestDetailModal";

interface DepartmentDashboardProps {
    department: 'kitchen' | 'laundry' | 'reception';
    title: string;
    icon: React.ReactNode;
}

export function DepartmentDashboard({ department, title, icon }: DepartmentDashboardProps) {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    const { branding, loading } = useHotelBranding(hotelSlug);
    const allRequests = useSupabaseRequests(branding?.id);

    const [audioEnabled, setAudioEnabled] = useState(true);
    const [audioInitialized, setAudioInitialized] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<HotelRequest | null>(null);
    const [activeTab, setActiveTab] = useState<"queue" | "active" | "history">("queue");
    const [searchQuery, setSearchQuery] = useState("");

    // Department filtering logic
    const filterRequests = (requests: HotelRequest[]) => {
        return requests.filter(r => {
            const type = r.type.toLowerCase();
            if (department === 'kitchen') {
                return type.includes('restaurant') || type.includes('room service') || type.includes('breakfast');
            }
            if (department === 'laundry') {
                return type.includes('laundry') || type.includes('dry cleaning');
            }
            if (department === 'reception') {
                // Catch-all for reception or specific ones
                const isKitchen = type.includes('restaurant') || type.includes('room service') || type.includes('breakfast');
                const isLaundry = type.includes('laundry') || type.includes('dry cleaning');
                return !isKitchen && !isLaundry;
            }
            return true;
        });
    };

    const requests = filterRequests(allRequests);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(`admin_audio_enabled_${department}`);
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
    }, [department, audioInitialized]);

    useEffect(() => {
        if (!audioEnabled) {
            stopAdminAlert();
            stopWaterAlert();
            return;
        }

        const hasWater = requests.some(r => r.type === "Water" && r.status === "Pending");
        const hasPending = requests.some(r => r.status === "Pending");

        if (hasWater && department === 'reception') {
            stopAdminAlert();
            startWaterAlert();
        } else if (hasPending) {
            stopWaterAlert();
            startAdminAlert();
        } else {
            stopAdminAlert();
            stopWaterAlert();
        }
    }, [requests, audioEnabled, department]);

    const updateStatus = async (id: string, newStatus: RequestStatus) => {
        await updateSupabaseRequestStatus(id, newStatus);
    };

    const toggleAudio = () => {
        if (!audioEnabled) {
            initAudioContext();
            setAudioEnabled(true);
            setAudioInitialized(true);
            localStorage.setItem(`admin_audio_enabled_${department}`, 'true');
        } else {
            const confirmed = window.confirm("Mute alerts for this department?");
            if (confirmed) {
                setAudioEnabled(false);
                localStorage.setItem(`admin_audio_enabled_${department}`, 'false');
            }
        }
    };

    const getRowStyle = (type: string) => {
        const lowerType = type.toLowerCase();
        if (lowerType === "water") return "bg-blue-50/50 border-l-8 border-l-blue-600 animate-pulse";
        if (lowerType.includes("restaurant")) return "bg-amber-50/20 border-l-4 border-l-amber-400";
        return "hover:bg-gray-50/50 border-l-4 border-l-transparent";
    };

    const sortedRequests = [...requests].sort((a, b) => b.timestamp - a.timestamp);
    const filteredBySearch = sortedRequests.filter(r =>
        r.room.includes(searchQuery) || r.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const queueRequests = filteredBySearch.filter(r => r.status === "Pending");
    const activeRequests = filteredBySearch.filter(r => r.status === "Assigned" || r.status === "In Progress");
    const historyRequests = filteredBySearch.filter(r => r.status === "Completed");

    const currentDisplayRequests = activeTab === "queue" ? queueRequests : (activeTab === "active" ? activeRequests : historyRequests);

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
                                    <p className="font-black text-sm uppercase tracking-wider">{title} Signals Muted</p>
                                    <p className="text-[10px] font-bold text-slate-400 opacity-80">Click to activate departmental alerts.</p>
                                </div>
                            </div>
                            <div className="bg-white text-slate-900 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest group-hover:scale-105 transition-transform">
                                Turn On
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subtle initialization prompt */}
            <AnimatePresence>
                {audioEnabled && !audioInitialized && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed bottom-6 right-6 z-50 pointer-events-none"
                    >
                        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                            Audio Standby - Click anywhere to activate
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div className="flex items-center">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mr-4 text-slate-900 border border-slate-100">
                        {icon}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">{title} Dashboard</h1>
                        <p className="text-slate-500 font-medium">Managing {requests.length} localized signals</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search Room..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/10"
                        />
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>

                    <button
                        onClick={toggleAudio}
                        className={`flex items-center px-5 py-2.5 rounded-2xl font-bold transition-all ${audioEnabled ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-white text-slate-600 border border-slate-200'}`}
                    >
                        {audioEnabled ? <Volume2 className="w-5 h-5 mr-2" /> : <VolumeX className="w-5 h-5 mr-2" />}
                        {audioEnabled ? "Alarms Live" : "Muted"}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
                <button onClick={() => setActiveTab("queue")} className={`p-6 rounded-3xl border transition-all text-left ${activeTab === 'queue' ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-500/20' : 'bg-white border-slate-100'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Signals</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{queueRequests.length}</p>
                </button>
                <button onClick={() => setActiveTab("active")} className={`p-6 rounded-3xl border transition-all text-left ${activeTab === 'active' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500/20' : 'bg-white border-slate-100'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Processing</p>
                    <p className="text-3xl font-black text-slate-900 mt-1">{activeRequests.length}</p>
                </button>
                <div className="bg-white p-6 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed Today</p>
                    <p className="text-3xl font-black text-green-600 mt-1">{historyRequests.length}</p>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">Current Queue</h2>
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
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50">
                        <tr>
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Room</th>
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {currentDisplayRequests.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-slate-300 font-bold italic">Clear skies! No pending signals.</td>
                            </tr>
                        ) : (
                            currentDisplayRequests.map((req) => (
                                <tr key={req.id} className={`group transition-all ${getRowStyle(req.type)}`}>
                                    <td className="p-5">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black mr-3 shadow-sm">{req.room}</div>
                                            <span className="font-bold text-slate-900">Room {req.room}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center">
                                            {department === 'kitchen' ? <Utensils className="w-4 h-4 mr-2 text-amber-500" /> : (department === 'laundry' ? <Shirt className="w-4 h-4 mr-2 text-blue-500" /> : <ConciergeBell className="w-4 h-4 mr-2 text-slate-500" />)}
                                            <span className="font-bold text-slate-900">{req.type}</span>
                                        </div>
                                        {req.notes && <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">"{req.notes}"</p>}
                                    </td>
                                    <td className="p-5 text-xs"><StatusBadge status={req.status} /></td>
                                    <td className="p-5 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button onClick={() => setSelectedRequest(req)} className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                                            {req.status === "Pending" && <button onClick={() => updateStatus(req.id, "Assigned")} className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs">Accept</button>}
                                            {req.status === "Assigned" && <button onClick={() => updateStatus(req.id, "In Progress")} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs">Start</button>}
                                            {req.status === "In Progress" && <button onClick={() => updateStatus(req.id, "Completed")} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Done</button>}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <RequestDetailModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />
        </div>
    );
}
