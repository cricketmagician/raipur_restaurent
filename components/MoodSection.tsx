"use client";

import React from "react";
import { motion } from "framer-motion";

interface Mood {
    id: string;
    label: string;
    icon: string;
    color: string;
    description: string;
}

interface MoodSectionProps {
    onMoodClick: (id: string) => void;
}

export function MoodSection({ onMoodClick }: MoodSectionProps) {
    const moods: Mood[] = [
        { id: "light", label: "Light", icon: "😌", color: "#D4E9E2", description: "Fresh & breezy" },
        { id: "filling", label: "Filling", icon: "😋", color: "#F2F0EB", description: "Satisfy hunger" },
        { id: "sweet", label: "Sweet", icon: "🍫", color: "#EED7C5", description: "Pure indulgence" },
        { id: "spicy", label: "Spicy", icon: "🔥", color: "#FFDADA", description: "Kick it up" },
    ];

    return (
        <section className="space-y-6">
            <h3 className="text-[10px] font-black text-[#1E3932] uppercase tracking-[0.3em] px-2">
                🌈 Pick a Mood
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {moods.map((mood) => (
                    <motion.button
                        key={mood.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onMoodClick(mood.id)}
                        className="p-6 rounded-[2rem] text-left relative overflow-hidden group border border-transparent hover:border-[#00704A]/20 transition-all shadow-sm"
                        style={{ backgroundColor: mood.color }}
                    >
                        <div className="relative z-10">
                            <span className="text-3xl mb-3 block group-hover:scale-125 transition-transform duration-500 origin-left">
                                {mood.icon}
                            </span>
                            <h4 className="text-lg font-black text-[#1E3932] tracking-tighter">
                                {mood.label}
                            </h4>
                            <p className="text-[10px] font-bold text-[#1E3932]/60 uppercase tracking-widest mt-1">
                                {mood.description}
                            </p>
                        </div>
                        {/* Subtle pattern background */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors" />
                    </motion.button>
                ))}
            </div>
        </section>
    );
}
