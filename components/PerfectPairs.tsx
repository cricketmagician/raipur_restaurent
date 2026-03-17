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

            <div className="grid grid-cols-1 gap-4">
                {pairs.map((pair) => (
                    <motion.div
                        key={pair.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-white p-6 border flex items-center group relative overflow-hidden shadow-xl"
                        style={{ 
                            borderRadius: theme.radius,
                            borderColor: `${theme.primary}10`
                        }}
                    >
                        {/* Abstract background shape */}
                        <div 
                            className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl transition-colors" 
                            style={{ backgroundColor: `${theme.secondary}66` }} 
                        />

                        <div className="w-24 h-24 rounded-full overflow-hidden mr-6 shadow-xl border-4 border-white shrink-0 relative z-10">
                            <img src={pair.image} alt={pair.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 min-w-0 relative z-10">
                            <h4 className="text-lg font-black tracking-tight" style={{ color: theme.text }}>{pair.title}</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-1 mb-3" style={{ color: theme.primary }}>
                                {pair.subtitle}
                            </p>
                            <span className="text-xl font-black" style={{ color: theme.text }}>₹{pair.price}</span>
                        </div>

                        {cart[pair.originalId] > 0 ? (
                            <div className="flex items-center bg-[#F2F0EB] rounded-full p-1 border border-[#00704A]/10 relative z-10" onClick={(e) => e.stopPropagation()}>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateQuantity(pair.originalId, cart[pair.originalId] - 1);
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-[#00704A] hover:bg-white transition-all shadow-sm"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center text-xs font-black text-[#1E3932]">{cart[pair.originalId]}</span>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateQuantity(pair.originalId, cart[pair.originalId] + 1);
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-[#00704A] text-white shadow-md"
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
                                className="text-white p-4 rounded-2xl shadow-lg active:scale-90 transition-all relative z-10 font-black"
                                style={{ 
                                    backgroundColor: theme.primary,
                                    borderRadius: `calc(${theme.radius} * 0.5)`
                                }}
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
