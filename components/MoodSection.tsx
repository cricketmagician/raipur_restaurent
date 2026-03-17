"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/utils/themes";
import { useHotelBranding } from "@/utils/store";
import { useParams } from "next/navigation";

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
    const params = useParams();
    const hotelSlug = params?.hotel_slug as string;
    const { branding } = useHotelBranding(hotelSlug);
    const theme = useTheme(branding);

    const moods: Mood[] = [
        { id: "light", label: "Light", icon: "😌", color: `${theme.primary}1a`, description: "Fresh & breezy" },
        { id: "filling", label: "Filling", icon: "😋", color: `${theme.primary}1a`, description: "Satisfy hunger" },
        { id: "sweet", label: "Sweet", icon: "🍫", color: `${theme.primary}1a`, description: "Pure indulgence" },
        { id: "spicy", label: "Spicy", icon: "🔥", color: `${theme.primary}1a`, description: "Kick it up" },
    ];

    return (
        <section className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] px-2" style={{ color: theme.primary }}>
                🌈 Pick a Mood
            </h3>

            <div className="grid grid-cols-2 gap-4">
                {moods.map((mood) => (
                    <motion.button
                        key={mood.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onMoodClick(mood.id)}
                        className="p-6 text-left relative overflow-hidden group border transition-all shadow-sm"
                        style={{ 
                            backgroundColor: mood.color, 
                            borderRadius: theme.radius,
                            borderColor: `${theme.primary}10`
                        }}
                    >
                        <div className="relative z-10">
                            <span className="text-3xl mb-3 block group-hover:scale-125 transition-transform duration-500 origin-left">
                                {mood.icon}
                            </span>
                            <h4 className="text-lg font-black tracking-tighter" style={{ color: theme.text }}>
                                {mood.label}
                            </h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60" style={{ color: theme.text }}>
                                {mood.description}
                            </p>
                        </div>
                        {/* Subtle pattern background */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
                    </motion.button>
                ))}
            </div>
        </section>
    );
}
