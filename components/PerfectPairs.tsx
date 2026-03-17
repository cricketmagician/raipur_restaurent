"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAddEffectTrigger } from "./AddEffect";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";

interface PairItem {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    price: number;
    originalId: string;
}

interface PerfectPairsProps {
    pairs: PairItem[];
    cart: Record<string, number>;
    onUpdateQuantity: (id: string, q: number) => void;
}

export function PerfectPairs({ pairs, cart, onUpdateQuantity }: PerfectPairsProps) {
    const triggerFly = useAddEffectTrigger();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    
    return (
        <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] px-2" style={{ color: theme.primary }}>
                🤤 Perfect Pairs
            </h3>

            <div className="grid grid-cols-1 gap-6">
                {pairs.map((pair, idx) => {
                    const isDessert = pair.title.toLowerCase().includes('sweet') || pair.title.toLowerCase().includes('cake') || pair.title.toLowerCase().includes('dessert');
                    const individualPrice = Math.round(pair.price * 1.15); // Anchor price logic
                    
                    return (
                        <motion.div
                            key={pair.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02, translateY: -4 }}
                            viewport={{ once: true }}
                            className="p-8 border flex flex-col sm:flex-row items-center sm:items-start group relative overflow-hidden transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)]"
                            style={{ 
                                borderRadius: theme.radius,
                                backgroundColor: isDessert ? "#FFF5F7" : theme.surface, 
                                borderColor: isDessert ? "#FFD1DC" : `${theme.primary}08`
                            }}
                        >
                            {/* Visual background interest */}
                            <div 
                                className="absolute -right-10 -top-10 w-64 h-64 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-1000" 
                                style={{ backgroundColor: theme.primary }} 
                            />

                            <div 
                                className="w-40 h-40 rounded-[3rem] overflow-hidden mb-6 sm:mb-0 sm:mr-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 shrink-0 relative z-10 transition-all duration-700 group-hover:scale-[1.1] group-hover:rotate-2"
                                style={{ borderColor: theme.surface }}
                            >
                                <img 
                                    src={pair.image} 
                                    alt={pair.title} 
                                    className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-[1.08] group-hover:contrast-[1.08]" 
                                    style={{ filter: "brightness(1.02) contrast(1.05)" }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-white/10" />
                            </div>

                            <div className="flex-1 w-full relative z-10 text-center sm:text-left">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-4">
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-amber-500 text-white shadow-sm border border-amber-400/20">
                                        🔥 MOST LOVED COMBO
                                    </span>
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-red-500 text-white shadow-sm border border-red-400/20">
                                        ✨ TRENDING NOW
                                    </span>
                                </div>

                                <div className="space-y-1 mb-6">
                                    <h4 className="text-2xl font-black tracking-tight leading-tight whitespace-pre-line" style={{ color: theme.text }}>
                                        {pair.title.replace(' + ', ' \n+ ')}
                                    </h4>
                                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em]" style={{ color: theme.text }}>
                                        Handcrafted Pairing
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
                                    <div className="flex flex-col items-center sm:items-start order-2 sm:order-1">
                                        <span className="text-[10px] font-bold text-slate-400 line-through decoration-slate-300 mb-1">
                                            Individually ₹{individualPrice}
                                        </span>
                                        <span className="text-4xl font-black tracking-tighter leading-none" style={{ color: theme.text }}>
                                            ₹{pair.price}
                                        </span>
                                    </div>
                                    
                                    <div className="order-1 sm:order-2 w-full sm:w-auto">
                                        {cart[pair.originalId] > 0 ? (
                                            <div 
                                                className="flex items-center justify-center rounded-full p-1.5 border bg-white/50 backdrop-blur-md shadow-sm" 
                                                style={{ borderColor: `${theme.primary}20` }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdateQuantity(pair.originalId, cart[pair.originalId] - 1);
                                                    }}
                                                    className="w-11 h-11 rounded-full flex items-center justify-center transition-all bg-white shadow-sm active:scale-90"
                                                    style={{ color: theme.primary }}
                                                >
                                                    -
                                                </button>
                                                <span className="w-12 text-center text-lg font-black" style={{ color: theme.text }}>{cart[pair.originalId]}</span>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUpdateQuantity(pair.originalId, cart[pair.originalId] + 1);
                                                    }}
                                                    className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 hover:brightness-110"
                                                    style={{ backgroundColor: theme.primary }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    triggerFly(pair.originalId, pair.image, e);
                                                    onUpdateQuantity(pair.originalId, 1);
                                                }}
                                                className="w-full sm:w-auto px-10 py-5 text-white rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.2)] active:scale-95 transition-all font-black text-[11px] uppercase tracking-[0.2em] hover:brightness-110 border border-white/10"
                                                style={{ backgroundColor: theme.primary }}
                                            >
                                                Add combo
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
