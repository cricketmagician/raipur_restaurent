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

            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-4 px-4 pb-4 pt-2">
                {moods.map((mood) => {
                    const isActive = activeMoodId === mood.id;
                    const moodImage = (mood as any).image; // Cast as any temporarily if TS complains, though we added it to interface
                    
                    return (
                        <motion.button
                            key={mood.id}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                onMoodSelect(mood.id);
                                if (window.navigator?.vibrate) {
                                    window.navigator.vibrate(50);
                                }
                            }}
                            className={`relative min-w-[150px] min-h-[160px] snap-start overflow-hidden rounded-[1.25rem] border text-left transition-all duration-300 ${
                                isActive
                                    ? "border-[#C8A96A] shadow-[0_18px_40px_rgba(200,169,106,0.3)] scale-[1.02]"
                                    : "border-white/10 shadow-lg hover:border-white/20"
                            }`}
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                {moodImage ? (
                                    <img 
                                        src={moodImage} 
                                        alt={mood.name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#0F3D2E]" />
                                )}
                                {/* Gradient Overlay for text readability */}
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 transition-opacity duration-300 ${isActive ? 'opacity-90' : 'opacity-70 group-hover:opacity-80'}`} />
                            </div>

                            <div className="relative h-full flex flex-col justify-between p-4 z-10">
                                <div className="flex items-start justify-between gap-3">
                                    <span className="text-2xl drop-shadow-lg">{mood.icon}</span>
                                    {isActive && (
                                        <span className="rounded-full bg-[#C8A96A] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-white shadow-md">
                                            Selected
                                        </span>
                                    )}
                                </div>
                                <div className="mt-auto pt-6 space-y-1">
                                    <span className={`block text-[15px] font-black tracking-tight text-white drop-shadow-md`}>
                                        {mood.name}
                                    </span>
                                    <span className={`block text-[10px] font-bold leading-4 ${isActive ? "text-[#C8A96A]" : "text-white/75"}`}>
                                        {mood.tag_linked || "Tap to reveal picks"}
                                    </span>
                                </div>
                            </div>

                            {isActive && (
                                <motion.div 
                                    layoutId="mood-active"
                                    className="pointer-events-none absolute inset-0 rounded-[1.25rem] ring-2 ring-[#C8A96A] ring-offset-2 ring-offset-black/50"
                                />
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </section>
    );
}
