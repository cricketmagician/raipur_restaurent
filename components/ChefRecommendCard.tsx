"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Plus } from "lucide-react";
import { getDirectImageUrl } from "@/utils/image";

interface ChefRecommendCardProps {
    item: any;
    onAdd: () => void;
    onClick: () => void;
    theme: any;
}

export function ChefRecommendCard({ item, onAdd, onClick, theme }: ChefRecommendCardProps) {
    return (
        <motion.div 
            whileHover={{ y: -10 }}
            onClick={onClick}
            className="flex-none w-[280px] aspect-[4/5] rounded-[2.5rem] overflow-hidden relative group cursor-pointer shadow-xl hover:shadow-2xl transition-all"
            style={{ backgroundColor: theme.surface }}
        >
            <img 
                src={getDirectImageUrl(item.image_url)} 
                alt={item.title} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            <div className="absolute top-6 left-6 flex items-center bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
                <Sparkles className="w-3 h-3 text-yellow-400 mr-2" />
                <span className="text-[8px] font-black italic text-white uppercase tracking-widest">Chef Recommends</span>
            </div>

            <div className="absolute bottom-8 left-8 right-8 text-white">
                <h3 className="text-2xl font-black italic mb-2 leading-tight">
                    {item.title}
                </h3>
                <div className="flex items-center justify-between">
                    <span className="text-lg font-black tracking-tighter">₹{item.price}</span>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdd();
                        }}
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
