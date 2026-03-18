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

    const isDashboard = pathname?.endsWith("/dashboard");

    if (isDashboard) return null;

    const openQuickActions = (actionId: "water" | "waiter") => {
        setShowUtility(false);
        window.dispatchEvent(new CustomEvent("guest_open_quick_actions", { detail: { actionId } }));
    };

    return (
        <motion.header 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 py-3`}
            style={{ 
                backgroundColor: scrolled ? theme.primary : "transparent",
                backdropFilter: scrolled ? "blur(30px) saturate(180%)" : "none",
                boxShadow: scrolled ? "0 10px 40px rgba(0,0,0,0.15)" : "none",
                borderBottom: scrolled ? "1px solid rgba(255,255,255,0.1)" : "none"
            }}
        >
            <div className="flex flex-col gap-4">
                {/* Row 1: Menu (Left), Branding (Center), Cart (Right) */}
                <div className="px-4 flex items-center justify-between gap-3">
                    {/* Left: Menu & Utility Dropdown */}
                    <div className="flex-shrink-0 relative">
                        <button 
                            onClick={() => setShowUtility(!showUtility)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 border border-white/40 shadow-sm bg-black/20`}
                            style={{ 
                                backgroundColor: showUtility ? theme.primary : (scrolled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)"),
                                color: "white"
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

                    {/* Center: Compact Mode Toggle (Fix #8) */}
                    <div className="flex-1 flex justify-center">
                        <div className="flex bg-black/10 p-1 rounded-full border border-white/40 shadow-inner relative">
                            {/* Sliding Highlight */}
                            <motion.div 
                                animate={{ x: orderMode === "dine-in" ? 0 : "100%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-full shadow-lg"
                            />
                            
                            <button 
                                onClick={switchToDineIn}
                                className={`relative z-10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors duration-300 flex items-center gap-2 ${
                                    orderMode === "dine-in" ? 'text-black' : 'text-white/60'
                                }`}
                            >
                                <MapPin className="w-3 h-3" />
                                Dine-In
                            </button>
                            <button 
                                onClick={switchToTakeaway}
                                className={`relative z-10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors duration-300 flex items-center gap-2 ${
                                    orderMode === "takeaway" ? 'text-black' : 'text-white/60'
                                }`}
                            >
                                <ShoppingBag className="w-3 h-3" />
                                Takeaway
                            </button>
                        </div>
                    </div>

                    {/* Right: Shopping Bag / Cart */}
                    <div className="flex-shrink-0">
                        <button 
                            id="header-cart-button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open_cart'))}
                            className={`relative overflow-hidden flex items-center justify-center shadow-[0_18px_40px_-18px_rgba(0,0,0,0.28)] border border-white/80 active:scale-95 transition-all bg-white/20 ${
                                cartCount > 0 ? "h-11 min-w-[68px] px-2.5 rounded-[1.3rem] gap-2" : "w-11 h-11 rounded-full"
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
                            <ShoppingBag className="w-5 h-5" />
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
