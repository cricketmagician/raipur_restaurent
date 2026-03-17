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
                            viewport={{ once: true }}
                            className="p-8 border flex items-center group relative overflow-hidden transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
                            style={{ 
                                borderRadius: theme.radius,
                                backgroundColor: isDessert ? "#FFF5F7" : theme.surface, // Soft pink hint for desserts
                                borderColor: isDessert ? "#FFD1DC" : `${theme.primary}08`
                            }}
                        >
                            {/* Visual background interest */}
                            <div 
                                className="absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-1000" 
                                style={{ backgroundColor: theme.primary }} 
                            />

                            <div 
                                className="w-32 h-32 rounded-[2.5rem] overflow-hidden mr-8 shadow-2xl border-4 shrink-0 relative z-10 transition-all duration-700 group-hover:scale-[1.08] group-hover:rotate-2"
                                style={{ borderColor: theme.surface }}
                            >
                                <img 
                                    src={pair.image} 
                                    alt={pair.title} 
                                    className="w-full h-full object-cover transition-all duration-700 group-hover:brightness(1.05) group-hover:contrast(1.1)" 
                                    style={{ filter: "brightness(1.02) contrast(1.05)" }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/10" />
                            </div>

                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-amber-500 text-white shadow-sm border border-amber-400/20">
                                        🔥 MOST LOVED COMBO
                                    </span>
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm text-slate-500 border border-slate-100">
                                        ❤️ LOVED BY 120+ GUESTS
                                    </span>
                                </div>

                                <div className="space-y-0.5 mb-4">
                                    <h4 className="text-xl font-black tracking-tight leading-tight" style={{ color: theme.text }}>
                                        {pair.title}
                                    </h4>
                                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest" style={{ color: theme.text }}>
                                        {pair.subtitle}
                                    </p>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 line-through decoration-slate-300">
                                            Individually ₹{individualPrice}
                                        </span>
                                        <span className="text-3xl font-black tracking-tighter" style={{ color: theme.text }}>
                                            ₹{pair.price}
                                        </span>
                                    </div>
                                    
                                    {cart[pair.originalId] > 0 ? (
                                        <div 
                                            className="flex items-center rounded-full p-1 border bg-white/50 backdrop-blur-sm" 
                                            style={{ borderColor: `${theme.primary}20` }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUpdateQuantity(pair.originalId, cart[pair.originalId] - 1);
                                                }}
                                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white shadow-sm active:scale-90"
                                                style={{ color: theme.primary }}
                                            >
                                                -
                                            </button>
                                            <span className="w-10 text-center text-sm font-black" style={{ color: theme.text }}>{cart[pair.originalId]}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onUpdateQuantity(pair.originalId, cart[pair.originalId] + 1);
                                                }}
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90"
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
                                            className="px-8 py-4 text-white rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.15)] active:scale-95 transition-all font-black text-[9px] uppercase tracking-[0.2em] group-hover:scale-105"
                                            style={{ backgroundColor: theme.primary }}
                                        >
                                            Add to Order
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
