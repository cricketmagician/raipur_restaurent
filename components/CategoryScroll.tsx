"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";

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
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);
    return (
        <div 
            className="sticky top-[80px] z-[50] -mx-5 px-5 py-4 backdrop-blur-xl border-b mb-8 flex overflow-x-auto no-scrollbar snap-x"
            style={{ backgroundColor: `${theme.background}99`, borderColor: `${theme.primary}10` }}
        >
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
                            className={`w-20 h-20 flex items-center justify-center mb-3 transition-all duration-300 transform shadow-sm`}
                            style={{ 
                                borderRadius: theme.radius,
                                backgroundColor: isActive ? theme.primary : 'white',
                                color: isActive ? theme.background : `${theme.primary}66`,
                                border: isActive ? 'none' : `1px solid ${theme.primary}10`,
                                boxShadow: isActive ? `0 15px 30px ${theme.primary}20` : 'none'
                            }}
                        >
                            <span className="text-3xl">{category.icon}</span>
                        </motion.div>
                        <span 
                            className={`text-[10px] font-black uppercase tracking-[0.2em] text-center transition-colors duration-300`}
                            style={{ color: isActive ? theme.primary : `${theme.primary}66` }}
                        >
                            {category.name}
                        </span>
                    </motion.button>
                );
            })}
        </div>
    );
}
