"use client";

import React, { useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useHotelBranding } from "@/utils/store";
import { motion } from "framer-motion";
import { Utensils, ShoppingBag } from "lucide-react";

export default function WelcomeSelectionPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const hotelSlug = params?.hotel_slug as string;

    const { branding, loading } = useHotelBranding(hotelSlug);

    const room = searchParams?.get("room") || "";
    const pin = searchParams?.get("pin") || "";

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-slate-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!branding) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 text-center">
                <h1 className="text-2xl font-black text-slate-900 mb-2">Property Not Found</h1>
            </div>
        );
    }

    const handleDineIn = () => {
        // Pass along existing room and pin if any
        let url = `/${hotelSlug}/guest/dashboard`;
        const params = new URLSearchParams();
        if (room) params.append("room", room);
        if (pin) params.append("pin", pin);
        
        if (params.toString()) url += `?${params.toString()}`;
        router.push(url);
    };

    const handleParcel = () => {
        // Enforce room=Takeaway
        let url = `/${hotelSlug}/guest/dashboard?room=Takeaway`;
        if (pin) url += `&pin=${pin}`;
        router.push(url);
    };

    return (
        <div 
            className="min-h-screen flex flex-col relative overflow-hidden"
            style={{ 
                backgroundColor: branding.primaryColor || "#0F1B2D",
                backgroundImage: branding.bgPattern ? `url(${branding.bgPattern})` : "none",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80 z-0"></div>

            <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-lg mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    {branding.logoImage || branding.logo ? (
                        <div className="w-32 h-32 mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-4 mb-8 shadow-2xl border border-white/20">
                            <img src={branding.logoImage || branding.logo!} alt={branding.name} className="w-full h-full object-contain" />
                        </div>
                    ) : null}
                    <h1 className="text-4xl font-serif font-black text-white mb-2 tracking-tight">
                        Welcome to
                    </h1>
                    <h2 className="text-5xl font-serif font-black text-white mb-4" style={{ color: branding.accentColor || "#fff" }}>
                        {branding.name}
                    </h2>
                    <p className="text-white/80 font-medium text-lg">How would you like to enjoy your food today?</p>
                </motion.div>

                <div className="w-full space-y-4">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={handleDineIn}
                        className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-[2.5rem] p-6 flex items-center shadow-2xl transition-all group active:scale-95"
                    >
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 mr-6 group-hover:scale-110 transition-transform">
                            <Utensils className="w-8 h-8" />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="text-2xl font-black mb-1">Dine In</h3>
                            <p className="text-white/60 text-sm font-medium">Enjoy your meal at your table</p>
                        </div>
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={handleParcel}
                        className="w-full bg-white text-slate-900 rounded-[2.5rem] p-6 flex items-center shadow-2xl transition-all group active:scale-95"
                    >
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0 mr-6 group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-8 h-8 text-slate-900" />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="text-2xl font-black mb-1">Takeaway / Parcel</h3>
                            <p className="text-slate-500 text-sm font-medium">Pack your food to go</p>
                        </div>
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
