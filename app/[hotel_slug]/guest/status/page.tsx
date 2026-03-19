"use client";

import React, { useEffect, useRef } from "react";
import { ArrowLeft, Clock, CheckCircle2, Loader2, Sparkles, RefreshCcw } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { StatusBadge, RequestStatus } from "@/components/StatusBadge";
import { useSupabaseRequests, useHotelBranding } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { playGuestNotification, playSuccessNotification, initAudioContext } from "@/utils/audio";
import { motion, AnimatePresence } from "framer-motion";

import { useTheme } from "@/utils/themes";

export default function StatusPage() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { roomNumber, checkedInAt } = useGuestRoom();
    const { branding } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id, roomNumber, checkedInAt);
    const theme = useTheme(branding);
    const prevRequestsRef = useRef(requests);

    useEffect(() => {
        if (!prevRequestsRef.current || prevRequestsRef.current.length === 0) {
            prevRequestsRef.current = requests;
            return;
        }

        const prev = prevRequestsRef.current;
        let shouldPlayRoutine = false;
        let shouldPlaySuccess = false;

        requests.forEach(currentReq => {
            const prevReq = prev.find(r => r.id === currentReq.id);
            if (prevReq && prevReq.status !== currentReq.status) {
                console.log(`Status change detected for ${currentReq.id}: ${prevReq.status} -> ${currentReq.status}`);
                if (currentReq.status === "Completed") {
                    shouldPlaySuccess = true;
                } else {
                    shouldPlayRoutine = true;
                }
            }
        });

        if (shouldPlaySuccess) {
            console.log("Triggering success notification sound");
            playSuccessNotification();
        } else if (shouldPlayRoutine) {
            console.log("Triggering routine notification sound");
            playGuestNotification();
        }

        prevRequestsRef.current = requests;
    }, [requests]);

    const getRequestTheme = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes("water")) return {
            bg: "bg-blue-50/80",
            border: "border-blue-100",
            text: "text-blue-900",
            accent: "bg-blue-500",
            light: "bg-blue-500/10",
            muted: "text-blue-400"
        };
        if (t.includes("dining") || t.includes("food") || t.includes("order")) return {
            bg: "bg-red-50/80",
            border: "border-red-100",
            text: "text-red-900",
            accent: "bg-[#E31837]",
            light: "bg-red-500/10",
            muted: "text-red-400"
        };
        if (t.includes("laundry") || t.includes("valet")) return {
            bg: "bg-indigo-50/80",
            border: "border-indigo-100",
            text: "text-indigo-900",
            accent: "bg-indigo-600",
            light: "bg-indigo-500/10",
            muted: "text-indigo-400"
        };
        if (t.includes("cleaning") || t.includes("housekeeping") || t.includes("towel")) return {
            bg: "bg-emerald-50/80",
            border: "border-emerald-100",
            text: "text-emerald-900",
            accent: "bg-emerald-600",
            light: "bg-emerald-500/10",
            muted: "text-emerald-400"
        };
        if (t.includes("tea") || t.includes("coffee") || t.includes("beverage")) return {
            bg: "bg-amber-50/80",
            border: "border-amber-100",
            text: "text-amber-900",
            accent: "bg-amber-600",
            light: "bg-amber-500/10",
            muted: "text-amber-400"
        };
        // Default theme
        return {
            bg: "bg-slate-50/80",
            border: "border-slate-100",
            text: "text-slate-900",
            accent: theme.primary,
            light: `${theme.primary}1a`,
            muted: "text-slate-400"
        };
    };

    const activeRequests = requests.filter((r) => r.status !== "Completed");
    const pastRequests = requests.filter((r) => r.status === "Completed");

    return (
        <div 
            className="pb-40 px-5 pt-safe min-h-screen overflow-x-hidden transition-colors duration-500"
            style={{ 
                backgroundColor: theme.background,
                fontFamily: theme.fontSans,
                color: theme.text
            }}
        >
            <div className="flex items-center justify-between mb-10 pt-10">
                <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => router.back()} 
                    className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-100 active:scale-90 transition-transform"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-900" />
                </motion.button>
                <h1 className="text-3xl font-serif italic text-slate-900 tracking-tighter">Selection Status</h1>
                <div className="w-12"></div>
            </div>

            <div className="mb-14">
                <div className="flex items-center justify-between mb-8 px-1">
                    <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Journey Pulse</h2>
                    {activeRequests.length > 0 && (
                        <span className="flex items-center text-[9px] font-black text-[#722F37] bg-red-50 px-3 py-1.5 rounded-xl uppercase tracking-wider border border-red-100 shadow-sm animate-pulse">
                            <RefreshCcw className="w-3 h-3 mr-1.5 animate-spin-slow" /> Tracking Live
                        </span>
                    )}
                </div>

                {activeRequests.length > 0 ? (
                    <div className="space-y-6">
                        {activeRequests.map((req) => {
                            const themeWrapper = getRequestTheme(req.type);
                            const isDining = req.type.toLowerCase().includes("dining") || req.type.toLowerCase().includes("food") || req.type.toLowerCase().includes("order");
                            const isPreparing = req.status === "In Progress" || req.status === "Assigned";
                            
                            // Calculate step index
                            let stepIndex = 0;
                            if (req.status === "Pending") stepIndex = 1;
                            else if (req.status === "Assigned") stepIndex = 2;
                            else if (req.status === "In Progress") stepIndex = 3;
                            else if (req.status === "Completed") stepIndex = 4;

                            return (
                                <motion.div
                                    key={req.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="bg-white/80 backdrop-blur-xl border border-slate-100/50 p-6 rounded-[2rem] shadow-[0_24px_50px_-12px_rgba(0,0,0,0.06)] relative overflow-hidden group"
                                >
                                    <div className="flex items-start justify-between mb-5 relative z-10">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className={`w-8 h-8 rounded-full ${themeWrapper.light} flex items-center justify-center`}>
                                                    <div className={`w-2.5 h-2.5 rounded-full ${themeWrapper.accent}`} />
                                                </div>
                                                <h3 className="font-serif italic text-2xl text-slate-900 tracking-tight">{req.type}</h3>
                                            </div>
                                            <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pl-10">
                                                <Clock className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                                                {req.time} <span className="mx-2 opacity-30">•</span> Room {req.room}
                                            </div>
                                        </div>
                                        <StatusBadge status={req.status as any} />
                                    </div>

                                    {/* Stepped Progress Bar */}
                                    <div className="relative z-10 grid grid-cols-3 gap-2 mt-6 mb-6">
                                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden relative">
                                            <motion.div className={`absolute top-0 left-0 h-full ${themeWrapper.accent}`} initial={{ width: 0 }} animate={{ width: stepIndex >= 1 ? "100%" : "0%" }} transition={{ duration: 0.5 }} />
                                        </div>
                                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden relative">
                                            <motion.div className={`absolute top-0 left-0 h-full ${themeWrapper.accent}`} initial={{ width: 0 }} animate={{ width: stepIndex >= 2 ? (stepIndex === 2 ? "50%" : "100%") : "0%" }} transition={{ duration: 1, repeat: stepIndex === 2 ? Infinity : 0 }} />
                                        </div>
                                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden relative">
                                            <motion.div className={`absolute top-0 left-0 h-full ${themeWrapper.accent}`} initial={{ width: 0 }} animate={{ width: stepIndex >= 3 ? (stepIndex === 3 ? "50%" : "100%") : "0%" }} transition={{ duration: 1, repeat: stepIndex === 3 ? Infinity : 0 }} />
                                        </div>
                                    </div>

                                    {/* Content & Animation Area */}
                                    <div className="relative z-10 flex items-center justify-between mt-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/60">
                                        <div className="flex-1 pr-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">
                                                {stepIndex === 1 ? "Order Received" : stepIndex === 2 ? "Order Accepted" : stepIndex === 3 ? "Preparing Order" : "Completed"}
                                            </p>
                                            <p className="text-sm font-medium text-slate-700 leading-snug line-clamp-2">
                                                {req.notes ? `"${req.notes}"` : (isDining && isPreparing ? "Our culinary team is crafting your meal perfectly." : "We are actively taking care of your request.")}
                                            </p>
                                        </div>

                                        {/* Functional Animation */}
                                        {isDining && isPreparing && (
                                            <div className="shrink-0 flex items-center justify-center relative w-16 h-16 bg-white rounded-[1.2rem] shadow-sm border border-slate-100">
                                                <motion.div
                                                    animate={{ rotate: [-6, 6, -6], y: [0, -3, 0] }}
                                                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                                                    className="relative z-10 text-rose-500"
                                                >
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6h.2A6.13 6.13 0 0 1 12 4a6.13 6.13 0 0 1 4.39 2h.2A4 4 0 0 1 18 13.87"/><path d="M6 12a4 4 0 0 1-1.3-7.8"/><path d="M18 12a4 4 0 0 0 1.3-7.8"/><path d="M3 20h18"/><path d="M7 20v-6"/><path d="M17 20v-6"/><path d="M12 20v-8"/></svg>
                                                </motion.div>
                                                <motion.div className="absolute top-2 left-3 w-1.5 h-1.5 bg-rose-300 rounded-full blur-[1px]" animate={{ y: [0, -12], opacity: [0, 0.7, 0], scale: [1, 1.3] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0 }} />
                                                <motion.div className="absolute top-3 right-3 w-1.5 h-1.5 bg-rose-300 rounded-full blur-[1px]" animate={{ y: [0, -14], opacity: [0, 0.7, 0], scale: [1, 1.4] }} transition={{ repeat: Infinity, duration: 1.6, delay: 0.5 }} />
                                            </div>
                                        )}
                                        {(!isDining || !isPreparing) && (
                                            <div className="shrink-0 flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100">
                                                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Decorative Blob */}
                                    <div className={`absolute -right-10 -bottom-10 w-40 h-40 ${themeWrapper.accent} opacity-[0.03] blur-3xl rounded-full pointer-events-none`} />
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/40 backdrop-blur-sm border-2 border-dashed border-slate-100 rounded-[3.5rem] py-32 text-center shadow-inner"
                    >
                        <Sparkles className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <p className="text-slate-900 font-serif italic text-2xl">Everything Is Perfect</p>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mt-2">No active selection found</p>
                    </motion.div>
                )}
            </div>

            <div className="pb-safe">
                <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8 px-1">Completed Journeys</h2>
                <div className="space-y-4">
                    {pastRequests.map((req) => {
                        const theme = getRequestTheme(req.type);
                        return (
                            <div key={req.id} className="bg-white/60 backdrop-blur-sm p-6 rounded-[2.5rem] border border-slate-100 flex items-center justify-between opacity-70 hover:opacity-100 transition-all duration-500 shadow-sm group">
                                <div className="flex items-center">
                                    <div className={`w-14 h-14 rounded-2xl ${theme.light} ${theme.text} flex items-center justify-center mr-5 shadow-sm border ${theme.border} transition-transform group-hover:scale-110`}>
                                        <CheckCircle2 className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif italic text-lg text-slate-900">{req.type}</h3>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{req.time}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`text-[9px] font-bold ${theme.text} ${theme.light} px-3 py-1.5 rounded-full uppercase tracking-tighter italic border ${theme.border}`}>Delivered</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
