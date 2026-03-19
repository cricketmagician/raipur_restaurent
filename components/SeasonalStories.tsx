"use client";

import React from "react";
import { motion } from "framer-motion";
import { SeasonalStory } from "@/utils/store";
import { getDirectImageUrl } from "@/utils/image";

interface SeasonalStoriesProps {
    stories: SeasonalStory[];
    onStoryClick: (story: SeasonalStory) => void;
    loading?: boolean;
}

export function SeasonalStories({ stories, onStoryClick, loading }: SeasonalStoriesProps) {
    if (loading) {
        return (
            <div className="space-y-4 py-4">
                <div className="px-4">
                    <div className="h-4 w-32 rounded-full bg-slate-200 animate-pulse" />
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="min-w-[220px] h-[250px] rounded-[1.8rem] bg-slate-200 animate-pulse shrink-0" />
                    ))}
                </div>
            </div>
        );
    }

    if (!stories || stories.length === 0) return null;

    return (
        <section className="space-y-4 py-4">
            <div className="flex items-end justify-between gap-3 px-4">
                <div>
                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] opacity-45 text-[#0F3D2E]">
                        Seasonal Stories
                    </p>
                    <h3 className="text-xl font-black tracking-tight text-[#0F3D2E]">
                        Tap a story to open the feature.
                    </h3>
                </div>
                <span className="rounded-full border border-[#C8A96A]/20 bg-white/80 px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-[#C8A96A] shadow-sm">
                    Live
                </span>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 snap-x snap-mandatory">
                {stories.map((story) => (
                    <button
                        key={story.id}
                        onClick={() => onStoryClick(story)}
                        className="min-w-[160px] snap-start overflow-hidden rounded-[1.4rem] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.06)] border border-black/5 text-left group active:scale-[0.98] transition-transform"
                    >
                        <div className="relative h-[200px] overflow-hidden">
                            <img
                                src={getDirectImageUrl(story.image_url) || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=900&auto=format"}
                                alt={story.label}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                            <div className="absolute left-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md">
                                {story.type || "Story"}
                            </div>
                            <div className="absolute inset-x-3 bottom-3 space-y-1.5 text-white">
                                <h4 className="text-[1.1rem] font-black tracking-tight leading-[1.05]">
                                    {story.label}
                                </h4>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">
                                        {story.price ? `₹${story.price}` : "Highlight"}
                                    </span>
                                    <span className="rounded-full bg-white px-2 py-1 text-[8px] font-black uppercase tracking-[0.15em] text-[#0F3D2E]">
                                        Open
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
