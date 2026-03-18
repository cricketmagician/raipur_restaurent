"use client";

import { motion } from "framer-motion";
import { getDirectImageUrl } from "@/utils/image";

interface CategoryCardProps {
    category: {
        id: string;
        name: string;
        icon: string | React.ReactNode;
        tagline?: string;
        imageUrl?: string;
    };
    onClick: () => void;
}

export const CategoryCard = ({ category, onClick }: CategoryCardProps) => {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="group flex flex-col items-center gap-3 cursor-pointer"
        >
            {/* Circular Image Container with Premium Glow */}
            <div className="relative w-28 h-28 rounded-full p-[3px] bg-gradient-to-tr from-[#C8A96A] via-white/20 to-[#C8A96A]/30 shadow-xl group-hover:shadow-[#C8A96A]/20 transition-all duration-500">
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/50 bg-[#F5F1E8]">
                    <motion.img
                        src={getDirectImageUrl(category.imageUrl)}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                        alt={category.name}
                    />
                    
                    {/* Subtle Overlay to make icon pop */}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all duration-500" />
                </div>

                {/* Floating Icon Badge */}
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-lg border border-[#C8A96A]/20 z-10"
                >
                    {category.icon}
                </motion.div>
            </div>
            
            {/* Title - Elegant & Minimal */}
            <div className="text-center">
                <h3 className="text-[11px] font-black text-[#0F3D2E] uppercase tracking-[0.2em] leading-tight group-hover:text-[#C8A96A] transition-colors">
                    {category.name}
                </h3>
                <div className="mt-1 h-[2px] w-0 bg-[#C8A96A] mx-auto group-hover:w-4 transition-all duration-300" />
            </div>
        </motion.div>
    );
};
