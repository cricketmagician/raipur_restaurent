"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mood } from "@/utils/store";

interface EatByMoodSectionProps {
    moods: Mood[];
    activeMoodId: string | null;
    onMoodSelect: (moodId: string) => void;
}

export function EatByMoodSection({ moods, activeMoodId, onMoodSelect }: EatByMoodSectionProps) {
    if (!moods?.length) return null;

    return (
        <section className="space-y-4 py-4">
            <div className="px-6 flex items-center justify-between">
                <h3 className="text-xl font-black text-[#0F3D2E] tracking-tight">Eat by your mood</h3>
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-6 px-6 pb-4 pt-2">
                {moods.map((mood) => {
                    const isActive = activeMoodId === mood.id;
                    return (
                        <motion.button
                            key={mood.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                onMoodSelect(mood.id);
                                if (window.navigator?.vibrate) {
                                    window.navigator.vibrate(50); // Subtle haptic feedback
                                }
                            }}
                            className={`flex items-center gap-3 shrink-0 snap-start px-4 py-3 rounded-2xl transition-all duration-300 border backdrop-blur-md ${
                                isActive 
                                    ? "bg-[#0F3D2E] text-white border-[#0F3D2E] shadow-xl shadow-[#0F3D2E]/20 scale-105" 
                                    : "bg-white/60 text-[#0F3D2E] border-white/50 shadow-sm hover:bg-white/80"
                            }`}
                        >
                            <span className="text-2xl">{mood.icon}</span>
                            <span className={`text-[13px] font-bold tracking-tight ${isActive ? "text-white" : "text-[#0F3D2E]"}`}>
                                {mood.name}
                            </span>
                            
                            {isActive && (
                                <motion.div 
                                    layoutId="mood-active"
                                    className="absolute inset-0 rounded-2xl ring-2 ring-[#0F3D2E]/20 blur-[2px] -z-10"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
}
