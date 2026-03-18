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
            <div className="px-4 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] opacity-45 text-[#0F3D2E]">
                    Eat by your mood
                </p>
                <h3 className="text-xl font-black tracking-tight text-[#0F3D2E]">
                    What are you craving today?
                </h3>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-2 pt-1">
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
                            className={`relative min-w-[140px] snap-start overflow-hidden rounded-[1.15rem] border px-4 py-4 text-left transition-all duration-300 backdrop-blur-md ${
                                isActive
                                    ? "bg-[#0F3D2E] text-white border-[#0F3D2E] shadow-[0_18px_40px_rgba(15,61,46,0.22)] scale-[1.02]"
                                    : "bg-white/65 text-[#0F3D2E] border-white/55 shadow-[0_10px_26px_rgba(15,23,42,0.06)] hover:bg-white/80"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <span className="text-2xl">{mood.icon}</span>
                                {isActive && (
                                    <span className="rounded-full bg-white/15 px-2 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-white">
                                        Selected
                                    </span>
                                )}
                            </div>
                            <div className="mt-4 space-y-1">
                                <span className={`block text-[13px] font-black tracking-tight ${isActive ? "text-white" : "text-[#0F3D2E]"}`}>
                                    {mood.name}
                                </span>
                                <span className={`block text-[10px] font-semibold leading-4 ${isActive ? "text-white/70" : "text-[#0F3D2E]/60"}`}>
                                    {mood.tag_linked || "Tap to reveal picks"}
                                </span>
                            </div>

                            {isActive && (
                                <motion.div 
                                    layoutId="mood-active"
                                    className="pointer-events-none absolute inset-0 rounded-[1.15rem] ring-2 ring-white/15"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
}
