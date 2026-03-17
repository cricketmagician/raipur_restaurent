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
        <header className="mb-12">
            <motion.button 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={onBack}
                className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.3em] mb-8 opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: theme.primary }}
            >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Discovery</span>
            </motion.button>
            
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h1 className="text-6xl font-black italic tracking-tighter mb-4" style={{ color: theme.primary }}>
                    {name}
                </h1>
                <p className="text-lg font-medium opacity-60 italic" style={{ color: theme.primary }}>
                    “{tagline}”
                </p>
            </motion.div>
        </header>
    );
}
