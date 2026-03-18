import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import { CategoryTheme } from "@/utils/themes";
import { motion, AnimatePresence } from "framer-motion";

import { getDirectImageUrl } from "@/utils/image";
import { useAddEffectTrigger } from "./AddEffect";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";

interface MenuCardProps {
    id: string;
    title: string;
    description: string;
    price: number;
    image?: string;
    onAdd?: () => void;
    isPopular?: boolean;
    isRecommended?: boolean;
    badgeText?: string;
    theme?: CategoryTheme;
    onClick?: () => void;
    quantity?: number;
    onRemove?: () => void;
}

export function MenuCard({ id, title, description, price, image, onAdd, isPopular, isRecommended, badgeText, theme: categoryTheme, onClick, quantity = 0, onRemove }: MenuCardProps) {
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const globalTheme = useTheme(branding);
    
    // Merge global theme with category-specific overrides
    const textColor = globalTheme.text;
    const primaryColor = globalTheme.primary;
    
    const popularEffect = isPopular ? `shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] scale-[1.02]` : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border-slate-100/50';
    
    const triggerFly = useAddEffectTrigger();

    // Final tag logic
    const finalTag = badgeText || 
        (isRecommended ? "Chef Recommend" : 
         isPopular ? "Best Seller" : 
         null);

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`group rounded-[1.85rem] ${popularEffect} overflow-hidden flex flex-row hover:shadow-[0_28px_60px_rgba(0,33,30,0.1)] transition-all duration-500 ease-out active:scale-[0.985] relative ${onClick ? 'cursor-pointer' : ''}`}
            style={{ backgroundColor: globalTheme.surface }}
        >
            {image && (
                <div className="relative w-[132px] sm:w-[148px] shrink-0 overflow-hidden" style={{ backgroundColor: globalTheme.background }}>
                    <img
                        src={getDirectImageUrl(image)}
                        alt={title}
                        className="object-cover w-full h-full min-h-full transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                    
                    <div 
                        className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
                        style={{ backgroundImage: `linear-gradient(to top, ${globalTheme.primary}44, transparent, transparent)` }}
                    />
                    
                    {finalTag && (
                        <div 
                            className="absolute top-3 left-3 text-white px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.18em] z-10 border border-white/10 shadow-lg"
                            style={{ backgroundColor: isRecommended ? primaryColor : "#F59E0B" }}
                        >
                            {finalTag}
                        </div>
                    )}
                </div>
            )}

            <div className="p-4 sm:p-5 flex flex-col flex-1 relative z-10 min-w-0">
                <div className="mb-2 pr-1">
                    <h3 
                        className="font-black text-[1.1rem] sm:text-[1.25rem] leading-tight tracking-tight transition-colors duration-500 line-clamp-2"
                        style={{ color: primaryColor, fontFamily: globalTheme.fontSans }}
                    >
                        {title}
                    </h3>
                </div>
                <p 
                    className="text-[11px] sm:text-[12px] font-medium line-clamp-2 mb-4 leading-relaxed tracking-tight min-h-[34px]"
                    style={{ color: `${textColor}99`, fontFamily: globalTheme.fontSans }}
                >
                    {description}
                </p>
                <div className="mt-auto flex items-end justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.22em] opacity-35 mb-1">Price</p>
                        <span className="text-xl sm:text-[1.35rem] font-black" style={{ color: primaryColor }}>₹{price}</span>
                    </div>
                    
                    <AnimatePresence mode="wait">
                        {quantity > 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                className="flex items-center justify-between rounded-full p-1 border shadow-sm min-w-[122px]"
                                style={{ backgroundColor: globalTheme.background, borderColor: `${primaryColor}20` }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove?.();
                                    }}
                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                                    style={{ color: primaryColor }}
                                >
                                    {quantity === 1 ? <Trash2 className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4" />}
                                </button>
                                
                                <div className="flex-1 flex justify-center">
                                    <span className="min-w-[34px] px-2 text-center text-sm font-black" style={{ color: primaryColor }}>
                                        {quantity}
                                    </span>
                                </div>
                                
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (image) triggerFly(id, image, e);
                                        onAdd?.();
                                    }}
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all font-black"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ) : (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (image) triggerFly(id, image, e);
                                    onAdd?.();
                                }}
                                className="h-11 px-4 rounded-full text-white flex items-center justify-center transition-all hover:shadow-xl active:scale-95 shadow-lg font-black text-[10px] uppercase tracking-[0.2em]"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Add
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
