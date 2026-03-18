"use client";

import React from "react";
import { motion } from "framer-motion";
import { SeasonalStory } from "@/utils/store";

interface SeasonalStoriesProps {
    stories: SeasonalStory[];
    onStoryClick: (story: SeasonalStory) => void;
    loading?: boolean;
}

export function SeasonalStories({ stories, onStoryClick, loading }: SeasonalStoriesProps) {
    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 py-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                        <div className="w-20 h-20 rounded-full bg-slate-200 animate-pulse" />
                        <div className="w-12 h-2 bg-slate-200 rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    if (!stories || stories.length === 0) return null;

    return (
        <div className="py-4 space-y-4">
            <div className="px-4">
                <h3 className="text-xl font-black text-[#0F3D2E] tracking-tight">Today's Specials</h3>
            </div>
            
            <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
                {stories.map((story) => (
                    <button
                        key={story.id}
                        onClick={() => onStoryClick(story)}
                        className="flex flex-col items-center gap-3 shrink-0 group"
                    >
                        <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#C8A96A] to-orange-500 ring-2 ring-white shadow-xl group-active:scale-95 transition-all">
                            <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-white">
                                <img 
                                    src={story.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=256&auto=format"} 
                                    alt={story.label}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>
                        <span className="text-[11px] font-black tracking-tight text-[#0F3D2E]/80">
                            {story.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
