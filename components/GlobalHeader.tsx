"use client";

import React, { useState, useEffect } from "react";
import { Utensils, ShoppingBag, User, Bell, Droplets, ArrowLeft, Menu, Sparkles, X, ChevronRight } from "lucide-react";
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

    const isDashboard = pathname?.endsWith("/dashboard");

    const openQuickActions = (actionId: "water" | "waiter") => {
        setShowUtility(false);
        window.dispatchEvent(new CustomEvent("guest_open_quick_actions", { detail: { actionId } }));
    };

    return (
        <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[540px] z-[100] transition-all duration-500 py-6`}
            style={{ 
                backgroundColor: scrolled ? `${theme.surface}f2` : "transparent", // f2 is ~95% opacity
                backdropFilter: scrolled ? "blur(20px)" : "none",
                boxShadow: scrolled ? "0 8px 30px rgba(0,0,0,0.04)" : "none",
                borderBottom: scrolled ? `1px solid ${theme.primary}10` : "none"
            }}
        >
            <div className="flex flex-col gap-6">
                {/* Row 1: Menu (Left), Branding (Center), Cart (Right) */}
                <div className="px-4 flex items-center justify-between gap-4">
                    {/* Left: Menu & Utility Dropdown */}
                    <div className="flex-shrink-0 relative">
                        <button 
                            onClick={() => setShowUtility(!showUtility)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 border border-slate-100 shadow-sm`}
                            style={{ 
                                backgroundColor: showUtility ? theme.primary : "white",
                                color: showUtility ? "white" : theme.primary
                            }}
                        >
                            {showUtility ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>

                        <AnimatePresence>
                            {showUtility && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95, x: 0 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95, x: 0 }}
                                    className="absolute top-14 left-0 w-56 bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,33,30,0.15)] border border-[#00704A]/5 overflow-hidden py-3 z-[110]"
                                >
                                    <div className="px-6 py-3 border-b border-slate-50 mb-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: theme.primary }}>Guest Selection</p>
                                    </div>
                                    <button 
                                        onClick={() => openQuickActions("waiter")}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Bell className="w-5 h-5" style={{ color: theme.primary }} />
                                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.text }}>Call Host</span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 opacity-30" style={{ color: theme.primary }} />
                                    </button>
                                    <button 
                                        onClick={() => openQuickActions("water")}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Droplets className="w-5 h-5" style={{ color: theme.primary }} />
                                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.text }}>Hydration</span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 opacity-30" style={{ color: theme.primary }} />
                                    </button>
                                    <div className="h-px bg-slate-50 my-2" />
                                    <button 
                                        onClick={() => { router.push(`/${hotelSlug}/guest/profile`); setShowUtility(false); }}
                                        className="w-full px-6 py-4 flex items-center space-x-4 hover:bg-black/5 transition-colors"
                                    >
                                        <User className="w-5 h-5" style={{ color: `${theme.text}66` }} />
                                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.text }}>My Identity</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Center: Compact Mode Toggle */}
                    <div className="flex-1 flex justify-center">
                        <div className="flex bg-slate-100/50 p-1 rounded-full border border-slate-100 backdrop-blur-md">
                            <button 
                                onClick={switchToDineIn}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                                    orderMode === "dine-in"
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                Dine-In
                            </button>
                            <button 
                                onClick={switchToTakeaway}
                                className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                                    orderMode === "takeaway"
                                    ? 'bg-white text-slate-900 shadow-sm' 
                                    : 'text-slate-400 hover:text-slate-600'
                                }`}
                            >
                                Takeaway
                            </button>
                        </div>
                    </div>

                    {/* Right: Shopping Bag / Cart */}
                    <div className="flex-shrink-0">
                        <button 
                            id="header-cart-button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open_cart'))}
                            className={`relative overflow-hidden flex items-center justify-center shadow-[0_18px_40px_-18px_rgba(0,0,0,0.28)] border border-white/80 active:scale-95 transition-all backdrop-blur-xl ${
                                cartCount > 0 ? "h-12 min-w-[72px] px-3 rounded-[1.45rem] gap-2" : "w-12 h-12 rounded-full"
                            }`}
                            style={{
                                color: theme.primary,
                                background: cartCount > 0
                                    ? `linear-gradient(135deg, ${theme.surface} 0%, ${theme.secondary} 100%)`
                                    : "white"
                            }}
                        >
                            {cartCount > 0 && (
                                <div
                                    className="absolute inset-0 opacity-60"
                                    style={{ background: `radial-gradient(circle at top right, ${theme.accent}22, transparent 55%)` }}
                                />
                            )}
                            <ShoppingBag className="w-6 h-6" />
                            {cartCount > 0 && (
                                <>
                                    <div className="w-px h-5 bg-black/10" />
                                    <AnimatePresence>
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                            className="relative z-10 min-w-7 h-7 px-2 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-lg border border-white/50"
                                            style={{ backgroundColor: theme.accent }}
                                        >
                                            {cartCount}
                                        </motion.div>
                                    </AnimatePresence>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
