"use client";

import React from "react";
import { motion } from "framer-motion";
import { CATEGORY_THEMES } from "@/utils/themes";
import { Sparkles } from "lucide-react";

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface CategoryDiscoveryGridProps {
    categories: Category[];
    onCategoryClick: (id: string) => void;
    activeCategory: string;
    theme: any;
}

export function CategoryDiscoveryGrid({ categories, onCategoryClick, activeCategory, theme }: CategoryDiscoveryGridProps) {
    return (
        <div className="space-y-8">
            <div className="px-1">
                <h2 className="text-4xl font-black tracking-tighter mb-2" style={{ color: theme.primary }}>
                    What are you craving?
                </h2>
                <p className="text-sm font-medium opacity-60 italic">
                    Explore our handcrafted selection
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => {
                    const categoryTheme = CATEGORY_THEMES[category.id] || CATEGORY_THEMES.all;
                    const isActive = activeCategory === category.id;

                    return (
                        <motion.button
                            key={category.id}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onCategoryClick(category.id)}
                            className="relative aspect-square rounded-[2rem] overflow-hidden text-left p-6 flex flex-col justify-end group shadow-lg transition-shadow hover:shadow-2xl"
                            style={{ 
                                border: `1px solid ${categoryTheme.accent}20`
                            }}
                        >
                            <img 
                                src={categoryTheme.image} 
                                alt={category.name} 
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                            />
                            
                            <div 
                                className="absolute inset-0 bg-gradient-to-t via-black/20 to-transparent opacity-80" 
                                style={{ backgroundImage: `linear-gradient(to top, ${categoryTheme.accent}aa, transparent)` }}
                            />

                            <div className="absolute top-6 right-6 text-2xl group-hover:scale-125 transition-transform duration-500 z-10">
                                {category.icon}
                            </div>
                            
                            <div className="relative z-10">
                                <h3 className="text-xl font-black italic tracking-tight mb-1 text-white">
                                    {category.name}
                                </h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-white">
                                    {categoryTheme.tagline}
                                </p>
                            </div>

                            {isActive && (
                                <motion.div 
                                    layoutId="active-highlight"
                                    className="absolute inset-0 border-4 rounded-[2rem] z-20 pointer-events-none"
                                    style={{ borderColor: categoryTheme.accent }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
