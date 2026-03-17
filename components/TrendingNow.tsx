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

            <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 items-end">
                {items.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onItemClick(item.id)}
                        className="flex-none w-[78%] sm:w-[72%] overflow-hidden cursor-pointer relative group border shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all duration-500"
                        style={{ 
                            borderRadius: theme.radius,
                            backgroundColor: theme.surface,
                            borderColor: `${theme.primary}05`
                        }}
                    >
                        <div className={`overflow-hidden relative ${idx === 0 ? 'aspect-[5/6]' : 'aspect-[4/5]'}`}>
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                            />
                            {/* Dark gradient overlay for text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            
                            {/* Social Proof Overlays */}
                            <div className="absolute top-6 left-6 flex flex-col space-y-2">
                                <span className="px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl border bg-white text-black border-white/20">
                                    {item.tag}
                                </span>
                            </div>

                            <div className="absolute bottom-8 left-8 right-8">
                                <h4 className="text-3xl font-black tracking-tighter leading-none text-white mb-2 drop-shadow-lg">
                                    {item.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                        Most ordered this evening
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 sm:p-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xl sm:text-2xl font-black" style={{ color: theme.text }}>₹{item.price}</span>
                                
                                {cart[item.menuItemId] > 0 ? (
                                    <div 
                                        className="flex items-center justify-between rounded-full p-1 border min-w-[122px]"
                                        style={{ backgroundColor: `${theme.primary}0a`, borderColor: `${theme.primary}1a` }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateQuantity(item.menuItemId, cart[item.menuItemId] - 1);
                                            }}
                                            className="w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm"
                                            style={{ color: theme.primary, backgroundColor: theme.surface }}
                                        >
                                            -
                                        </button>
                                        <div className="flex-1 flex justify-center">
                                            <span className="min-w-[34px] text-center text-xs font-black" style={{ color: theme.text }}>{cart[item.menuItemId]}</span>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateQuantity(item.menuItemId, cart[item.menuItemId] + 1);
                                            }}
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md"
                                            style={{ backgroundColor: theme.primary }}
                                        >
                                            +
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            triggerFly(item.menuItemId, item.image, e);
                                            onUpdateQuantity(item.menuItemId, 1);
                                        }}
                                        className="h-12 px-8 text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all font-black text-xs uppercase tracking-widest"
                                        style={{ backgroundColor: theme.primary }}
                                    >
                                        Add to Bag
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
