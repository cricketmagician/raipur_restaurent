"use client";

import React from "react";
import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { getDirectImageUrl } from "@/utils/image";

interface MinimalMenuItemCardProps {
    item: any;
    quantity: number;
    onAdd: () => void;
    onRemove: () => void;
    theme?: any;
}

export function MinimalMenuItemCard({ item, quantity, onAdd, onRemove, theme }: MinimalMenuItemCardProps) {
    return (
        <motion.div 
            layout
            className="bg-white rounded-[2rem] p-4 flex items-center gap-4 shadow-sm border border-black/5 active:scale-[0.98] transition-all"
        >
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-black/5">
                <img 
                    src={getDirectImageUrl(item.image_url)} 
                    className="w-full h-full object-cover" 
                    alt={item.title} 
                />
            </div>

            <div className="flex-1 min-w-0 pr-2">
                <h4 className="text-base font-semibold tracking-tight text-[#0F3D2E] truncate">{item.title}</h4>
                <p className="text-[#0F3D2E]/40 text-[10px] uppercase font-black tracking-widest mt-1">₹{item.price}</p>
                <p className="text-[#0F3D2E]/60 text-[11px] leading-relaxed line-clamp-2 italic font-medium mt-2">
                    {item.description || "Handcrafted with premium ingredients."}
                </p>
            </div>

            <div className="flex flex-col items-center gap-2">
                {quantity > 0 ? (
                    <div className="flex flex-col items-center gap-2 bg-[#0F3D2E]/5 rounded-full p-1 border border-[#0F3D2E]/10">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAdd(); }} 
                            className="w-8 h-8 rounded-full bg-[#0F3D2E] text-white flex items-center justify-center shadow-md active:scale-90 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-black text-[#0F3D2E] min-w-[1rem] text-center">{quantity}</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRemove(); }} 
                            className="w-8 h-8 rounded-full bg-white text-[#0F3D2E] flex items-center justify-center border border-[#0F3D2E]/10 shadow-sm active:scale-90 transition-all"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onAdd(); }}
                        className="w-10 h-10 rounded-full bg-[#0F3D2E]/5 flex items-center justify-center text-[#0F3D2E] hover:bg-[#0F3D2E] hover:text-white transition-all active:scale-90"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                )}
            </div>
        </motion.div>
    );
}
