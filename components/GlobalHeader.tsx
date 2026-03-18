"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Bell, Droplets, Menu, Sparkles, X, ChevronRight } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, useCart } from "@/utils/store";
import { useTheme } from "@/utils/themes";
import { useGuestRoom } from "../app/[hotel_slug]/guest/GuestAuthWrapper";

export function GlobalHeader() {
    const params = useParams();
    const pathname = usePathname();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { roomNumber } = useGuestRoom();
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
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 py-3 ${scrolled ? 'bg-[#0F3D2E]/95 backdrop-blur-xl border-b border-white/5 shadow-md' : 'bg-gradient-to-b from-[#0F3D2E]/80 to-transparent'}`}
        >
            <div className="flex flex-col gap-4">
                {/* Row 1: Menu (Left), Branding (Center), Cart (Right) */}
                <div className="px-5 flex items-center justify-between">
                    {/* Left: Menu */}
                    <div className="w-12">
                        <button 
                            onClick={() => setShowUtility(!showUtility)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 border border-white/20 bg-black/20 shadow-sm text-white`}
                            style={{ 
                                backgroundColor: showUtility ? theme.primary : "rgba(0,0,0,0.2)"
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
                                    className="absolute top-12 left-0 w-52 bg-[#0F3D2E] rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden py-2 z-[110]"
                                >
                                    <div className="px-5 py-3 border-b border-white/10 mb-1.5">
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Guest Selection</p>
                                    </div>
                                    <button 
                                        onClick={() => openQuickActions("waiter")}
                                        className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-3 text-white">
                                            <Bell className="w-4 h-4 text-[#C8A96A]" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Call Host</span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-white/20" />
                                    </button>
                                    <button 
                                        onClick={() => openQuickActions("water")}
                                        className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-3 text-white">
                                            <Droplets className="w-4 h-4 text-[#C8A96A]" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">Hydration</span>
                                        </div>
                                        <ChevronRight className="w-3 h-3 text-white/20" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Center: Hotel Name */}
                    <div className="flex-1 text-center truncate px-2">
                        <h1 className="text-base font-black italic tracking-tighter truncate text-white drop-shadow-md">
                            {branding?.name}
                        </h1>
                    </div>

                    {/* Right: Cart */}
                    <div className="w-12 flex justify-end">
                        <button 
                            id="header-cart-button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open_cart'))}
                            className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-all border bg-white/10 text-white border-white/20 backdrop-blur-md"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#C8A96A] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-[#0F3D2E]"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
}
