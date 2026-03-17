"use client";

import React, { useState, useEffect } from "react";
import { Utensils, ShoppingBag, User, Bell, Droplets, ArrowLeft, Menu, Sparkles, RefreshCw } from "lucide-react";
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
            className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[520px] z-[100] transition-all duration-500 ${
                scrolled ? "bg-white/95 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,33,30,0.08)] py-4" : "bg-[#F2F0EB] py-6"
            } border-b border-[#00704A]/5`}
        >
            <div className="flex flex-col gap-6">
                {/* Row 1: Logo, Name/Address, Profile */}
                <div className="px-6 flex items-center justify-between gap-6">
                    {/* Left: Logo/Back */}
                    <div className="flex-shrink-0">
                        {!isDashboard ? (
                            <button 
                                onClick={() => router.back()}
                                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 active:scale-95 transition-all text-[#00704A]"
                            >
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                        ) : branding?.logo || branding?.logoImage ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden shadow-xl border-4 border-white">
                                <img src={branding.logoImage || branding.logo} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 bg-[#00704A] rounded-full flex items-center justify-center shadow-xl shadow-[#00704A]/10">
                                <div className="text-white font-serif italic text-xl">S</div>
                            </div>
                        )}
                    </div>

                    {/* Center: Branding Info */}
                    <div className="flex-1 text-center min-w-0">
                        <h1 className="text-lg font-black text-[#1E3932] leading-tight truncate tracking-tight">
                            {branding?.name || "Starbucks"}
                        </h1>
                        <p className="text-[10px] font-bold text-[#00704A]/60 uppercase tracking-[0.2em] truncate mt-1">
                            {branding?.address || "Experience the Siren"}
                        </p>
                    </div>

                    {/* Right: Profile & Utility Dropdown */}
                    <div className="flex-shrink-0 relative">
                        <button 
                            onClick={() => setShowUtility(!showUtility)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                showUtility ? "bg-[#1E3932] text-white" : "bg-white border border-slate-100 text-[#00704A] shadow-sm"
                            } active:scale-95`}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <AnimatePresence>
                            {showUtility && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-14 right-0 w-56 bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,33,30,0.15)] border border-[#00704A]/5 overflow-hidden py-3"
                                >
                                    <div className="px-6 py-3 border-b border-slate-50 mb-2">
                                        <p className="text-[9px] font-black text-[#00704A] uppercase tracking-[0.3em]">Boutique Selection</p>
                                    </div>
                                    <button 
                                        onClick={() => handleQuickRequest("Waiter Call", "Host requested from Header")}
                                        disabled={!!requestLoading}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#D4E9E2]/30 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Bell className="w-5 h-5 text-[#00704A]" />
                                            <span className="text-xs font-bold text-[#1E3932] uppercase tracking-widest">Call Host</span>
                                        </div>
                                        {requestLoading === "Waiter Call" && <RefreshCw className="w-3 h-3 animate-spin text-[#00704A]" />}
                                    </button>
                                    <button 
                                        onClick={() => handleQuickRequest("Mineral Water", "Sparkling Water requested")}
                                        disabled={!!requestLoading}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#D4E9E2]/30 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Droplets className="w-5 h-5 text-[#00704A]" />
                                            <span className="text-xs font-bold text-[#1E3932] uppercase tracking-widest">Hydration</span>
                                        </div>
                                        {requestLoading === "Mineral Water" && <RefreshCw className="w-3 h-3 animate-spin text-[#00704A]" />}
                                    </button>
                                    <div className="h-px bg-slate-50 my-2" />
                                    <button 
                                        onClick={() => { router.push(`/${hotelSlug}/guest/profile`); setShowUtility(false); }}
                                        className="w-full px-6 py-4 flex items-center space-x-4 hover:bg-[#D4E9E2]/30 transition-colors"
                                    >
                                        <User className="w-5 h-5 text-[#00704A]/40" />
                                        <span className="text-xs font-bold text-[#1E3932] uppercase tracking-widest">My Identity</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Row 2: Segmented Toggle */}
                <div className="px-6">
                    <div className="max-w-[200px] mx-auto bg-white p-1 rounded-full flex text-[10px] font-black uppercase tracking-widest relative overflow-hidden border border-[#00704A]/10 shadow-sm">
                        <motion.div 
                            initial={false}
                            animate={{ 
                                x: tableNumber?.toLowerCase() === 'takeaway' ? '100.5%' : '0%',
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 40 }}
                            className="absolute inset-y-1 left-1 w-[calc(50%-2px)] bg-[#00704A] rounded-full shadow-lg shadow-[#00704A]/20"
                        />
                        
                        <button 
                            onClick={() => {
                                if (tableNumber?.toLowerCase() === 'takeaway') {
                                    localStorage.removeItem(`hotel_room_${hotelSlug}`);
                                    router.push(`/${hotelSlug}/guest/dashboard`);
                                    setTimeout(() => window.location.reload(), 100);
                                }
                            }}
                            className={`relative z-10 flex-1 py-1.5 flex items-center justify-center transition-all duration-500 ${
                                tableNumber?.toLowerCase() !== "takeaway" ? "text-white" : "text-[#00704A]/40"
                            }`}
                        >
                            In-Store
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
                            className={`relative z-10 flex-1 py-1.5 flex items-center justify-center transition-all duration-500 ${
                                tableNumber?.toLowerCase() === "takeaway" ? "text-white" : "text-[#00704A]/40"
                            }`}
                        >
                            Takeout
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
