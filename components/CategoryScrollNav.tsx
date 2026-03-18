"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Category {
    id: string;
    name: string;
    icon: string;
    image_url?: string;
}

interface CategoryScrollNavProps {
    categories: Category[];
    activeCategory: string;
    onCategoryClick: (id: string) => void;
    scrolled?: boolean;
}

export function CategoryScrollNav({ categories, activeCategory, onCategoryClick, scrolled }: CategoryScrollNavProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll active item into view
    useEffect(() => {
        const activeItem = document.getElementById(`nav-item-${activeCategory}`);
        if (activeItem && scrollRef.current) {
            const container = scrollRef.current;
            const scrollLeft = activeItem.offsetLeft - (container.offsetWidth / 2) + (activeItem.offsetWidth / 2);
            container.scrollTo({ left: scrollLeft, behavior: "smooth" });
        }
    }, [activeCategory]);

    return (
        <div 
            className={`sticky top-[64px] z-[90] transition-all duration-500 pt-4 pb-6 ${
                scrolled ? "bg-white/90 backdrop-blur-xl shadow-md border-b border-black/5" : "bg-transparent"
            }`}
        >
            <div className="px-4 mb-4">
                <h3 className="text-xl font-black text-[#0F3D2E] tracking-tight">What's on your mind?</h3>
            </div>
            
            <div 
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto no-scrollbar px-4"
            >
                {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    const imageUrl = cat.image_url || null;

                    return (
                        <button
                            key={cat.id}
                            id={`nav-item-${cat.id}`}
                            onClick={() => onCategoryClick(cat.id)}
                            className="flex flex-col items-center gap-3 shrink-0 group"
                        >
                            <div className={`relative w-20 h-20 rounded-full transition-all duration-500 overflow-hidden ${
                                isActive 
                                    ? "ring-4 ring-orange-500 ring-offset-2 scale-110 shadow-xl" 
                                    : "ring-2 ring-black/5 group-hover:ring-black/10"
                            }`}>
                                {imageUrl ? (
                                    <img 
                                        src={imageUrl} 
                                        alt={cat.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-2xl">
                                        {cat.icon}
                                    </div>
                                )}
                                
                                {isActive && (
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute top-0 right-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
                                    >
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </motion.div>
                                )}
                            </div>
                            <span className={`text-[11px] font-black tracking-tight transition-colors duration-300 ${
                                isActive ? "text-orange-500" : "text-[#0F3D2E]/60"
                            }`}>
                                {cat.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
