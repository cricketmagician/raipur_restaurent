"use client";

import React from "react";
import { motion } from "framer-motion";

interface CategorySectionHeaderProps {
    name: string;
    tagline: string;
    imageUrl?: string;
}

export function CategorySectionHeader({ name, tagline, imageUrl }: CategorySectionHeaderProps) {
    return (
        <div className="relative w-full h-[180px] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl">
            {imageUrl ? (
                <img src={imageUrl} className="absolute inset-0 w-full h-full object-cover" alt={name} />
            ) : (
                <div className="absolute inset-0 bg-[#0F3D2E]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-white text-3xl font-semibold tracking-tight leading-none mb-2"
                >
                    {name}
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-white/60 text-xs font-medium italic"
                >
                    {tagline}
                </motion.p>
            </div>
        </div>
    );
}
