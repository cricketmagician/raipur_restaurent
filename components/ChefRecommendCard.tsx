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
            className="flex-none w-[280px] aspect-[4/5] rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-xl hover:shadow-2xl transition-all"
            style={{ backgroundColor: theme.surface }}
        >
            <img 
                src={getDirectImageUrl(item.image_url)} 
                alt={item.title} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute top-6 left-6 flex items-center bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
                <Sparkles className="w-3 h-3 text-yellow-400 mr-2" />
                <span className="text-[8px] font-black italic text-white uppercase tracking-widest">Chef Recommends</span>
            </div>

            <div className="absolute bottom-8 left-8 right-8 text-white">
                <h3 className="text-2xl font-black italic mb-2 leading-tight">
                    {item.title}
                </h3>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-black tracking-tighter">₹{item.price}</span>
                    {quantity > 0 ? (
                        <div
                            className="flex items-center rounded-full p-1.5 bg-white/15 backdrop-blur-md border border-white/15 shadow-lg"
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
                            <span className="w-10 text-center text-sm font-black tracking-widest text-white">
                                {quantity}
                            </span>
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
                            className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
