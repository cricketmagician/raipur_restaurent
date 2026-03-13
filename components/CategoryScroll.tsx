"use client";

import React from "react";
import { motion } from "framer-motion";

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface CategoryScrollProps {
    categories: Category[];
    activeCategory: string;
    onCategoryChange: (id: string) => void;
}

export function CategoryScroll({ categories, activeCategory, onCategoryChange }: CategoryScrollProps) {
    return (
        <div className="sticky top-[80px] z-[50] -mx-5 px-5 py-4 bg-white/60 backdrop-blur-xl border-b border-white/20 mb-8 flex overflow-x-auto no-scrollbar snap-x">
            {categories.map((category) => {
                const isActive = activeCategory === category.id;
                return (
                    <motion.button
                        key={category.id}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onCategoryChange(category.id)}
                        className={`snap-start flex flex-col items-center min-w-[90px] px-2`}
                    >
                        <motion.div 
                            animate={{ 
                                scale: isActive ? 1.1 : 1,
                                rotate: isActive ? 6 : 0,
                                y: isActive ? -4 : 0
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            className={`w-18 h-18 rounded-[2rem] flex items-center justify-center mb-3 transition-all duration-300 transform ${
                                isActive 
                                ? 'bg-[#F55D2C] text-white shadow-[0_12px_24px_rgba(245,93,44,0.3)]' 
                                : 'bg-slate-100/80 text-slate-400 border border-transparent'
                            }`}
                        >
                            <span className="text-3xl">{category.icon}</span>
                        </motion.div>
                        <span className={`text-[11px] font-black uppercase tracking-widest text-center transition-colors duration-300 ${isActive ? 'text-[#F55D2C]' : 'text-slate-400'}`}>
                            {category.name}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
