"use client";

import React, { useState, useEffect } from "react";
import { Utensils, ShoppingBag, User, Bell, Droplets, ArrowLeft, Menu, Sparkles, RefreshCw, X } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, addSupabaseRequest, useCart } from "@/utils/store";
import { useTheme } from "@/utils/themes";
import { useGuestRoom } from "../app/[hotel_slug]/guest/GuestAuthWrapper";

export function GlobalHeader() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { roomNumber } = useGuestRoom();
    const { cartCount } = useCart(branding?.id);
    const theme = useTheme(branding);
    
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
            className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[520px] z-[100] transition-all duration-500 py-6`}
            style={{ 
                backgroundColor: scrolled ? `${theme.surface}f2` : "transparent", // f2 is ~95% opacity
                backdropFilter: scrolled ? "blur(20px)" : "none",
                boxShadow: scrolled ? "0 8px 30px rgba(0,0,0,0.04)" : "none",
                borderBottom: scrolled ? `1px solid ${theme.primary}10` : "none"
            }}
        >
            <div className="flex flex-col gap-6">
                {/* Row 1: Menu (Left), Branding (Center), Cart (Right) */}
                <div className="px-6 flex items-center justify-between gap-4">
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
                                        onClick={() => handleQuickRequest("Waiter Call", "Host requested from Header")}
                                        disabled={!!requestLoading}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Bell className="w-5 h-5" style={{ color: theme.primary }} />
                                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.text }}>Call Host</span>
                                        </div>
                                        {requestLoading === "Waiter Call" && <RefreshCw className="w-3 h-3 animate-spin" style={{ color: theme.primary }} />}
                                    </button>
                                    <button 
                                        onClick={() => handleQuickRequest("Mineral Water", "Sparkling Water requested")}
                                        disabled={!!requestLoading}
                                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-black/5 transition-colors group"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <Droplets className="w-5 h-5" style={{ color: theme.primary }} />
                                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.text }}>Hydration</span>
                                        </div>
                                        {requestLoading === "Mineral Water" && <RefreshCw className="w-3 h-3 animate-spin" style={{ color: theme.primary }} />}
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

                    {/* Center: Empty Space (Branding Removed) */}
                    <div className="flex-1" />

                    {/* Right: Shopping Bag / Cart */}
                    <div className="flex-shrink-0">
                        <button 
                            id="header-cart-button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open_cart'))}
                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 active:scale-95 transition-all relative"
                            style={{ color: theme.primary }}
                        >
                            <ShoppingBag className="w-6 h-6" />
                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 w-6 h-6 text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-white"
                                        style={{ backgroundColor: theme.accent }}
                                    >
                                        {cartCount}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>
                </div>

                {/* Row 2: Premium Mode Selector (Separate Buttons) */}
                <div className="px-6 flex items-center justify-center space-x-3">
                    <button 
                        onClick={() => {
                            if (tableNumber?.toLowerCase() === 'takeaway' || tableNumber?.toLowerCase() === 'takeout') {
                                localStorage.removeItem(`hotel_room_${hotelSlug}`);
                                window.location.href = window.location.pathname;
                            }
                        }}
                        className="flex-1 py-3 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm border"
                        style={{ 
                            backgroundColor: (tableNumber?.toLowerCase() !== "takeaway" && tableNumber?.toLowerCase() !== "takeout") ? theme.primary : "transparent",
                            borderColor: (tableNumber?.toLowerCase() !== "takeaway" && tableNumber?.toLowerCase() !== "takeout") ? theme.primary : `${theme.primary}20`,
                            color: (tableNumber?.toLowerCase() !== "takeaway" && tableNumber?.toLowerCase() !== "takeout") ? "white" : `${theme.primary}88`
                        }}
                    >
                        <span>Dine-In</span>
                    </button>
                    <button 
                        onClick={() => {
                            if (tableNumber?.toLowerCase() !== 'takeaway' && tableNumber?.toLowerCase() !== 'takeout') {
                                localStorage.setItem(`hotel_room_${hotelSlug}`, 'Takeaway');
                                localStorage.removeItem(`hotel_pin_${hotelSlug}`);
                                // Hard reload into the Takeaway URL
                                window.location.href = window.location.pathname + "?room=Takeaway";
                            }
                        }}
                        className="flex-1 py-3 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-sm border"
                        style={{ 
                            backgroundColor: (tableNumber?.toLowerCase() === "takeaway" || tableNumber?.toLowerCase() === "takeout") ? theme.primary : "transparent",
                            borderColor: (tableNumber?.toLowerCase() === "takeaway" || tableNumber?.toLowerCase() === "takeout") ? theme.primary : `${theme.primary}20`,
                            color: (tableNumber?.toLowerCase() === "takeaway" || tableNumber?.toLowerCase() === "takeout") ? "white" : `${theme.primary}88`
                        }}
                    >
                        <span>Takeaway</span>
                    </button>
                </div>
            </div>
        </motion.header>
    );
}
