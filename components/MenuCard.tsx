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
    const badgeShadow = isPopular ? 'shadow-[0_0_20px_rgba(212,175,55,0.3)]' : '';
    
    // Determine badge to show
    const displayBadge = badgeText || (isPopular ? "Bestseller" : isRecommended ? "Chef Recommended" : null);
    return (
        <div className="group bg-white rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden flex flex-col hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] transition-all duration-500 active:scale-[0.98]">
            {image && (
                <div className="relative w-full h-56 overflow-hidden">
                    <img
                        src={image}
                        alt={title}
                        className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl z-10 border border-slate-100">
                        <span className="text-base font-black text-black">₹{price.toFixed(2)}</span>
                    </div>
                    {displayBadge && (
                        <div className={`absolute top-4 left-4 ${isPopular ? 'bg-black text-[#D4AF37]' : 'bg-[#D4AF37] text-black'} px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest z-10 shadow-lg ${badgeShadow} border ${isPopular ? 'border-[#D4AF37]/30' : 'border-black/5'}`}>
                            {displayBadge}
                        </div>
                    )}
                </div>
            )}
            <div className="p-5 flex flex-col flex-1">
                <div className="mb-3">
                    <h3 className="font-serif text-2xl text-black leading-tight tracking-tight capitalize group-hover:text-[#D4AF37] transition-colors duration-300">{title.toLowerCase()}</h3>
                </div>
                <p className="text-xs text-slate-500 font-medium line-clamp-2 mb-8 leading-relaxed tracking-tight">{description}</p>
                <div className="mt-auto">
                    <button
                        onClick={onAdd}
                        className="w-full bg-black text-[#D4AF37] py-4 rounded-2xl flex items-center justify-center transition-all hover:bg-[#1A1A1A] hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/5 font-black text-xs uppercase tracking-[0.2em] border border-[#D4AF37]/20 group/btn"
                    >
                        <Plus className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform duration-500" />
                        Add to Bucket
                    </button>
                </div>
            </div>
        </div>
    );
}
