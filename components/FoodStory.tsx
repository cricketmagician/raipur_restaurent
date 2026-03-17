"use client";

import React from "react";
import { motion } from "framer-motion";

interface StoryItem {
    id: string;
    image: string;
    label: string;
    type: string;
}

interface FoodStoryProps {
    stories: StoryItem[];
    onStoryClick?: (id: string, index: number) => void;
}

export function FoodStory({ stories, onStoryClick }: FoodStoryProps) {
    return (
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5">
            {stories.map((story) => (
                <motion.button
                    key={story.id}
                    onClick={() => onStoryClick?.(story.id, stories.indexOf(story))}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center shrink-0 space-y-3 group"
                >
                    <div className="relative w-[85px] h-[85px] rounded-full p-[3px] bg-gradient-to-tr from-amber-500 via-[#F55D2C] to-red-500 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                        <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-white">
                            <img 
                                src={story.image} 
                                alt={story.label} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#F55D2C] text-white text-[7px] font-black px-2.5 py-1 rounded-full border-2 border-white shadow-xl uppercase tracking-widest whitespace-nowrap scale-90">
                            {story.type}
                        </div>
                    </div>
                    <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest text-center max-w-[90px] leading-tight truncate px-1">{story.label}</span>
                </motion.button>
            ))}
        </div>
    );
}
