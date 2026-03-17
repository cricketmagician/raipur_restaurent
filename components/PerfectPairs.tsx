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
                {pairs.map((pair, idx) => (
                    <motion.div
                        key={pair.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-8 border flex items-center group relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_15px_45px_rgba(0,0,0,0.1)] transition-all duration-500"
                        style={{ 
                            borderRadius: theme.radius,
                            backgroundColor: theme.surface,
                            borderColor: `${theme.primary}08`
                        }}
                    >
                        {/* Abstract visual interest */}
                        <div 
                            className="absolute -right-6 -bottom-6 w-40 h-40 rounded-full blur-3xl transition-colors opacity-10 group-hover:opacity-20 duration-700" 
                            style={{ backgroundColor: theme.primary }} 
                        />

                        <div 
                            className="w-28 h-28 rounded-[2rem] overflow-hidden mr-8 shadow-2xl border-2 shrink-0 relative z-10 group-hover:scale-105 transition-transform duration-700"
                            style={{ borderColor: theme.surface }}
                        >
                            <img src={pair.image} alt={pair.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </div>

                        <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border" 
                                      style={{ backgroundColor: `${theme.primary}08`, color: theme.primary, borderColor: `${theme.primary}10` }}>
                                    {idx === 0 ? "Made for each other" : "Classic combo"}
                                </span>
                            </div>
                            <h4 className="text-xl font-black tracking-tight mb-1" style={{ color: theme.text }}>{pair.title}</h4>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-4" style={{ color: theme.text }}>
                                {pair.subtitle}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-black" style={{ color: theme.text }}>₹{pair.price}</span>
                                
                                {cart[pair.originalId] > 0 ? (
                                    <div 
                                        className="flex items-center rounded-full p-1 border" 
                                        style={{ backgroundColor: `${theme.primary}0a`, borderColor: `${theme.primary}1a` }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateQuantity(pair.originalId, cart[pair.originalId] - 1);
                                            }}
                                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white shadow-sm"
                                            style={{ color: theme.primary }}
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center text-xs font-black" style={{ color: theme.text }}>{cart[pair.originalId]}</span>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateQuantity(pair.originalId, cart[pair.originalId] + 1);
                                            }}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
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
                                        className="text-white px-6 py-3 rounded-full shadow-lg active:scale-90 transition-all font-black text-[10px] uppercase tracking-widest"
                                        style={{ backgroundColor: theme.primary }}
                                    >
                                        Upgrade
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
