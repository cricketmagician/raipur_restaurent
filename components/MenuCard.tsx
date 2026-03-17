import React from "react";
import { Plus, Minus, Trash2, Sparkles } from "lucide-react";
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
    const accentColor = categoryTheme?.accent || globalTheme.accent;
    const textColor = globalTheme.text;
    const primaryColor = globalTheme.primary;
    
    const popularEffect = isPopular ? `shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] scale-[1.02]` : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border-slate-100/50';
    
    const triggerFly = useAddEffectTrigger();
    const displayTag = badgeText || (isRecommended ? "Chef's Choice" : null);

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`group bg-white rounded-[2rem] ${popularEffect} border-none overflow-hidden flex flex-col hover:shadow-[0_40px_80px_rgba(0,33,30,0.1)] transition-all duration-700 ease-out active:scale-[0.98] relative ${onClick ? 'cursor-pointer' : ''}`}
        >
            {image && (
                <div className="relative w-full aspect-square overflow-hidden" style={{ backgroundColor: globalTheme.background }}>
                    <img
                        src={getDirectImageUrl(image)}
                        alt={title}
                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                    
                    <div 
                        className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" 
                        style={{ backgroundImage: `linear-gradient(to top, ${globalTheme.primary}33, transparent, transparent)` }}
                    />
                    
                    <div 
                        className="absolute top-4 right-4 bg-white px-4 py-1.5 rounded-full shadow-lg z-10 border"
                        style={{ borderColor: `${primaryColor}10` }}
                    >
                        <span className="text-sm font-black" style={{ color: primaryColor }}>₹{price.toFixed(0)}</span>
                    </div>
 
                    {displayTag && (
                        <div 
                            className="absolute top-4 left-4 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] z-10 border border-white/10 shadow-lg"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {displayTag}
                        </div>
                    )}
                    
                    {isPopular && (
                        <div 
                            className="absolute bottom-4 left-4 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest z-10 shadow-md flex items-center"
                            style={{ backgroundColor: globalTheme.secondary, color: primaryColor }}
                        >
                            <Sparkles className="w-3 h-3 mr-2" />
                            Most Loved
                        </div>
                    )}
                </div>
            )}

            <div className="p-8 flex flex-col flex-1 relative z-10">
                <div className="mb-2">
                    <h3 
                        className="font-black text-2xl leading-tight tracking-tight transition-colors duration-500"
                        style={{ color: primaryColor, fontFamily: globalTheme.fontSans }}
                    >
                        {title}
                    </h3>
                </div>
                <p 
                    className="text-[12px] font-medium line-clamp-2 mb-8 leading-relaxed tracking-tight"
                    style={{ color: `${textColor}99`, fontFamily: globalTheme.fontSans }}
                >
                    {description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-black" style={{ color: primaryColor }}>₹{price}</span>
                    
                    <AnimatePresence mode="wait">
                        {quantity > 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                                className="flex items-center rounded-full p-1 border shadow-sm"
                                style={{ backgroundColor: globalTheme.background, borderColor: `${primaryColor}20` }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove?.();
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white transition-all active:scale-90"
                                    style={{ color: primaryColor }}
                                >
                                    {quantity === 1 ? <Trash2 className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4" />}
                                </button>
                                
                                <span className="w-8 text-center text-sm font-black" style={{ color: primaryColor }}>
                                    {quantity}
                                </span>
                                
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (image) triggerFly(id, image, e);
                                        onAdd?.();
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 transition-all font-black"
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
                                className="w-12 h-12 rounded-full text-white flex items-center justify-center transition-all hover:shadow-xl active:scale-95 shadow-lg font-black"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <Plus className="w-6 h-6" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
