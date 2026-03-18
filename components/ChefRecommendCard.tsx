"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus, Minus, Trash2 } from "lucide-react";
import { getDirectImageUrl } from "@/utils/image";
import { useAddEffectTrigger } from "./AddEffect";

interface ChefRecommendCardProps {
    item: any;
    onAdd: () => void;
    onRemove?: () => void;
    onClick: () => void;
    theme: any;
    quantity?: number;
}

export function ChefRecommendCard({ item, onAdd, onRemove, onClick, theme, quantity = 0 }: ChefRecommendCardProps) {
    const triggerFly = useAddEffectTrigger();

    return (
        <motion.div 
            whileHover={{ y: -10 }}
            onClick={onClick}
            className="flex-none w-[284px] aspect-[4/5] rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-[0_26px_80px_-28px_rgba(0,0,0,0.45)] hover:shadow-[0_30px_90px_-26px_rgba(0,0,0,0.5)] transition-all"
            style={{ backgroundColor: theme.surface }}
        >
            <img 
                src={getDirectImageUrl(item.image_url)} 
                alt={item.title} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/42 to-black/12" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_34%)]" />

            <div className="absolute top-5 left-5 flex items-center bg-black/36 border border-white/18 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg">
                <Sparkles className="w-3 h-3 text-yellow-400 mr-2" />
                <span className="text-[8px] font-black italic text-white uppercase tracking-[0.22em]">Chef&apos;s Picks</span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <div className="mb-6">
                    <p className="mb-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/60">
                        Curated for this category
                    </p>
                    <h3
                        className="text-[2.15rem] font-black italic leading-[0.92]"
                        style={{ fontFamily: theme.fontSerif }}
                    >
                        {item.title}
                    </h3>
                </div>
                <div className="flex items-end justify-between gap-3">
                    <span className="text-[1.75rem] font-black tracking-tight">₹{item.price}</span>
                    {quantity > 0 ? (
                        <div
                            className="flex items-center justify-between rounded-full p-1.5 bg-white/12 border border-white/15 shadow-lg min-w-[132px] backdrop-blur-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove?.();
                                }}
                                className="w-11 h-11 rounded-full flex items-center justify-center bg-white text-black active:scale-90 transition-transform"
                            >
                                {quantity === 1 ? <Trash2 className="w-5 h-5 text-red-500" /> : <Minus className="w-5 h-5" />}
                            </button>
                            <div className="flex-1 flex justify-center">
                                <span className="min-w-[38px] text-center text-sm font-black tracking-widest text-white">
                                    {quantity}
                                </span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    triggerFly(item.id, item.image_url, e);
                                    onAdd();
                                }}
                                className="w-11 h-11 rounded-full flex items-center justify-center bg-white text-black active:scale-90 transition-transform"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                triggerFly(item.id, item.image_url, e);
                                onAdd();
                            }}
                            className="h-12 rounded-full bg-white text-black px-5 flex items-center justify-center shadow-lg active:scale-90 transition-transform text-[10px] font-black uppercase tracking-[0.28em]"
                        >
                            Add
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
