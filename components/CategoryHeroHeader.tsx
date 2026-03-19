"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { getDirectImageUrl } from "@/utils/image";

interface CategoryHeroHeaderProps {
    name: string;
    tagline: string;
    heroImage?: string;
    theme: any;
    onBack: () => void;
}

export function CategoryHeroHeader({ name, tagline, heroImage, theme, onBack }: CategoryHeroHeaderProps) {
    return (
        <header className="-mx-6 -mt-[128px] mb-8 relative z-0">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative h-[296px] overflow-hidden rounded-b-[2.2rem] shadow-[0_24px_90px_-38px_rgba(0,0,0,0.45)]"
                style={{ backgroundColor: theme.primary }}
            >
                {heroImage ? (
                    <img
                        src={getDirectImageUrl(heroImage)}
                        alt={name}
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/78" />
                <div
                    className="absolute inset-0 opacity-80"
                    style={{ background: `radial-gradient(circle at top right, ${theme.accent}40, transparent 44%)` }}
                />
                
                {/* Top overlay to darken under the status bar / global header */}
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-[2px]" />

                <motion.button
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="absolute left-5 top-[148px] z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white/90 backdrop-blur-md shadow-lg transition-all active:scale-95"
                >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    <span>Discovery</span>
                </motion.button>

                <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-10 text-white">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/65">
                        Category
                    </p>
                    <h1
                        className="max-w-[12ch] text-[2.25rem] font-black leading-[0.92] tracking-[-0.05em]"
                        style={{ fontFamily: theme.fontSerif }}
                    >
                        {name}
                    </h1>
                    <p className="mt-2 max-w-[26ch] text-sm font-medium leading-5 text-white/82">
                        {tagline}
                    </p>
                </div>
            </motion.div>
        </header>
    );
}
