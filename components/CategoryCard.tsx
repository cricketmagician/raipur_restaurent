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
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl border border-black/5"
        >
            {/* Background Image with Zoom Effect */}
            <motion.img
                src={getDirectImageUrl(category.imageUrl)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                alt={category.name}
            />
            
            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            {/* Content Container */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                {/* Floating Icon/Badge */}
                <div className="mb-4 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-2xl shadow-inner">
                    {category.icon}
                </div>
                
                {/* Title and Tagline */}
                <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white italic tracking-tighter leading-none">
                        {category.name}
                    </h3>
                    <p className="text-white/60 text-[11px] font-medium leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">
                        "{category.tagline || 'Experience the finest flavors.'}"
                    </p>
                </div>
                
                {/* Action Indicator */}
                <div className="mt-6 flex items-center gap-3">
                    <div className="h-[1px] w-8 bg-[#C8A96A]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C8A96A]">
                        Explore Now
                    </span>
                </div>
            </div>

            {/* Glass Shine Effect on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-45 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>
        </motion.div>
    );
};
