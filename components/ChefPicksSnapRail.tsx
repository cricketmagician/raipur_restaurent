"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { getDirectImageUrl } from "@/utils/image";
import { useAddEffectTrigger } from "./AddEffect";

interface ChefPicksSnapRailProps {
    items: any[];
    cart: Record<string, number>;
    onAdd: (item: any) => void;
    onRemove: (item: any) => void;
    onItemClick?: (item: any) => void;
}

export function ChefPicksSnapRail({ items, cart, onAdd, onRemove, onItemClick }: ChefPicksSnapRailProps) {
    const triggerFly = useAddEffectTrigger();

    if (!items.length) return null;

    return (
        <section className="space-y-6 py-6">
            <div className="flex items-center justify-between px-4">
                <h4 className="text-xl font-black tracking-tight text-[#0F3D2E]">Chef's Picks</h4>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#C8A96A]">For You</span>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 pb-6">
                {items.map((item) => (
                    <motion.div 
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onItemClick?.(item)}
                        className="min-w-[280px] aspect-[4/5] snap-start rounded-[2.5rem] overflow-hidden relative shadow-2xl group border border-black/5 cursor-pointer"
                    >
                        <img 
                            src={getDirectImageUrl(item.image_url)} 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" 
                            alt={item.title} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/10" />
                        
                        <div className="absolute inset-0 p-8 flex flex-col justify-end gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-[2px] bg-[#C8A96A]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">Signature Pick</span>
                            </div>
                            <h3 className="text-2xl font-semibold text-white tracking-tight leading-tight">{item.title}</h3>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xl font-black text-white">₹{item.price}</span>
                                
                                <div className="flex items-center gap-2">
                                    {cart[item.id] > 0 ? (
                                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full p-1 shadow-2xl">
                                            <button 
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    if (window.navigator?.vibrate) window.navigator.vibrate(40);
                                                    onRemove(item); 
                                                }} 
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:bg-white/10"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="text-sm font-black text-white min-w-[1rem] text-center">{cart[item.id]}</span>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (window.navigator?.vibrate) window.navigator.vibrate(40);
                                                    if (item.image_url) triggerFly(item.id, item.image_url, e);
                                                    onAdd(item);
                                                }} 
                                                className="w-8 h-8 rounded-full bg-[#C8A96A] text-white shadow-md hover:scale-105 active:scale-95"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.navigator?.vibrate) window.navigator.vibrate(40);
                                                if (item.image_url) triggerFly(item.id, item.image_url, e);
                                                onAdd(item);
                                            }}
                                            className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-full text-white shadow-2xl hover:scale-110 transition-all"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
