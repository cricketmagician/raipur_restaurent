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

            <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-6 -mx-2 px-2">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onItemClick(item.id)}
                        className="flex-none w-[85%] overflow-hidden shadow-2xl cursor-pointer relative group border"
                        style={{ 
                            borderRadius: theme.radius,
                            backgroundColor: theme.surface,
                            borderColor: `${theme.primary}10`
                        }}
                    >
                        <div className="aspect-[16/10] overflow-hidden relative">
                            <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to top, ${theme.primary}88, transparent, transparent)` }} />
                            
                            <div className="absolute top-6 left-6">
                                <span className="backdrop-blur-md px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl border" style={{ backgroundColor: `${theme.surface}e6`, color: theme.primary, borderColor: `${theme.primary}10` }}>
                                    {item.tag}
                                </span>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-2xl font-black tracking-tighter leading-tight" style={{ color: theme.text }}>
                                    {item.title}
                                </h4>
                                <div className="p-2 rounded-full" style={{ backgroundColor: theme.secondary }}>
                                    <ArrowUpRight className="w-5 h-5" style={{ color: theme.primary }} />
                                </div>
                            </div>
                            <p className="text-sm font-medium italic mb-4 line-clamp-1" style={{ color: theme.text, opacity: 0.6 }}>
                                {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-black" style={{ color: theme.text }}>₹{item.price}</span>
                                
                                {cart[item.menuItemId] > 0 ? (
                                    <div 
                                        className="flex items-center rounded-full p-1 border" 
                                        style={{ backgroundColor: `${theme.primary}0a`, borderColor: `${theme.primary}1a` }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateQuantity(item.menuItemId, cart[item.menuItemId] - 1);
                                            }}
                                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm"
                                            style={{ color: theme.primary, backgroundColor: theme.surface }}
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center text-[10px] font-black" style={{ color: theme.text }}>{cart[item.menuItemId]}</span>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdateQuantity(item.menuItemId, cart[item.menuItemId] + 1);
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
                                            e.stopPropagation();
                                            triggerFly(item.menuItemId, item.image, e);
                                            onUpdateQuantity(item.menuItemId, 1);
                                        }}
                                        className="w-10 h-10 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all font-black"
                                        style={{ backgroundColor: theme.primary }}
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
