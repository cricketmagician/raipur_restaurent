"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface Category {
    id: string;
    name: string;
    icon: string;
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
            className={`sticky top-[60px] z-[90] transition-all duration-500 py-4 ${
                scrolled ? "bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm" : "bg-transparent"
            }`}
        >
            <div 
                ref={scrollRef}
                className="flex gap-3 overflow-x-auto no-scrollbar px-6"
            >
                {categories.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            id={`nav-item-${cat.id}`}
                            onClick={() => onCategoryClick(cat.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 shrink-0 whitespace-nowrap ${
                                isActive 
                                    ? "bg-[#0F3D2E] text-white scale-105 shadow-lg" 
                                    : "bg-white/60 backdrop-blur-md border border-white/40 text-[#0F3D2E]/60 hover:bg-white/80"
                            }`}
                        >
                            <span className="text-sm">{cat.icon}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
