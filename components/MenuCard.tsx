import React from "react";
import { Plus } from "lucide-react";

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
}

export function MenuCard({ title, description, price, image, onAdd, isPopular, isRecommended, badgeText }: MenuCardProps) {
    const popularEffect = isPopular ? 'shadow-[0_20px_50px_-12px_rgba(212,175,55,0.25)] border-[#D4AF37]/20 scale-[1.02]' : 'shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border-slate-100';
    
    // Determine internal tag if necessary (very subtle)
    const displayTag = badgeText || (isRecommended ? "Chef's Choice" : null);

    return (
        <div className={`group bg-white rounded-[2.5rem] ${popularEffect} border overflow-hidden flex flex-col hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] transition-all duration-700 ease-out active:scale-[0.98]`}>
            {image && (
                <div className="relative w-full h-64 overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl z-10 border border-white/20">
                        <span className="text-lg font-medium text-black">₹{price.toFixed(0)}</span>
                    </div>
                    {displayTag && (
                        <div className="absolute top-6 left-6 bg-black/80 backdrop-blur-md text-[#D4AF37] px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] z-10 border border-[#D4AF37]/30">
                            {displayTag}
                        </div>
                    )}
                    {isPopular && (
                        <div className="absolute bottom-6 left-6 bg-[#D4AF37] text-black px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest z-10 shadow-lg animate-pulse">
                            House Favorite
                        </div>
                    )}
                </div>
            )}
            <div className="p-8 flex flex-col flex-1">
                <div className="mb-4">
                    <h3 className="font-serif text-3xl text-slate-900 leading-tight tracking-tight capitalize group-hover:text-[#D4AF37] transition-colors duration-500">{title.toLowerCase()}</h3>
                </div>
                <p className="text-[13px] text-slate-400 font-medium line-clamp-2 mb-10 leading-relaxed tracking-tight italic">“{description}”</p>
                <div className="mt-auto">
                    <button
                        onClick={onAdd}
                        className="w-full bg-slate-900 text-[#D4AF37] py-5 rounded-[1.5rem] flex items-center justify-center transition-all hover:bg-black hover:shadow-2xl hover:shadow-[#D4AF37]/10 active:scale-95 font-black text-[10px] uppercase tracking-[0.25em] border border-[#D4AF37]/10"
                    >
                        <Plus className="w-4 h-4 mr-3" />
                        Add to Selection
                    </button>
                </div>
            </div>
        </div>
    );
}
