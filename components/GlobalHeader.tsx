"use client";

import React, { useState, useEffect } from "react";
import { Utensils, ShoppingBag, User, Bell, Droplets, ArrowLeft } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, addSupabaseRequest } from "@/utils/store";
import { useGuestRoom } from "../app/[hotel_slug]/guest/GuestAuthWrapper";

export function GlobalHeader() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { roomNumber } = useGuestRoom();
    
    const [scrolled, setScrolled] = useState(false);
    const [requestLoading, setRequestLoading] = useState<string | null>(null);
    const [showUtility, setShowUtility] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const tableNumber = roomNumber;
    const isDashboard = pathname?.endsWith("/dashboard");

    const handleQuickRequest = async (type: string, notes: string) => {
        if (!branding?.id || !roomNumber) return;
        setRequestLoading(type);
        setShowUtility(false); // Close dropdown on action
        
        const { error } = await addSupabaseRequest(branding.id, {
            room: roomNumber,
            type: type,
            notes: notes,
            status: "Pending"
        });

        setRequestLoading(null);
        if (error) {
            alert(`Request failed: ${error.message}`);
        } else {
            alert(`${type} request sent!`);
        }
    };

    return (
        <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[520px] z-[100] transition-all duration-300 ${
                scrolled ? "bg-white/80 backdrop-blur-xl shadow-[0_4px_12px_rgba(0,0,0,0.06)] py-3" : "bg-white/40 backdrop-blur-md py-4"
            } border-b border-white/20`}
        >
            <div className="flex flex-col gap-4">
                {/* Row 1: Logo, Name/Address, Profile */}
                <div className="px-5 flex items-center justify-between gap-4">
                    {/* Left: Logo/Back */}
                    <div className="flex-shrink-0 w-10">
                        {!isDashboard ? (
                            <button 
                                onClick={() => router.back()}
                                className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 active:scale-95 transition-all text-slate-900"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        ) : branding?.logo || branding?.logoImage ? (
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/50">
                                <img src={branding.logoImage || branding.logo} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-10 h-10 bg-[#1F2937] rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                                <Utensils className="text-white w-5 h-5" />
                            </div>
                        )}
                    </div>

                    {/* Center: Branding Info */}
                    <div className="flex-1 text-center min-w-0">
                        <h1 className="text-base font-black text-slate-900 leading-tight truncate">
                            {branding?.name || "Restaurant"}
                        </h1>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">
                            {branding?.address || "Premium Dining Experience"}
                        </p>
                    </div>

                    {/* Right: Profile & Utility Dropdown */}
                    <div className="flex-shrink-0 w-10 relative">
                        <button 
                            onClick={() => setShowUtility(!showUtility)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                showUtility ? "bg-[#1F2937] text-white" : "bg-white border border-slate-100 text-slate-400 shadow-sm"
                            } active:scale-95`}
                        >
                            <User className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {showUtility && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-12 right-0 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden py-2"
                                >
                                    <button 
                                        onClick={() => { router.push(`/${hotelSlug}/guest/profile`); setShowUtility(false); }}
                                        className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-slate-50 transition-colors"
                                    >
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">My Profile</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Row 2: Segmented Toggle */}
                <div className="px-5">
                    <div className="max-w-[180px] mx-auto bg-slate-100/50 p-1 rounded-[18px] flex text-[9px] font-black uppercase tracking-widest relative overflow-hidden border border-slate-200/30">
                        <motion.div 
                            initial={false}
                            animate={{ 
                                x: tableNumber?.toLowerCase() === 'takeaway' ? '100%' : '0%',
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-y-1 left-1 w-[calc(50%-2px)] bg-[#1F2937] rounded-[14px] shadow-sm"
                        />
                        
                        <button 
                            onClick={() => {
                                if (tableNumber?.toLowerCase() === 'takeaway') {
                                    localStorage.removeItem(`hotel_room_${hotelSlug}`);
                                    router.push(`/${hotelSlug}/guest/dashboard`);
                                    setTimeout(() => window.location.reload(), 100);
                                }
                            }}
                            className={`relative z-10 flex-1 py-1 flex items-center justify-center transition-colors duration-300 ${
                                tableNumber?.toLowerCase() !== "takeaway" ? "text-white" : "text-slate-400"
                            }`}
                        >
                            Dine-In
                        </button>
                        <button 
                            onClick={() => {
                                if (tableNumber?.toLowerCase() !== 'takeaway') {
                                    localStorage.setItem(`hotel_room_${hotelSlug}`, 'Takeaway');
                                    localStorage.removeItem(`hotel_pin_${hotelSlug}`);
                                    router.push(`/${hotelSlug}/guest/dashboard?room=Takeaway`);
                                    setTimeout(() => window.location.reload(), 100);
                                }
                            }}
                            className={`relative z-10 flex-1 py-1 flex items-center justify-center transition-colors duration-300 ${
                                tableNumber?.toLowerCase() === "takeaway" ? "text-white" : "text-slate-400"
                            }`}
                        >
                            Takeaway
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
