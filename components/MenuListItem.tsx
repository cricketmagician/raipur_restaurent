"use client";

import React from "react";
import { Plus, Minus, Star, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";

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
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);

    return (
        <motion.div 
            variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -8, boxShadow: `0 30px 60px ${theme.primary}15` }}
            whileTap={{ scale: 0.98 }}
            className={`bg-white shadow-[0_15px_45px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col relative group transition-all duration-500 border-b-4 ${isLarge ? 'col-span-2' : ''}`}
            style={{ 
                borderRadius: "1.25rem", 
                borderColor: quantity > 0 ? theme.primary : "transparent",
                borderBottomColor: quantity > 0 ? theme.primary : "transparent"
            }}
        >
            {/* Image Section: Elite Starbucks Texture */}
            <div className={`relative w-full overflow-hidden ${isLarge ? 'h-[280px]' : 'h-[200px]'}`}>
                <img 
                    src={image} 
                    alt={title} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-1000 opacity-95"
                />
                
                {/* Visual Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                
                {/* Top Badges */}
                <div className="absolute top-4 left-4">
                    {isLarge && (
                        <div 
                            className="backdrop-blur-xl text-[8px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] w-fit border shadow-2xl flex items-center gap-2"
                            style={{ backgroundColor: theme.primary, color: "white", borderColor: "rgba(255,255,255,0.1)" }}
                        >
                            <Star className="w-2.5 h-2.5 fill-white" />
                            Premium Reserve
                        </div>
                    )}
                </div>
                
                {/* Floating Price Tag */}
                <div 
                    className="absolute bottom-4 right-4 backdrop-blur-2xl px-4 py-2 rounded-2xl flex items-center shadow-2xl border"
                    style={{ backgroundColor: "rgba(255,255,255,0.9)", borderColor: "rgba(0,112,74,0.1)" }}
                >
                    <span className="text-sm font-black tracking-tight text-[#00704A]">₹{price.toFixed(0)}</span>
                </div>
            </div>

            {/* Info Section: Sophisticated Typography */}
            <div className={`p-6 flex flex-col flex-1 ${isLarge ? 'items-center text-center px-12' : ''}`}>
                <div className="mb-3">
                    <h3 
                        className={`${isLarge ? 'text-2xl mb-2' : 'text-base mb-1'} font-black leading-tight transition-colors line-clamp-2 uppercase tracking-tight`}
                        style={{ color: "#1E3932" }}
                    >
                        {title}
                    </h3>
                    <div className="flex items-center gap-2 opacity-40">
                        <span className="text-[9px] font-bold uppercase tracking-widest">Handcrafted</span>
                        <div className="w-1 h-1 rounded-full bg-current" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Fresh</span>
                    </div>
                </div>

                <p 
                    className={`${isLarge ? 'text-sm mb-8' : 'text-[10px] mb-6'} font-medium line-clamp-2 leading-relaxed tracking-tight opacity-60 italic`}
                    style={{ color: "#1E3932" }}
                >
                    {description}
                </p>
                
                <div className="mt-auto">
                    <AnimatePresence mode="wait">
                        {quantity === 0 ? (
                            <motion.button 
                                key="add"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateQuantity(1);
                                }}
                                className="w-full font-black text-[9px] uppercase tracking-[0.25em] py-4 shadow-xl transition-all flex items-center justify-center space-x-3 group-hover:bg-[#1E3932]"
                                style={{ backgroundColor: "#00704A", color: "white", borderRadius: "100px" }}
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add to Bag</span>
                            </motion.button>
                        ) : (
                            <motion.div 
                                key="quantity"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full flex items-center justify-between shadow-2xl overflow-hidden h-12 px-2"
                                style={{ backgroundColor: "#1E3932", color: "white", borderRadius: "100px" }}
                            >
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateQuantity(quantity - 1);
                                    }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <div className="flex flex-col items-center">
                                    <span className="text-xs font-black leading-none">{quantity}</span>
                                    <span className="text-[7px] font-bold uppercase tracking-widest opacity-40">In Bag</span>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdateQuantity(quantity + 1);
                                    }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-[#1E3932] shadow-lg"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
