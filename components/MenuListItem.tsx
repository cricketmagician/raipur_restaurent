"use client";

import React from "react";
import { Plus, Minus, Star, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MenuListItemProps {
    title: string;
    description: string;
    price: number;
    rating: number;
    reviews: number;
    image: string;
    isBestseller?: boolean;
    trendingCount?: number;
    quantity: number;
    onUpdateQuantity: (q: number) => void;
}

export function MenuListItem({ 
    title, 
    description, 
    price, 
    image, 
    trendingCount = 0,
    quantity,
    onUpdateQuantity 
}: Omit<MenuListItemProps, 'rating' | 'reviews' | 'isBestseller'>) {
    return (
        <motion.div 
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-[22px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col relative group transition-all duration-300 border border-slate-50"
        >
            {/* Image Section: Food First (60% proportional focus) */}
            <div className="relative w-full h-[180px] overflow-hidden">
                <img 
                    src={image} 
                    alt={title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Badges on Image */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {trendingCount > 0 && (
                        <div className="bg-black/80 backdrop-blur-md text-[#D4AF37] text-[7px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest w-fit border border-[#D4AF37]/20 shadow-xl">
                            <Zap className="w-2 h-2 mr-1 inline-block fill-[#D4AF37]" />
                            Trending Choice
                        </div>
                    )}
                </div>
                
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center shadow-md border border-white/20">
                    <span className="text-[11px] font-medium text-slate-900 tracking-tight">₹{price.toFixed(0)}</span>
                </div>
            </div>

            {/* Info Section: Minimal Context */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-serif text-slate-900 leading-tight mb-1 group-hover:text-[#D4AF37] transition-colors line-clamp-1 italic">{title.toLowerCase()}</h3>
                <p className="text-[9px] text-slate-400 font-medium line-clamp-1 leading-relaxed mb-4 tracking-tight">“{description}”</p>
                
                <div className="mt-auto flex items-center justify-between">
                    <div className="relative min-w-[100%] flex">
                        <AnimatePresence mode="wait">
                            {quantity === 0 ? (
                                <motion.button 
                                    key="add"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateQuantity(1);
                                    }}
                                    className="w-full bg-slate-900 text-[#D4AF37] font-black text-[8px] uppercase tracking-[0.2em] px-4 py-2.5 rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center space-x-2"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>Add to Selection</span>
                                </motion.button>
                            ) : (
                                <motion.div 
                                    key="quantity"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="w-full flex items-center justify-between bg-slate-900 text-white rounded-xl shadow-lg overflow-hidden h-9"
                                >
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateQuantity(quantity - 1);
                                        }}
                                        className="h-full px-4 hover:bg-white/10 transition-colors"
                                    >
                                        <Minus className="w-3 h-3 text-[#D4AF37]" />
                                    </button>
                                    <span className="text-[10px] font-black">{quantity}</span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateQuantity(quantity + 1);
                                        }}
                                        className="h-full px-4 hover:bg-white/10 transition-colors"
                                    >
                                        <Plus className="w-3 h-3 text-[#D4AF37]" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
