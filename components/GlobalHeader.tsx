"use client";

import React, { useState, useEffect } from "react";
import { Utensils, ShoppingBag, User, Bell, Droplets, ArrowLeft, Menu, Sparkles, X, ChevronRight, MapPin } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, useCart } from "@/utils/store";
import { useTheme } from "@/utils/themes";
import { useGuestRoom } from "../app/[hotel_slug]/guest/GuestAuthWrapper";

export function GlobalHeader() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { roomNumber, orderMode, switchToDineIn, switchToTakeaway } = useGuestRoom();
    const { cartCount } = useCart(branding?.id);
    const theme = useTheme(branding);
    
    const [scrolled, setScrolled] = useState(false);
    const [showUtility, setShowUtility] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // const isDashboard = pathname?.endsWith("/dashboard");
    // if (isDashboard) return null;

    const openQuickActions = (actionId: "water" | "waiter") => {
        setShowUtility(false);
        window.dispatchEvent(new CustomEvent("guest_open_quick_actions", { detail: { actionId } }));
    };

    return (
        <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 py-3 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200 shadow-sm' : 'bg-transparent'}`}
        >
            <div className="flex flex-col gap-4">
                {/* Row 1: Menu (Left), Branding (Center), Cart (Right) */}
                <div className="px-5 flex items-center justify-between">
                    {/* Left: Menu */}
                    <div className="w-12">
                        <button 
                            onClick={() => setShowUtility(!showUtility)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 border ${scrolled ? 'border-slate-200 bg-white shadow-sm' : 'border-white/40 bg-black/20 shadow-sm'}`}
                            style={{ 
                                backgroundColor: showUtility ? theme.primary : (scrolled ? "white" : "rgba(0,0,0,0.2)"),
                                color: scrolled ? "#0F3D2E" : "white"
                            }}
                        >
                            {showUtility ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        <AnimatePresence>
                            {showUtility && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-12 left-0 w-52 bg-white rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden py-2 z-[110]"
                                >
                                    <div className="px-5 py-3 border-b border-black/5 mb-1.5">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">Guest Selection</p>
                                    </div>
                                    <button 
                                        onClick={() => openQuickActions("waiter")}
                                        className="w-full px-5 py-3 flex items-center justify-between hover:bg-black/5 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Bell className="w-4 h-4" style={{ color: theme.primary }} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Call Host</span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 opacity-20" />
                                    </button>
                                    <button 
                                        onClick={() => openQuickActions("water")}
                                        className="w-full px-5 py-3 flex items-center justify-between hover:bg-black/5 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <Droplets className="w-4 h-4" style={{ color: theme.primary }} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Hydration</span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 opacity-20" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Center: Hotel Name */}
                    <div className="flex-1 text-center truncate px-2">
                        <h1 className={`text-base font-black italic tracking-tighter truncate transition-colors duration-500 ${scrolled ? 'text-[#0F3D2E]' : 'text-white shadow-sm'}`}>
                            {branding?.name}
                        </h1>
                    </div>

                    {/* Right: Cart */}
                    <div className="w-12 flex justify-end">
                        <button 
                            id="header-cart-button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open_cart'))}
                            className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all border ${scrolled ? 'bg-[#0F3D2E] text-white border-[#0F3D2E]/10' : 'bg-white/20 text-white border-white/40'}`}
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#C8A96A] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Row 2: Universal Mode Toggle */}
                <div className="flex justify-center pb-1">
                    <div className={`flex p-1 rounded-full border transition-all duration-500 shadow-sm relative ${scrolled ? 'bg-slate-100 border-slate-200' : 'bg-black/20 border-white/20'}`}>
                        {/* Sliding Highlight */}
                        <motion.div 
                            layoutId="modeHighlight"
                            animate={{ x: orderMode === "dine-in" ? 0 : "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-[#C8A96A] rounded-full shadow-md"
                        />
                        
                        <button 
                            onClick={switchToDineIn}
                            className={`relative z-10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-300 flex items-center gap-2 ${
                                orderMode === "dine-in" ? 'text-white' : (scrolled ? 'text-[#0F3D2E]/40' : 'text-white/60')
                            }`}
                        >
                            <MapPin className="w-3 h-3" />
                            Dine-In
                        </button>
                        <button 
                            onClick={switchToTakeaway}
                            className={`relative z-10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors duration-300 flex items-center gap-2 ${
                                orderMode === "takeaway" ? 'text-white' : (scrolled ? 'text-[#0F3D2E]/40' : 'text-white/60')
                            }`}
                        >
                            <ShoppingBag className="w-3 h-3" />
                            Takeaway
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
