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
}

export function FoodStory({ stories }: FoodStoryProps) {
    return (
        <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5">
            {stories.map((story) => (
                <motion.button
                    key={story.id}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center shrink-0 space-y-3 group"
                >
                    <div className="relative w-[110px] h-[110px] rounded-full p-[2px] bg-gradient-to-tr from-amber-500 via-[#F55D2C] to-red-500 shadow-[0_8px_20px_rgba(0,0,0,0.08)]">
                        <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden bg-white">
                            <img 
                                src={story.image} 
                                alt={story.label} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-[#F55D2C] text-white text-[8px] font-black px-2.5 py-1 rounded-full border-2 border-white shadow-md uppercase tracking-widest">
                            {story.type}
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{story.label}</span>
                </motion.button>
            ))}
        </div>
    );
}
