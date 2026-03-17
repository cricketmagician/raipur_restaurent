import React from "react";
import { Plus, Sparkles } from "lucide-react";
import { CategoryTheme } from "@/utils/themes";
import { motion } from "framer-motion";

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
    
    const displayTag = badgeText || (isRecommended ? "Chef's Choice" : null);

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onClick}
            className={`group bg-white rounded-[3rem] ${popularEffect} border overflow-hidden flex flex-col hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] transition-all duration-700 ease-out active:scale-[0.98] relative ${onClick ? 'cursor-pointer' : ''}`}
        >
            {/* Special Effects Layer */}
            {theme?.effect === 'glow' && (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" />
            )}
            
            {image && (
                <div className="relative w-full h-72 overflow-hidden bg-slate-50">
                    <img
                        src={image}
                        alt={title}
                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                    
                    {/* Theme-specific Overlays */}
                    {theme?.effect === 'shine' && (
                        <motion.div 
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
                        />
                    )}

                    {theme?.effect === 'condensation' && (
                        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 100 100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] shrink-0" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl z-10 border border-white/20">
                        <span className="text-xl font-serif italic text-slate-900">₹{price.toFixed(0)}</span>
                    </div>

                    {displayTag && (
                        <div className="absolute top-6 left-6 bg-slate-900/80 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] z-10 border border-white/10">
                            {displayTag}
                        </div>
                    )}
                    
                    {isPopular && (
                        <div 
                            style={{ backgroundColor: accentColor }}
                            className="absolute bottom-6 left-6 text-white px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest z-10 shadow-lg flex items-center"
                        >
                            <Sparkles className="w-3 h-3 mr-2" />
                            Most Loved
                        </div>
                    )}
                </div>
            )}

            <div className="p-10 flex flex-col flex-1 relative z-10">
                <div className="mb-4">
                    <h3 
                        className="font-serif text-3xl leading-tight tracking-tight transition-colors duration-500 italic"
                        style={{ color: textColor }}
                    >
                        {title}
                    </h3>
                </div>
                <p className="text-[14px] text-slate-400 font-medium line-clamp-2 mb-10 leading-relaxed tracking-tight italic opacity-70">
                    “{description}”
                </p>
                <div className="mt-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdd?.();
                        }}
                        style={{ backgroundColor: textColor, color: theme?.id === 'all' ? accentColor : '#FFFFFF' }}
                        className="w-full py-6 rounded-[2rem] flex items-center justify-center transition-all hover:opacity-90 hover:shadow-2xl active:scale-95 font-serif italic text-xl shadow-xl"
                    >
                        <Plus className="w-5 h-5 mr-3 opacity-40" />
                        Add to Cravings
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
