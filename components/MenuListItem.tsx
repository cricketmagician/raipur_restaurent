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
    onUpdateQuantity,
    isLarge = false
}: Omit<MenuListItemProps, 'rating' | 'reviews' | 'isBestseller'> & { isLarge?: boolean }) {
    return (
        <motion.div 
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
            whileTap={{ scale: 0.98 }}
            className={`bg-white rounded-[22px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col relative group transition-all duration-300 border border-slate-50 ${isLarge ? 'col-span-2' : ''}`}
        >
            {/* Image Section: Food First (60% proportional focus) */}
            <div className={`relative w-full overflow-hidden ${isLarge ? 'h-[240px]' : 'h-[180px]'}`}>
                <img 
                    src={image} 
                    alt={title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Badges on Image */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {(trendingCount > 0 || isLarge) && (
                        <div className="bg-[#1A1A1A]/80 backdrop-blur-md text-[#B8860B] text-[7px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest w-fit border border-[#B8860B]/20 shadow-xl">
                            <Zap className="w-2 h-2 mr-1 inline-block fill-[#B8860B]" />
                            {isLarge ? "Chef's Signature" : "Trending Choice"}
                        </div>
                    )}
                </div>
                
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center shadow-md border border-white/20">
                    <span className="text-[11px] font-medium text-slate-900 tracking-tight">₹{price.toFixed(0)}</span>
                </div>
            </div>

            {/* Info Section: Minimal Context */}
            <div className={`p-5 flex flex-col flex-1 ${isLarge ? 'items-center text-center px-10' : ''}`}>
                <h3 className={`${isLarge ? 'text-2xl mb-2' : 'text-sm mb-1'} font-serif text-slate-900 leading-tight group-hover:text-[#722F37] transition-colors line-clamp-1 italic`}>{title.toLowerCase()}</h3>
                <p className={`${isLarge ? 'text-xs mb-6' : 'text-[9px] mb-4'} text-slate-400 font-medium line-clamp-2 leading-relaxed tracking-tight italic`}>“{description}”</p>
                
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
                                    <span>Add to your table</span>
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
