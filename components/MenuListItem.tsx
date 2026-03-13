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
    rating, 
    reviews, 
    image, 
    isBestseller,
    trendingCount,
    quantity,
    onUpdateQuantity 
}: MenuListItemProps) {
    return (
        <motion.div 
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-[22px] shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col relative group transition-all duration-300"
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
                    {isBestseller && (
                        <div className="bg-[#F55D2C] text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-[#F55D2C]/20 flex items-center">
                            <Zap className="w-2.5 h-2.5 mr-1 fill-white" />
                            Bestseller
                        </div>
                    )}
                    {trendingCount && (
                        <div className="bg-black/40 backdrop-blur-md text-white text-[7px] font-black px-2 py-1 rounded-full uppercase tracking-tighter w-fit">
                            🔥 Trending
                        </div>
                    )}
                </div>
                
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg flex items-center shadow-sm">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 mr-1" />
                    <span className="text-[10px] font-black text-slate-900">{rating}</span>
                </div>
            </div>

            {/* Info Section: Minimal Context */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="text-base font-sans text-slate-900 font-bold leading-tight mb-1 group-hover:text-[#F55D2C] transition-colors line-clamp-1">{title}</h3>
                <p className="text-[10px] text-slate-400 font-medium line-clamp-1 leading-relaxed mb-4">{description}</p>
                
                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-[16px] font-black text-slate-900">₹{price}</span>
                        {/* Removed 'only' and '₹' for modern psychology */}
                    </div>
                    
                    <div className="relative min-w-[80px] flex justify-end">
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
                                    className="bg-[#F55D2C] text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-[#F55D2C]/20 hover:bg-slate-900 transition-all flex items-center space-x-1"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>Add</span>
                                </motion.button>
                            ) : (
                                <motion.div 
                                    key="quantity"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="flex items-center bg-slate-900 text-white rounded-xl shadow-lg overflow-hidden h-8"
                                >
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateQuantity(quantity - 1);
                                        }}
                                        className="px-2 hover:bg-white/10 transition-colors h-full"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-6 text-center text-[10px] font-black">{quantity}</span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdateQuantity(quantity + 1);
                                        }}
                                        className="px-2 hover:bg-white/10 transition-colors h-full"
                                    >
                                        <Plus className="w-3 h-3" />
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
