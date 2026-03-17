import React from "react";
import { Plus, Sparkles } from "lucide-react";
import { CategoryTheme } from "@/utils/themes";
import { motion } from "framer-motion";

import { getDirectImageUrl } from "@/utils/image";
import { useAddEffectTrigger } from "./AddEffect";

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
}

export function MenuCard({ id, title, description, price, image, onAdd, isPopular, isRecommended, badgeText, theme, onClick }: MenuCardProps) {
    const accentColor = theme?.accent || "#D4AF37";
    const textColor = theme?.textColor || "#3E2723";
    const popularEffect = isPopular ? `shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border-${accentColor}/20 scale-[1.02]` : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] border-slate-100/50';
    
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
                <div className="relative w-full aspect-square overflow-hidden bg-[#F2F0EB]">
                    <img
                        src={getDirectImageUrl(image)}
                        alt={title}
                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E3932]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="absolute top-4 right-4 bg-white px-4 py-1.5 rounded-full shadow-lg z-10 border border-[#00704A]/5">
                        <span className="text-sm font-black text-[#1E3932]">₹{price.toFixed(0)}</span>
                    </div>

                    {displayTag && (
                        <div className="absolute top-4 left-4 bg-[#00704A] text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] z-10 border border-white/10 shadow-lg">
                            {displayTag}
                        </div>
                    )}
                    
                    {isPopular && (
                        <div 
                            className="absolute bottom-4 left-4 bg-[#D4E9E2] text-[#00704A] px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest z-10 shadow-md flex items-center"
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
                        className="font-serif text-2xl leading-tight tracking-tight transition-colors duration-500 font-black"
                        style={{ color: "#1E3932" }}
                    >
                        {title}
                    </h3>
                </div>
                <p className="text-[12px] text-slate-500 font-medium line-clamp-2 mb-8 leading-relaxed tracking-tight font-sans">
                    {description}
                </p>
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-xl font-black text-[#1E3932]">₹{price}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (image) triggerFly(id, image, e);
                            onAdd?.();
                        }}
                        className="w-12 h-12 rounded-full bg-[#00704A] text-white flex items-center justify-center transition-all hover:bg-[#1E3932] hover:shadow-xl active:scale-95 shadow-lg"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
