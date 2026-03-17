"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface CategoryHeroHeaderProps {
    name: string;
    tagline: string;
    theme: any;
    onBack: () => void;
}

export function CategoryHeroHeader({ name, tagline, theme, onBack }: CategoryHeroHeaderProps) {
    return (
        <header className="mb-10">
            <motion.button 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={onBack}
                className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em] mb-6 opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: theme.primary }}
            >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Discovery</span>
            </motion.button>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-[2rem] border bg-white/82 backdrop-blur-xl px-5 py-5 shadow-[0_24px_80px_-44px_rgba(15,23,42,0.4)]"
                style={{ borderColor: `${theme.primary}10` }}
            >
                <p className="text-[10px] font-black uppercase tracking-[0.24em] opacity-40 mb-2" style={{ color: theme.primary }}>
                    Category
                </p>
                <h1 className="text-4xl font-black tracking-tight mb-2" style={{ color: theme.primary }}>
                    {name}
                </h1>
                <p className="text-sm font-medium opacity-60 leading-6" style={{ color: theme.primary }}>
                    {tagline}
                </p>
            </motion.div>
        </header>
    );
}
