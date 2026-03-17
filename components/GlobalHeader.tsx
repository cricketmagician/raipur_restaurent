"use client";

import React, { useState, useEffect } from "react";
import { Utensils, ShoppingBag, User, Bell, Droplets, ArrowLeft, Menu, Sparkles, RefreshCw, X } from "lucide-react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useHotelBranding, addSupabaseRequest, useCart } from "@/utils/store";
import { useGuestRoom } from "../app/[hotel_slug]/guest/GuestAuthWrapper";

export function GlobalHeader() {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const { roomNumber } = useGuestRoom();
    const { cartCount } = useCart(branding?.id);
    
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
                {/* Row 1: Menu (Left), Branding (Center), Cart (Right) */}
                <div className="px-6 flex items-center justify-between gap-4">
                    {/* Left: Menu & Utility Dropdown */}
                    <div className="flex-shrink-0 relative">
                        <button 
                            onClick={() => setShowUtility(!showUtility)}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                showUtility ? "bg-[#1E3932] text-white" : "bg-white border border-slate-100 text-[#00704A] shadow-sm"
                            } active:scale-95`}
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

                    {/* Center: Branding & Logo */}
                    <div 
                        className="flex-1 flex flex-col items-center justify-center cursor-pointer"
                        onClick={() => router.push(`/${hotelSlug}/guest/dashboard`)}
                    >
                        <div className="flex items-center space-x-2">
                            {branding?.logoImage || branding?.logo ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden shadow-md border-2 border-white">
                                    <img src={branding.logoImage || branding.logo} alt="Logo" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-8 h-8 bg-[#00704A] rounded-full flex items-center justify-center shadow-md">
                                    <div className="text-white font-serif italic text-sm">S</div>
                                </div>
                            )}
                            <h1 className="text-base font-black text-[#1E3932] leading-tight tracking-tight">
                                {branding?.name || "Starbucks"}
                            </h1>
                        </div>
                        <p className="text-[8px] font-bold text-[#00704A]/60 uppercase tracking-[0.2em] truncate mt-0.5">
                            {branding?.address || "Experience the Siren"}
                        </p>
                    </div>

                    {/* Right: Shopping Bag / Cart */}
                    <div className="flex-shrink-0">
                        <button 
                            id="header-cart-button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open_cart'))}
                            className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 active:scale-95 transition-all text-[#00704A] relative"
                        >
                            <ShoppingBag className="w-6 h-6" />
                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 w-6 h-6 bg-[#D4AF37] text-[#3E2723] rounded-full text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-white"
                                    >
                                        {cartCount}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
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
                                    // Also remove the TAKEAWAY in the URL if present
                                    const newUrl = window.location.pathname;
                                    router.push(newUrl);
                                    setTimeout(() => window.location.reload(), 50);
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
                                    const newUrl = window.location.pathname + '?room=Takeaway';
                                    router.push(newUrl);
                                    setTimeout(() => window.location.reload(), 50);
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
