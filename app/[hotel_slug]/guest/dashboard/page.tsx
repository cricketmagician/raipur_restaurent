"use client";

import React, { useState } from "react";
import { ServiceCard } from "@/components/ServiceCard";
import {
    Utensils,
    Bell,
    Droplets,
    Zap,
    Clock,
    ChevronRight,
    ArrowUpRight,
    Search,
    User,
    Wifi,
    Phone,
    Wrench,
    Shirt,
    Wind,
    Sparkles,
    Coffee,
    AlertCircle,
    ChevronLeft,
    Music,
    MapPin
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, useSupabaseRequests, addSupabaseRequest, useSpecialOffers } from "@/utils/store";
import { useGuestRoom } from "../GuestAuthWrapper";
import { Toast } from "@/components/Toast";

// Helper to safely render icons with className
const renderIcon = (icon: React.ReactNode, className: string) => {
    return React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<any>, { className })
        : icon;
};

export default function GuestDashboard() {
    const router = useRouter();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;

    const { roomNumber: tableNumber, checkedInAt } = useGuestRoom();
    const { branding, loading } = useHotelBranding(hotelSlug);
    const requests = useSupabaseRequests(branding?.id, tableNumber, checkedInAt);

    const [scrolled, setScrolled] = useState(false);
    const [submittingType, setSubmittingType] = React.useState<string | null>(null);
    const [toast, setToast] = React.useState<{ message: string; type: "success" | "error"; isVisible: boolean }>({
        message: "",
        type: "success",
        isVisible: false
    });

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const activeRequests = requests.filter(r => r.status === "Pending" || r.status === "In Progress");

    const handleQuickRequest = async (type: string, notes: string) => {
        if (!branding?.id || submittingType) return;

        setSubmittingType(type);
        const { error } = await addSupabaseRequest(branding.id, {
            room: tableNumber,
            type: type,
            notes: notes,
            status: "Pending",
            price: 0,
            total: 0
        });

        setSubmittingType(null);

        if (error) {
            setToast({ message: `Error: ${error.message}`, type: "error", isVisible: true });
        } else {
            setToast({ message: `${type} Request Placed Successfully`, type: "success", isVisible: true });
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="pb-40 px-5 pt-6 min-h-screen bg-background max-w-[520px] mx-auto overflow-x-hidden">
            {/* 1. Header Section */}
            <motion.header
                animate={{
                    width: scrolled ? "calc(100% - 40px)" : "calc(100% - 32px)",
                    top: scrolled ? 12 : 20,
                    padding: scrolled ? "12px 24px" : "16px 20px"
                }}
                className="fixed left-1/2 -translate-x-1/2 max-w-[480px] z-50 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center justify-between transition-all duration-300"
            >
                <div className="flex items-center overflow-hidden">
                    <motion.div
                        animate={{ scale: scrolled ? 0.8 : 1 }}
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mr-3 border border-slate-100 shrink-0 overflow-hidden"
                    >
                        {branding?.logoImage ? (
                            <img src={branding.logoImage} alt={branding.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-black text-slate-900">{branding?.name?.charAt(0)}</span>
                        )}
                    </motion.div>
                    <div className="flex flex-col">
                        <motion.h1
                            animate={{ fontSize: scrolled ? "16px" : "22px" }}
                            className="font-serif font-black text-slate-900 leading-none tracking-tight whitespace-nowrap"
                        >
                            {branding?.name || "Restaurant"}
                            {scrolled && <span className="text-slate-300 mx-2 font-normal">•</span>}
                            {scrolled && <span className="text-amber-600">Table {tableNumber || "---"}</span>}
                        </motion.h1>
                    </div>
                </div>

                <motion.div
                    animate={{ scale: scrolled ? 0.9 : 1 }}
                    className="px-2 py-1 bg-emerald-50 border border-emerald-100 rounded-full flex items-center shadow-sm"
                >
                    <div className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div>
                    <span className="text-[7px] font-black uppercase tracking-widest text-emerald-600">Live</span>
                </motion.div>
            </motion.header>

            <div className="h-[90px]"></div>

            {/* 2. Table Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10"
            >
                <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100 flex flex-col overflow-hidden">
                    <p className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Current Location</p>
                    <h2 className="text-[48px] font-serif text-slate-900 tracking-tighter leading-none mb-2">
                        Table <span className="text-amber-600 font-bold">{tableNumber || "---"}</span>
                    </h2>
                    <p className="text-sm font-bold text-slate-400">Scan QR to order or call for assistance</p>
                </div>
            </motion.div>

            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-6 mt-10"
            >
                {/* 3. Restaurant Experience Cards */}
                <motion.section variants={item} className="grid grid-cols-1 gap-6">
                    <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                         
                         <div className="relative z-10 flex flex-col h-full justify-between">
                            <div className="flex justify-between items-start mb-12">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Utensils className="w-8 h-8 text-amber-500" />
                                </div>
                                <ArrowUpRight className="w-6 h-6 text-white/20 group-hover:text-amber-500 transition-colors" />
                            </div>
                            
                            <div>
                                <h3 className="text-3xl font-serif text-white mb-2">Menu & Order</h3>
                                <p className="text-slate-400 text-sm font-medium">Browse our full menu and place your order directly.</p>
                            </div>
                         </div>
                         
                         <button 
                            onClick={() => router.push(`/${hotelSlug}/guest/restaurant`)}
                            className="absolute inset-0 z-20"
                         />
                    </div>
                </motion.section>

                {/* 4. Quick Assistance Grid */}
                <motion.section variants={item}>
                    <div className="flex items-center justify-between mb-6 pl-2">
                        <div className="flex items-center">
                            <Zap className="w-4 h-4 text-amber-500 mr-2" />
                            <h2 className="text-xl font-serif text-slate-900">Quick Assistance</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Call Waiter", icon: <Bell />, type: "Waiter Call", notes: "Table Assistance", color: "from-amber-500/10" },
                            { label: "Mineral Water", icon: <Droplets />, type: "Mineral Water", notes: "1L Bottle", color: "from-blue-500/10" },
                        ].map((req, i) => (
                            <motion.button
                                key={i}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuickRequest(req.type, req.notes)}
                                className="bg-white p-6 rounded-[2.5rem] flex flex-col justify-end min-h-[160px] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-amber-500/20 transition-all duration-500 text-left relative overflow-hidden group"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${req.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                
                                <div className="absolute top-6 right-6 p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50 transition-all">
                                    {renderIcon(req.icon, "w-6 h-6")}
                                </div>

                                <div className="relative z-10">
                                    <p className="text-lg font-serif text-slate-900 leading-tight mb-1">{req.label}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{req.notes}</p>
                                </div>
                                
                                {submittingType === req.type && (
                                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30">
                                        <div className="w-6 h-6 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.section>

                {/* 5. Active Requests */}
                <AnimatePresence>
                    {activeRequests.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            variants={item}
                        >
                            <div className="flex items-center justify-between mb-6 pl-2">
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                                    <h2 className="text-xl font-serif text-foreground">Pending Signals</h2>
                                </div>
                                <button onClick={() => router.push(`/${hotelSlug}/guest/status`)} className="text-[10px] font-black text-blue-500 uppercase tracking-widest">View All</button>
                            </div>

                            <div className="space-y-4">
                                {activeRequests.map((req) => (
                                    <div key={req.id} className="bg-white p-5 rounded-[2rem] flex items-center justify-between border border-slate-100 shadow-sm">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-4">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{req.type}</p>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Status: <span className="text-blue-500">{req.status}</span></p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                    </div>
                                ))}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>
            </motion.div>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}
