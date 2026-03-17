"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { useAddEffectTrigger } from "./AddEffect";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";

interface TrendingItem {
    id: string;
    title: string;
    description: string;
    image: string;
    price: number;
    tag: string;
    menuItemId: string; // Ensure we have the real ID
}

interface TrendingNowProps {
    items: TrendingItem[];
    cart: Record<string, number>;
    onUpdateQuantity: (id: string, q: number) => void;
    onItemClick: (id: string) => void;
}

export function TrendingNow({ items, cart, onUpdateQuantity, onItemClick }: TrendingNowProps) {
    const triggerFly = useAddEffectTrigger();
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: theme.primary }}>
                    🔥 Trending Now
                </h3>
                <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.secondary, color: theme.primary }}>
                    Social Proof
                </span>
            </div>

            <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-10 -mx-6 px-6 items-end">
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onItemClick(item.id)}
                        className="flex-none w-[82%] sm:w-[75%] overflow-hidden cursor-pointer relative group shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-white/10"
                        style={{ 
                            borderRadius: "1.5rem",
                            backgroundColor: "#000"
                        }}
                    >
                        <div className={`overflow-hidden relative ${idx === 0 ? 'aspect-[4/5]' : 'aspect-square'}`}>
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-90" 
                            />
                            {/* Dark gradient overlay for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            
                            {/* Social Proof Overlays */}
                            <div className="absolute top-5 left-5">
                                <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md text-white border border-white/20">
                                    {item.tag}
                                </span >
                            </div>

                            <div className="absolute bottom-6 left-6 right-6">
                                <h4 className="text-2xl font-black tracking-tight leading-none text-white mb-2">
                                    {item.title}
                                </h4>
                                <div className="flex items-center space-x-2 opacity-60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                                        Elite Choice
                                    </span>
                                </div>
                            </div>

                            {/* Floating Glass Control */}
                            <div className="absolute top-5 right-5 flex flex-col items-center gap-2">
                                <div className="bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/10">
                                    <span className="text-sm font-black text-white">₹{item.price}</span>
                                </div>
                                
                                {cart[item.menuItemId] > 0 ? (
                                    <div 
                                        className="flex flex-col items-center rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-1"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateQuantity(item.menuItemId, cart[item.menuItemId] + 1);
                                            }}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-white/20"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        <div className="py-2">
                                            <span className="text-xs font-black text-white">{cart[item.menuItemId]}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateQuantity(item.menuItemId, cart[item.menuItemId] - 1);
                                            }}
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40"
                                        >
                                            -
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            triggerFly(item.menuItemId, item.image, e);
                                            onUpdateQuantity(item.menuItemId, 1);
                                        }}
                                        className="w-11 h-11 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
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
