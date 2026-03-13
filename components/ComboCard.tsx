"use client";

import React from "react";
import { Clock, Plus, Minus, Star } from "lucide-react";
import { motion } from "framer-motion";

interface ComboCardProps {
    title: string;
    items: string[];
    price: number;
    originalPrice: number;
    image: string;
    trendingCount?: number;
    quantity?: number;
    onUpdateQuantity?: (q: number) => void;
    timeLimit?: { hours: number; mins: number; secs: number };
}

export function ComboCard({ title, items, price, originalPrice, image, trendingCount, quantity = 0, onUpdateQuantity, timeLimit }: ComboCardProps) {
    const savings = originalPrice - price;

    return (
        <motion.div 
            whileTap={{ scale: 0.98 }}
            className="relative w-[300px] h-[440px] bg-white rounded-[3rem] overflow-hidden flex flex-col border border-slate-100 shadow-xl group"
        >
            {/* Image Section */}
            <div className="relative h-[240px] w-full overflow-hidden">
                <img 
                    src={image} 
                    alt={title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Social Proof Badge */}
                {trendingCount && (
                    <div className="absolute top-5 left-5 bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full flex items-center shadow-lg">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/90">🔥 {trendingCount} ordered today</span>
                    </div>
                )}

                {/* Title Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-serif text-white font-black leading-tight uppercase drop-shadow-lg">{title}</h3>
                    <div className="mt-2 inline-block bg-[#F55D2C] text-white px-3 py-1 rounded-lg shadow-xl translate-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest leading-none">SAVE ₹{savings}</p>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="p-8 flex flex-col flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 italic">Guaranteed Satisfaction</p>
                <div className="flex flex-wrap gap-2 mb-6">
                    {items.slice(0, 3).map((item, i) => (
                        <span key={i} className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100/50">
                            {item}
                        </span>
                    ))}
                </div>

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                            <span className="text-3xl font-serif font-black text-slate-900 leading-none">₹{price}</span>
                            <div className="flex flex-col leading-none">
                                <span className="text-xs font-bold text-slate-300 line-through">₹{originalPrice}</span>
                                <span className="text-[9px] font-black text-[#F55D2C] uppercase tracking-tighter mt-0.5">Save ₹{savings}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        {quantity === 0 ? (
                            <button 
                                onClick={() => onUpdateQuantity?.(1)}
                                className="bg-[#F55D2C] text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#F55D2C]/30 hover:bg-[#d94f27] transition-all active:scale-90"
                            >
                                + Add to Table
                            </button>
                        ) : (
                            <div className="flex items-center bg-[#F55D2C] text-white rounded-2xl shadow-lg shadow-[#F55D2C]/30 overflow-hidden h-12">
                                <button 
                                    onClick={() => onUpdateQuantity?.(quantity - 1)}
                                    className="px-3 hover:bg-white/10 transition-colors h-full"
                                >
                                    <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-6 text-center text-xs font-black">{quantity}</span>
                                <button 
                                    onClick={() => onUpdateQuantity?.(quantity + 1)}
                                    className="px-3 hover:bg-white/10 transition-colors h-full"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
