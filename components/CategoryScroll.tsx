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
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCategoryChange(category.id)}
                        className={`snap-start flex flex-col items-center min-w-[100px] px-2 py-2`}
                    >
                        <motion.div 
                            animate={{ 
                                scale: isActive ? 1.15 : 1,
                                rotate: isActive ? 0 : 0, // Removed rotate for cleaner native feel
                                y: isActive ? -2 : 0
                            }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-3 transition-all duration-300 transform ${
                                isActive 
                                ? 'bg-slate-900 text-[#FAF7F2] shadow-[0_15px_30px_rgba(0,0,0,0.12)]' // Switched to slate-900 for premium consistency
                                : 'bg-white text-slate-400 border border-slate-100 shadow-sm'
                            }`}
                        >
                            <span className="text-3xl">{category.icon}</span>
                        </motion.div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors duration-300 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                            {category.name}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
